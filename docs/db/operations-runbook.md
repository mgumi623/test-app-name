# 医療DX基盤DBスキーマ ドキュメント（2025-08-23版）

本書は提示いただいた SQL スキーマを、そのまま実装の意図・関係・利用例まで含めて“Docs”化したものです。**注意:** スキーマ先頭にある WARNING の通り、このDDLは実行順や外部依存のため**そのまま実行することを意図していません**（`auth.users` 等の外部オブジェクト/拡張、ユーザー定義型の事前作成、RLS/インデックスの追加が必要）。

---

## 1. 目的と全体設計方針

* **対象業務**: チャット（AI/ユーザー）、お知らせ掲示、アプリメニュー、シフト作成・配信、利用/エラー監査、組織・職員マスタ、ユーザー×病院所属管理。
* **多院運用**: `hospitals` を中心に、ほぼ全ての実データは hospital スコープを持つ（`hospital_id` 経由）。
* **マスタ分離**: 職種・役職・部署・チームはマスタ化（`professions` / `positions` / `departments` / `teams`）。職員は `staff` に正規化。
* **設定の二層化**: 固定スキーマ設定（`admin_settings`）＋キー値設定（`admin_settings_kv`／`settings`）。
* **監査・観測性**: 操作監査（`audit_logs`）、利用ログ（`app_usage_logs`）、エラーログ（`error_logs`）を分離。
* **メッセージ検索性**: `chat_messages.ts_text` に tsvector。将来的に GIN 索引推奨。
* **ID体系**: すべて `uuid`（一部 bigint 単一行設定を除く）。`auth.users` をアイデンティティの根として `profiles` に拡張属性を保持。

---

## 2. 依存オブジェクト・前提

* **外部スキーマ**: `auth.users`（Supabase 既定）。
* **拡張**: `gen_random_uuid()`（pgcrypto）／`to_tsvector()`（pg\_trgm/標準全文検索）。
* **ユーザー定義型**: `chat_messages.sender_kind` は `USER-DEFINED`（事前に ENUM or 参照テーブルが必要）。例: `CREATE TYPE sender_kind AS ENUM ('user','assistant','system','tool');` 等。
* **タイムゾーン**: `now()` と `timezone('utc', now())`が混在。運用規約に合わせて統一を推奨。

---

## 3. ER（概念）関係サマリ

* **病院**: `hospitals (1) — (N) departments / positions / teams / hospital_apps / shift_months / staff / notices`。
* **ユーザー**: `auth.users (1) — (1) profiles`、`auth.users (1) — (N) user_hospital_memberships / login_sessions / app_usage_logs`。
* **アプリ**: `apps (1) — (N) hospital_apps`、`apps (1) — (N) chat_sessions`、`apps (1) — (N) error_logs / app_usage_logs`。
* **チャット**: `chat_sessions (1) — (N) chat_messages / chat_session_members / error_logs`、`chat_messages (1) — (N) chat_message_reads`。
* **シフト**: `shift_months (1) — (N) shift_details / shift_generation_logs`、`staff (1) — (N) shift_details`。
* **お知らせ**: `notices (1) — (N) notice_reads`。`notices` は hospital 必須、department/team は任意。

---

## 4. テーブル定義（列・制約・要点）

> 各表の列: **name / type / NOT NULL / default / constraints・参照 / 説明**

### 4.1 `admin_settings`（単一行の全体管理フラグ）

| 列                         | 型           | NN | 既定                       | 制約/参照               | 説明             |
| ------------------------- | ----------- | -- | ------------------------ | ------------------- | -------------- |
| id                        | bigint      | ✓  | `1`                      | `CHECK (id=1)` / PK | 単一行固定化のためのID固定 |
| created\_at               | timestamptz | ✓  | `timezone('utc', now())` |                     | 作成時刻           |
| updated\_at               | timestamptz | ✓  | `timezone('utc', now())` |                     | 更新時刻           |
| weekly\_five\_shifts      | boolean     |    | `true`                   |                     | 週5シフト前提フラグ     |
| week\_starts\_sunday      | boolean     |    | `true`                   |                     | 週開始曜日=日曜       |
| senior\_staff\_adjustment | boolean     |    | `true`                   |                     | シニア配慮アルゴリズム有効化 |

### 4.2 `admin_settings_kv`（運用中のキー値設定）

| 列           | 型           | NN | 既定                  | 制約/参照  | 説明                   |
| ----------- | ----------- | -- | ------------------- | ------ | -------------------- |
| id          | uuid        | ✓  | `gen_random_uuid()` | PK     | 識別子                  |
| key         | text        | ✓  |                     | UNIQUE | 設定キー（人間可読）           |
| value\_bool | boolean     |    |                     |        | ブール値                 |
| value\_int  | integer     |    |                     |        | 整数                   |
| value\_text | text        |    |                     |        | テキスト                 |
| value\_json | jsonb       |    |                     |        | JSON 値               |
| updated\_by | uuid        |    |                     |        | `auth.users(id)` を想定 |
| updated\_at | timestamptz | ✓  | `now()`             |        | 更新時刻                 |

### 4.3 `apps`（提供アプリマスタ）

| 列                   | 型           | NN | 既定                  | 制約/参照  | 説明          |
| ------------------- | ----------- | -- | ------------------- | ------ | ----------- |
| id                  | uuid        | ✓  | `gen_random_uuid()` | PK     | アプリID       |
| name                | text        | ✓  |                     | UNIQUE | アプリ名        |
| description         | text        |    |                     |        | 説明          |
| icon                | text        |    |                     |        | アイコンURL/識別子 |
| color               | text        |    |                     |        | テーマカラー      |
| dify\_api\_id       | text        |    |                     |        | Dify連携用ID   |
| is\_active          | boolean     | ✓  | `true`              |        | 有効フラグ       |
| allow\_file\_upload | boolean     | ✓  | `false`             |        | ファイル投稿許可    |
| sort\_order         | integer     |    |                     |        | 表示順         |
| created\_at         | timestamptz | ✓  | `now()`             |        | 作成時刻        |
| updated\_at         | timestamptz | ✓  | `now()`             |        | 更新時刻        |

### 4.4 `hospital_apps`（病院ごとのアプリ有効化）

| 列            | 型           | NN | 既定                  | 制約/参照              | 説明    |
| ------------ | ----------- | -- | ------------------- | ------------------ | ----- |
| id           | uuid        | ✓  | `gen_random_uuid()` | PK                 | 識別子   |
| hospital\_id | uuid        | ✓  |                     | FK→`hospitals(id)` | 病院    |
| app\_id      | uuid        | ✓  |                     | FK→`apps(id)`      | アプリ   |
| is\_enabled  | boolean     | ✓  | `true`              |                    | 有効/無効 |
| created\_at  | timestamptz | ✓  | `now()`             |                    | 作成    |
| updated\_at  | timestamptz | ✓  | `now()`             |                    | 更新    |

### 4.5 `hospitals`（病院マスタ）

| 列           | 型           | NN | 既定                  | 制約/参照  | 説明    |
| ----------- | ----------- | -- | ------------------- | ------ | ----- |
| id          | uuid        | ✓  | `gen_random_uuid()` | PK     | 病院ID  |
| code        | text        | ✓  |                     | UNIQUE | 病院コード |
| name        | text        | ✓  |                     |        | 病院名   |
| created\_at | timestamptz | ✓  | `now()`             |        | 作成    |

### 4.6 `departments`（部署マスタ）

| 列            | 型    | NN | 既定                  | 制約/参照              | 説明         |
| ------------ | ---- | -- | ------------------- | ------------------ | ---------- |
| id           | uuid | ✓  | `gen_random_uuid()` | PK                 | 部署ID       |
| code         | text | ✓  |                     |                    | 部署コード（病院内） |
| name         | text | ✓  |                     |                    | 部署名        |
| hospital\_id | uuid | ✓  |                     | FK→`hospitals(id)` | 所属病院       |

### 4.7 `positions`（役職マスタ）

| 列            | 型    | NN | 既定                  | 制約/参照              | 説明         |
| ------------ | ---- | -- | ------------------- | ------------------ | ---------- |
| id           | uuid | ✓  | `gen_random_uuid()` | PK                 | 役職ID       |
| code         | text | ✓  |                     |                    | 役職コード（病院内） |
| name         | text | ✓  |                     |                    | 役職名        |
| hospital\_id | uuid | ✓  |                     | FK→`hospitals(id)` | 所属病院       |

### 4.8 `professions`（職種マスタ）

| 列           | 型           | NN | 既定                  | 制約/参照  | 説明               |
| ----------- | ----------- | -- | ------------------- | ------ | ---------------- |
| id          | uuid        | ✓  | `gen_random_uuid()` | PK     | 職種ID             |
| code        | varchar     | ✓  |                     | UNIQUE | 職種コード（PT/OT/ST等） |
| name        | text        | ✓  |                     |        | 表示名              |
| sort\_order | integer     | ✓  | `100`               |        | 並び順              |
| active      | boolean     | ✓  | `true`              |        | 有効               |
| created\_at | timestamptz | ✓  | `now()`             |        | 作成               |
| updated\_at | timestamptz | ✓  | `now()`             |        | 更新               |

### 4.9 `teams`（チームマスタ）

| 列            | 型           | NN | 既定                  | 制約/参照              | 説明          |
| ------------ | ----------- | -- | ------------------- | ------------------ | ----------- |
| id           | uuid        | ✓  | `gen_random_uuid()` | PK                 | チームID       |
| name         | varchar     | ✓  |                     |                    | チーム名（例: 2A） |
| description  | text        |    |                     |                    | 説明          |
| created\_at  | timestamptz | ✓  | `now()`             |                    | 作成          |
| updated\_at  | timestamptz | ✓  | `now()`             |                    | 更新          |
| code         | varchar     | ✓  |                     |                    | チームコード（院内）  |
| hospital\_id | uuid        | ✓  |                     | FK→`hospitals(id)` | 所属病院        |

### 4.10 `roles`（ロールマスタ）

| 列           | 型           | NN | 既定                  | 制約/参照  | 説明     |
| ----------- | ----------- | -- | ------------------- | ------ | ------ |
| id          | uuid        | ✓  | `gen_random_uuid()` | PK     | ロールID  |
| code        | text        | ✓  |                     | UNIQUE | ロールコード |
| name        | text        | ✓  |                     |        | 名称     |
| sort\_order | integer     | ✓  | `0`                 |        | 並び順    |
| created\_at | timestamptz | ✓  | `now()`             |        | 作成     |
| updated\_at | timestamptz | ✓  | `now()`             |        | 更新     |

### 4.11 `staff_statuses`（在籍ステータス）

| 列                 | 型           | NN | 既定                  | 制約/参照  | 説明          |
| ----------------- | ----------- | -- | ------------------- | ------ | ----------- |
| id                | uuid        | ✓  | `gen_random_uuid()` | PK     | ステータスID     |
| code              | varchar     | ✓  |                     | UNIQUE | コード         |
| name              | text        | ✓  |                     |        | 名称（在籍/休職 等） |
| is\_active\_state | boolean     | ✓  |                     |        | アクティブ扱いか    |
| created\_at       | timestamptz | ✓  | `now()`             |        | 作成          |
| updated\_at       | timestamptz | ✓  | `now()`             |        | 更新          |

### 4.12 `staff`（職員）

| 列              | 型           | NN | 既定                       | 制約/参照                | 説明                      |      |
| -------------- | ----------- | -- | ------------------------ | -------------------- | ----------------------- | ---- |
| id             | uuid        | ✓  | `gen_random_uuid()`      | PK                   | 職員ID                    |      |
| name           | varchar     | ✓  |                          |                      | 氏名                      |      |
| years          | integer     |    |                          | `CHECK (0..50)`      | 経験年数                    |      |
| created\_at    | timestamptz | ✓  | `timezone('utc', now())` |                      | 作成                      |      |
| updated\_at    | timestamptz | ✓  | `timezone('utc', now())` |                      | 更新                      |      |
| on\_leave      | boolean     |    | `false`                  |                      | 休職中フラグ（補助）              |      |
| team\_id       | uuid        | ✓  |                          | FK→`teams(id)`       | チーム                     |      |
| hospital\_id   | uuid        | ✓  |                          | FK→`hospitals(id)`   | 病院                      |      |
| department\_id | uuid        | ✓  |                          | FK→`departments(id)` | 部署                      |      |
| position\_id   | uuid        | ✓  |                          | FK→`positions(id)`   | 役職                      |      |
| hire\_date     | date        |    |                          |                      | 入職日                     |      |
| active         | boolean     | ✓  | `true`                   |                      | 在籍フラグ                   |      |
| profession\_id | uuid        |    |                          |                      | FK→`professions(id)`    | 職種   |
| status\_id     | uuid        |    |                          |                      | FK→`staff_statuses(id)` | 在籍状態 |

### 4.13 `profiles`（ユーザープロファイル拡張）

| 列           | 型           | NN | 既定      | 制約/参照                          | 説明             |      |
| ----------- | ----------- | -- | ------- | ------------------------------ | -------------- | ---- |
| user\_id    | uuid        | ✓  |         | PK/UNIQUE, FK→`auth.users(id)` | ユーザーID（外部）     |      |
| name        | text        |    |         |                                | 表示名            |      |
| active      | boolean     |    | `true`  |                                | 有効             |      |
| created\_at | timestamptz |    | `now()` |                                | 作成             |      |
| updated\_at | timestamptz |    | `now()` |                                | 更新             |      |
| staff\_id   | uuid        |    |         |                                | FK→`staff(id)` | 紐付職員 |
| role\_id    | uuid        |    |         |                                | FK→`roles(id)` | ロール  |

### 4.14 `user_hospital_memberships`（ユーザーの病院所属）

| 列            | 型           | NN | 既定                  | 制約/参照               | 説明             |          |
| ------------ | ----------- | -- | ------------------- | ------------------- | -------------- | -------- |
| id           | uuid        | ✓  | `gen_random_uuid()` | PK                  | 識別子            |          |
| user\_id     | uuid        | ✓  |                     | FK→`auth.users(id)` | ユーザー           |          |
| hospital\_id | uuid        | ✓  |                     | FK→`hospitals(id)`  | 病院             |          |
| role\_id     | uuid        |    |                     |                     | FK→`roles(id)` | ロール（病院別） |
| is\_primary  | boolean     | ✓  | `false`             |                     | 主所属            |          |
| created\_at  | timestamptz | ✓  | `now()`             |                     | 作成             |          |
| is\_enabled  | boolean     | ✓  | `true`              |                     | 有効             |          |
| valid\_from  | timestamptz | ✓  | `now()`             |                     | 所属開始           |          |
| valid\_to    | timestamptz |    |                     |                     | 所属終了（NULL=現役）  |          |

### 4.15 `chat_sessions`（チャットセッション）

| 列                 | 型           | NN | 既定                  | 制約/参照              | 説明                     |            |
| ----------------- | ----------- | -- | ------------------- | ------------------ | ---------------------- | ---------- |
| id                | uuid        | ✓  | `gen_random_uuid()` | PK                 | セッションID                |            |
| user\_id          | uuid        |    |                     |                    | FK→`profiles(user_id)` | 作成者/代表ユーザー |
| title             | text        | ✓  | `'新しいチャット'`         |                    | タイトル                   |            |
| created\_at       | timestamptz |    | `now()`             |                    | 作成                     |            |
| updated\_at       | timestamptz |    | `now()`             |                    | 更新                     |            |
| hospital\_id      | uuid        | ✓  |                     | FK→`hospitals(id)` | 病院スコープ                 |            |
| app\_id           | uuid        |    |                     |                    | FK→`apps(id)`          | 関連アプリ      |
| last\_message\_at | timestamptz |    |                     |                    | 最終発言時刻                 |            |
| message\_count    | integer     | ✓  | `0`                 |                    | メッセージ数（冪等計上用）          |            |

### 4.16 `chat_session_members`（セッション参加者）

| 列           | 型    | NN | 既定         | 制約/参照                          | 説明                |
| ----------- | ---- | -- | ---------- | ------------------------------ | ----------------- |
| session\_id | uuid | ✓  |            | PK(複合), FK→`chat_sessions(id)` | セッション             |
| user\_id    | uuid | ✓  |            | PK(複合), FK→`auth.users(id)`    | 参加者               |
| role        | text | ✓  | `'member'` |                                | member/owner 等の役割 |

### 4.17 `chat_messages`（メッセージ）

| 列                | 型            | NN | 既定                                            | 制約/参照                  | 説明                     |         |
| ---------------- | ------------ | -- | --------------------------------------------- | ---------------------- | ---------------------- | ------- |
| id               | uuid         | ✓  | `gen_random_uuid()`                           | PK                     | メッセージID                |         |
| session\_id      | uuid         | ✓  |                                               | FK→`chat_sessions(id)` | 所属セッション                |         |
| content          | text         | ✓  |                                               |                        | 本文                     |         |
| created\_at      | timestamptz  |    | `now()`                                       |                        | 作成                     |         |
| sender\_user\_id | uuid         |    |                                               |                        | FK→`profiles(user_id)` | 送信者（人間） |
| ts\_text         | tsvector     |    | `to_tsvector('simple', coalesce(content,''))` |                        | 全文検索ベクトル               |         |
| message\_index   | integer      | ✓  |                                               |                        | 表示順/整列キー（セッション内）       |         |
| sender\_kind     | USER-DEFINED | ✓  |                                               |                        | **要: 事前作成 ENUM/参照**    |         |

### 4.18 `chat_message_reads`（既読管理）

| 列           | 型           | NN | 既定      | 制約/参照                          | 説明     |
| ----------- | ----------- | -- | ------- | ------------------------------ | ------ |
| message\_id | uuid        | ✓  |         | PK(複合), FK→`chat_messages(id)` | メッセージ  |
| user\_id    | uuid        | ✓  |         | PK(複合), FK→`auth.users(id)`    | 閲覧ユーザー |
| read\_at    | timestamptz | ✓  | `now()` |                                | 既読時刻   |

### 4.19 `notices`（院内お知らせ）

| 列              | 型           | NN | 既定                  | 制約/参照                                       | 説明                   |       |
| -------------- | ----------- | -- | ------------------- | ------------------------------------------- | -------------------- | ----- |
| id             | uuid        | ✓  | `gen_random_uuid()` | PK                                          | 告知ID                 |       |
| hospital\_id   | uuid        | ✓  |                     | FK→`hospitals(id)`                          | 病院                   |       |
| title          | text        | ✓  |                     |                                             | タイトル                 |       |
| body           | text        | ✓  |                     |                                             | 本文                   |       |
| scope          | text        | ✓  |                     | `CHECK IN ('hospital','department','team')` | 告知範囲                 |       |
| department\_id | uuid        |    |                     |                                             | FK→`departments(id)` | 部署対象  |
| team\_id       | uuid        |    |                     |                                             | FK→`teams(id)`       | チーム対象 |
| requires\_ack  | boolean     | ✓  | `false`             |                                             | 要既読確認                |       |
| publish\_at    | timestamptz | ✓  | `now()`             |                                             | 公開時刻                 |       |
| created\_by    | uuid        | ✓  |                     | FK→`auth.users(id)`                         | 作成者                  |       |

### 4.20 `notice_reads`（お知らせ既読）

| 列          | 型           | NN | 既定      | 制約/参照                       | 説明   |
| ---------- | ----------- | -- | ------- | --------------------------- | ---- |
| notice\_id | uuid        | ✓  |         | PK(複合), FK→`notices(id)`    | お知らせ |
| user\_id   | uuid        | ✓  |         | PK(複合), FK→`auth.users(id)` | ユーザー |
| read\_at   | timestamptz | ✓  | `now()` |                             | 既読時刻 |

### 4.21 `settings`（汎用スコープ設定）

| 列            | 型           | NN | 既定                  | 制約/参照                                         | 説明                  |     |
| ------------ | ----------- | -- | ------------------- | --------------------------------------------- | ------------------- | --- |
| id           | uuid        | ✓  | `gen_random_uuid()` | PK                                            | 識別子                 |     |
| scope\_type  | text        | ✓  |                     | `CHECK IN ('global','hospital','app','user')` | 適用スコープ              |     |
| hospital\_id | uuid        |    |                     |                                               | 病院スコープ時に利用          |     |
| app\_id      | uuid        |    |                     |                                               | アプリスコープ時に利用         |     |
| user\_id     | uuid        |    |                     |                                               | ユーザースコープ時に利用        |     |
| key          | text        | ✓  |                     |                                               | 設定キー                |     |
| value        | jsonb       | ✓  | `'{}'`              |                                               | 値（JSON）             |     |
| updated\_by  | uuid        |    |                     |                                               | FK→`auth.users(id)` | 更新者 |
| updated\_at  | timestamptz | ✓  | `now()`             |                                               | 更新時刻                |     |

### 4.22 `app_usage_logs`（アプリ利用トラッキング）

| 列            | 型           | NN | 既定                  | 制約/参照                                         | 説明                 |     |
| ------------ | ----------- | -- | ------------------- | --------------------------------------------- | ------------------ | --- |
| id           | uuid        | ✓  | `gen_random_uuid()` | PK                                            | 識別子                |     |
| user\_id     | uuid        | ✓  |                     | FK→`auth.users(id)`                           | 利用者                |     |
| hospital\_id | uuid        |    |                     |                                               | FK→`hospitals(id)` | 病院  |
| app\_id      | uuid        |    |                     |                                               | FK→`apps(id)`      | アプリ |
| action       | text        | ✓  |                     |                                               | クリック/画面遷移等の動作      |     |
| device\_type | text        |    | `'unknown'`         | `CHECK IN ('pc','tablet','mobile','unknown')` | 端末種別               |     |
| user\_agent  | text        |    |                     |                                               | UA文字列              |     |
| latency\_ms  | integer     |    |                     |                                               | 応答時間               |     |
| created\_at  | timestamptz | ✓  | `now()`             |                                               | 記録時刻               |     |

### 4.23 `login_sessions`（ログイン履歴）

| 列            | 型           | NN | 既定                  | 制約/参照                                         | 説明     |
| ------------ | ----------- | -- | ------------------- | --------------------------------------------- | ------ |
| id           | uuid        | ✓  | `gen_random_uuid()` | PK                                            | 識別子    |
| user\_id     | uuid        | ✓  |                     | FK→`auth.users(id)`                           | ユーザー   |
| device\_type | text        |    | `'unknown'`         | `CHECK IN ('pc','tablet','mobile','unknown')` | 端末     |
| user\_agent  | text        |    |                     |                                               | UA     |
| ip\_address  | inet        |    |                     |                                               | IP     |
| created\_at  | timestamptz | ✓  | `now()`             |                                               | ログイン時刻 |

### 4.24 `audit_logs`（DB監査ログ：行単位差分）

| 列               | 型           | NN | 既定                  | 制約/参照                                   | 説明             |
| --------------- | ----------- | -- | ------------------- | --------------------------------------- | -------------- |
| id              | uuid        | ✓  | `gen_random_uuid()` | PK                                      | 識別子            |
| ts              | timestamptz | ✓  | `now()`             |                                         | 記録時刻           |
| actor\_user\_id | uuid        |    |                     |                                         | 操作者（NULL=システム） |
| table\_name     | text        | ✓  |                     |                                         | 対象テーブル         |
| row\_pk         | text        |    |                     |                                         | 対象行の主キー文字列表現   |
| action          | text        | ✓  |                     | `CHECK IN ('insert','update','delete')` | 操作種別           |
| old\_data       | jsonb       |    |                     |                                         | 変更前            |
| new\_data       | jsonb       |    |                     |                                         | 変更後            |

### 4.25 `error_logs`（アプリ/APIエラー追跡）

| 列               | 型           | NN | 既定                  | 制約/参照                                              | 説明                     |     |
| --------------- | ----------- | -- | ------------------- | -------------------------------------------------- | ---------------------- | --- |
| id              | uuid        | ✓  | `gen_random_uuid()` | PK                                                 | 識別子                    |     |
| level           | text        |    |                     | `CHECK IN ('debug','info','warn','error','fatal')` | レベル                    |     |
| message         | text        | ✓  |                     |                                                    | 概要                     |     |
| error\_code     | text        |    |                     |                                                    | エラーコード                 |     |
| stack\_trace    | text        |    |                     |                                                    | スタック                   |     |
| context         | jsonb       |    |                     |                                                    | 任意コンテキスト               |     |
| user\_id        | uuid        |    |                     |                                                    | 関連ユーザー                 |     |
| hospital\_id    | uuid        |    |                     |                                                    | FK→`hospitals(id)`     |     |
| app\_id         | uuid        |    |                     |                                                    | FK→`apps(id)`          |     |
| session\_id     | uuid        |    |                     |                                                    | FK→`chat_sessions(id)` |     |
| user\_agent     | text        |    |                     |                                                    | UA                     |     |
| ip\_address     | text        |    |                     |                                                    | IP（文字列）                |     |
| request\_url    | text        |    |                     |                                                    | URL                    |     |
| request\_method | text        |    |                     |                                                    | HTTP メソッド              |     |
| status\_code    | integer     |    |                     |                                                    | HTTP ステータス             |     |
| created\_at     | timestamptz | ✓  | `now()`             |                                                    | 発生時刻                   |     |
| resolved\_at    | timestamptz |    |                     |                                                    | 解決時刻                   |     |
| resolved\_by    | uuid        |    |                     |                                                    | FK→`auth.users(id)`    | 解決者 |
| category        | text        |    |                     |                                                    | 分類                     |     |
| component       | text        |    |                     |                                                    | コンポーネント                |     |
| event           | text        |    |                     |                                                    | イベント名                  |     |
| device\_type    | text        |    | `'unknown'`         | `CHECK IN ('pc','tablet','mobile','unknown')`      | 端末                     |     |
| latency\_ms     | integer     |    |                     |                                                    | 遅延                     |     |
| request\_id     | text        |    |                     |                                                    | トレースID                 |     |
| correlation\_id | text        |    |                     |                                                    | 相関ID                   |     |
| dedup\_hash     | text        |    |                     |                                                    | 重複抑制キー                 |     |

### 4.26 `shift_months`（月次シフトヘッダ）

| 列               | 型           | NN | 既定                  | 制約/参照                                                 | 説明            |
| --------------- | ----------- | -- | ------------------- | ----------------------------------------------------- | ------------- |
| id              | uuid        | ✓  | `gen_random_uuid()` | PK                                                    | 識別子           |
| hospital\_id    | uuid        | ✓  |                     | FK→`hospitals(id)`                                    | 病院            |
| year            | integer     | ✓  |                     |                                                       | 年（西暦）         |
| month           | integer     | ✓  |                     | `CHECK (1..12)`                                       | 月             |
| version         | integer     | ✓  | `1`                 |                                                       | 版（差し替え・再生成管理） |
| status          | text        | ✓  | `'editing'`         | `CHECK IN ('editing','draft','published','archived')` | 状態            |
| rules\_snapshot | jsonb       | ✓  | `'{}'`              |                                                       | 生成時のルール凍結     |
| created\_by     | uuid        | ✓  |                     | FK→`auth.users(id)`                                   | 作成者           |
| created\_at     | timestamptz | ✓  | `now()`             |                                                       | 作成時刻          |
| updated\_at     | timestamptz | ✓  | `now()`             |                                                       | 更新時刻          |

### 4.27 `shift_details`（日次スロット）

| 列           | 型           | NN | 既定                  | 制約/参照                 | 説明             |
| ----------- | ----------- | -- | ------------------- | --------------------- | -------------- |
| id          | uuid        | ✓  | `gen_random_uuid()` | PK                    | 識別子            |
| month\_id   | uuid        | ✓  |                     | FK→`shift_months(id)` | 対象月            |
| staff\_id   | uuid        | ✓  |                     | FK→`staff(id)`        | 職員             |
| work\_date  | date        | ✓  |                     |                       | 日付             |
| slot        | text        | ✓  |                     |                       | 早/日/遅/夜 等（自由型） |
| note        | text        |    |                     |                       | 備考             |
| locked      | boolean     | ✓  | `false`             |                       | ロック            |
| created\_at | timestamptz | ✓  | `now()`             |                       | 作成             |
| updated\_at | timestamptz | ✓  | `now()`             |                       | 更新             |

### 4.28 `shift_generation_logs`（自動生成ログ）

| 列            | 型           | NN | 既定                  | 制約/参照                 | 説明      |
| ------------ | ----------- | -- | ------------------- | --------------------- | ------- |
| id           | uuid        | ✓  | `gen_random_uuid()` | PK                    | 識別子     |
| month\_id    | uuid        | ✓  |                     | FK→`shift_months(id)` | 対象月     |
| started\_at  | timestamptz | ✓  | `now()`             |                       | 開始      |
| finished\_at | timestamptz |    |                     |                       | 終了      |
| result       | text        |    |                     |                       | 成功/失敗要約 |
| detail       | jsonb       |    |                     |                       | 詳細ログ    |

---

## 5. チャット関連：利用上の注意

* **`sender_kind`** はユーザー定義。ENUM か参照マスタを**先に作成**してください。
* **順序性**: `chat_messages` は `message_index` で整列。`(session_id, message_index)` UNIQUE を**推奨**。
* **検索性**: `ts_text` への GIN 索引を推奨（`CREATE INDEX idx_chat_messages_ts ON chat_messages USING GIN (ts_text);`）。
* **既読**: `chat_message_reads` はメッセージ×ユーザーの複合PKで冪等記録。

---

## 6. お知らせ（Notices）

* **スコープ**: `scope` に応じて `department_id` / `team_id` を任意で利用。`hospital` のときは両者 NULL が妥当。
* **既読**: `notice_reads` は複合PK。重複既読記録を防止。

---

## 7. シフト管理

* **ヘッダ/明細分離**: `shift_months`（状態管理・ルール凍結）→ `shift_details`（日別スロット）。
* **版管理**: `version` と `status` で編集/配信/アーカイブを表現。
* **自動生成**: `shift_generation_logs` に経過・結果を保持（JSON でアルゴリズム詳細も保存可能）。

---

## 8. 監査・可観測性

* **`audit_logs`**: テーブル名＋行PK＋ old/new 差分で完全監査。トリガーで自動記録する運用が典型。
* **`app_usage_logs` / `login_sessions` / `error_logs`**: UI/API の利用・接続・障害を分離。相関IDで横断トレース。

---

## 9. セキュリティ/RLS（実装方針メモ）

> 本スキーマに RLS 定義は含まれていません。以下は**推奨方針**の例です。

* **原則**: すべての実データ表に `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` を適用。
* **病院スコープ**: `hospitals` に対し、ユーザーの `user_hospital_memberships` を参照し、`hospital_id` が一致する行のみ許可。
* **チャット**: `chat_sessions` は作成者または `chat_session_members` に含まれるユーザーのみ参照可。メッセージ・既読はセッションに準ずる。
* **お知らせ**: `scope` に応じた所属チェック（病院/部署/チーム）で参照可。`requires_ack` の更新は作成者またはロール権限者のみ。
* **シフト**: 自分の `staff_id` に紐づく行、または部署/チームロールに応じた範囲のみ参照可。

---

## 10. 推奨インデックス（パフォーマンス指針）

> FK 列には自動で索引が作られないため、明示的作成を推奨。

* `chat_messages (session_id, message_index)` UNIQUE + `session_id` 単独 IDX
* `chat_message_reads (message_id)`、`(user_id)`
* `chat_sessions (hospital_id)`, `(user_id)`, `(app_id)`, `(last_message_at)`
* `notices (hospital_id)`, `(scope, department_id, team_id, publish_at)`
* `notice_reads (user_id)`
* `shift_details (month_id, work_date)`、`(staff_id, work_date)`
* `shift_months (hospital_id, year, month, status)`
* `user_hospital_memberships (user_id, hospital_id, is_enabled)`
* `app_usage_logs (user_id, app_id, created_at)`
* `error_logs (created_at)`, `(app_id)`, `(session_id)`、`(dedup_hash)`
* `profiles (staff_id)`、`(role_id)`／`staff (hospital_id, department_id, team_id, position_id, profession_id)`
* `chat_messages USING GIN (ts_text)`

---

## 11. 典型クエリ例

```sql
-- 11.1 ユーザーの主所属病院
SELECT m.*
FROM user_hospital_memberships m
WHERE m.user_id = :uid AND m.is_primary = true AND coalesce(m.valid_to, 'infinity') > now();

-- 11.2 病院×アプリの有効一覧
SELECT a.*
FROM hospital_apps ha
JOIN apps a ON a.id = ha.app_id
WHERE ha.hospital_id = :hid AND ha.is_enabled = true AND a.is_active = true
ORDER BY coalesce(a.sort_order, 999), a.name;

-- 11.3 セッション一覧（病院内、最新順）
SELECT s.*
FROM chat_sessions s
WHERE s.hospital_id = :hid
ORDER BY coalesce(s.last_message_at, s.created_at) DESC
LIMIT 50;

-- 11.4 セッションのメッセージ＋既読数
SELECT m.*, (
  SELECT count(*) FROM chat_message_reads r WHERE r.message_id = m.id
) AS read_count
FROM chat_messages m
WHERE m.session_id = :sid
ORDER BY m.message_index ASC;

-- 11.5 指定月のシフト（職員別）
SELECT d.*
FROM shift_details d
WHERE d.month_id = :mid AND d.staff_id = :staff_id
ORDER BY d.work_date ASC;

-- 11.6 お知らせ（病院スコープ、公開済）
SELECT n.*
FROM notices n
WHERE n.hospital_id = :hid AND n.publish_at <= now()
ORDER BY n.publish_at DESC;
```

---

## 12. データフロー例（ユースケース）

1. **ログイン**: `auth.users` 認証 → `login_sessions` 記録 → 所属は `user_hospital_memberships` から決定。
2. **アプリ表示**: 所属病院の `hospital_apps` → `apps` を JOIN して一覧化。
3. **チャット開始**: `chat_sessions` 生成（`hospital_id`,`app_id`）→ 参加者は `chat_session_members` へ。発言は `chat_messages`。既読は `chat_message_reads`。
4. **お知らせ配信**: `notices` 登録→範囲に応じてクライアント配信→閲覧時に `notice_reads` へ。
5. **シフト生成**: `shift_months` 作成→自動生成処理ログを `shift_generation_logs` → 明細は `shift_details` に保存。
6. **監査/可観測性**: 画面操作は `app_usage_logs`、例外は `error_logs`、DB変更は `audit_logs`。

---

## 13. ガバナンス・命名・時刻の運用規約（推奨）

* **命名**: テーブル/列は `snake_case`、FKは `*_id` 統一。ENUM 文字列は小文字。
* **時刻**: 全て `timestamptz`、格納は UTC、表示でローカル変換。`created_at`/`updated_at` はトリガーで自動更新を推奨。
* **削除規約**: 物理削除/論理削除の基準を決め、論理削除は `active` 列等で表現。
* **FKの ON DELETE**: 既定は NO ACTION。必要に応じて `ON DELETE SET NULL` / `CASCADE` を設計書に明示。

---

## 14. 既知の未定義/ToDo

* `chat_messages.sender_kind` の **ユーザー定義型**（ENUM or マスタ）を作成すること。
* RLS ポリシーの具体定義（病院/部署/チーム/ロール紐付）を追加すること。
* インデックスの追加（§10）を行い、主要検索に対して EXPLAIN で確認すること。
* `teams.code` に UNIQUE（または `(hospital_id, code)` 複合 UNIQUE）を検討。
* `positions.code` / `departments.code` も院内での UNIQUE を検討。

---

## 15. 変更履歴

* **2025-08-23**: 初版作成（提示DDLをベースに Docs 化）。

---

## 16. 変更管理とマイグレーション運用（Supabase前提）

**ねらい:** AIコーディングでDDL/RLSが頻繁に変わっても安全に反映し、可逆・検証可能にする。

### 16.1 環境とブランチ

* **環境**: `dev` → `stg` → `prd` の3段階。`prd` 直書き禁止。
* **DBブランチ/ミグレーション**: Supabase CLI で一元管理。

  * 例）`supabase db diff -f 20250823_add_rls_policies.sql` → PR → `stg` 適用 → `prd`。
* **スキーマ版管理**: Semantic Versioning を採用（§28）。

### 16.2 マイグレーションの原則

* **トランザクション**: 原則 1 ファイル = 1 トランザクション（`BEGIN; … COMMIT;`）。

  * ただし大規模索引は `CREATE INDEX CONCURRENTLY`（トランザクション外）。
* **Expand → Contract** パターン: 互換追加 → 並行稼働 → 切替 → 旧要素撤去。
* **禁止事項**: RLS無効化、ポリシー全DROP、互換なしの列型変更、アプリ稼働中の大規模ロック DDL。

### 16.3 マイグレーション雛形（安全版）

```sql
-- 0000_safe_template.sql
BEGIN;
-- 1) 事前チェック（存在確認・依存確認）
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='chat_sessions') THEN
    RAISE EXCEPTION 'chat_sessions missing';
  END IF;
END $$;

-- 2) DDL（互換追加）
-- 例: 新列追加は NULL から、NOT NULL は後で VALIDATE
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS meta jsonb;

-- 3) RLS（追加のみ）
-- 既存許可を壊さないよう新ポリシー名はバージョン付き
-- CREATE POLICY chat_messages__select__by_session_v2 ON public.chat_messages ...;

-- 4) 後方互換の VIEW/関数を残す
-- CREATE OR REPLACE VIEW v_chat_messages ...;

COMMIT;

-- 5) 大規模インデックス
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_session_idx ON public.chat_messages(session_id, message_index);

-- 6) 制約の後付 VALIDATE（ロック最小化）
-- ALTER TABLE public.chat_messages ADD CONSTRAINT ck_msg_idx CHECK (message_index >= 0) NOT VALID;
-- ALTER TABLE public.chat_messages VALIDATE CONSTRAINT ck_msg_idx;
```

### 16.4 互換維持テクニック

* **互換VIEW**で旧アプリを支える（列名変更時）。
* **NOT VALID → VALIDATE** で長時間ロック回避。
* **Dual-Write**（必要時のみ）→ 完了後スワップ。

---

## 17. RLS ガードレール & テストハーネス

**目的:** RLS変更で“漏えい・遮断しすぎ”を作らない。

### 17.1 不変条件（Invariants）

* **I-1**: ユーザーは**所属病院**のデータのみ参照/更新可。
* **I-2**: チャットは**セッション参加者**または作成者のみ参照可。
* **I-3**: お知らせ（`scope`）に応じた所属フィルタが必須。
* **I-4**: 既読・明細等の従属表は**親テーブルのRLS**に準拠。

### 17.2 テスト役割とJWT疑似

* Supabase SQL Editor で以下のように疑似クレームを設定して挙動を確認：

```sql
-- 認証ロール & クレーム
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{
  "sub": "00000000-0000-0000-0000-000000000001",
  "role": "authenticated",
  "user_metadata": {"primary_hospital_id": "11111111-1111-1111-1111-111111111111"}
}';
```

### 17.3 代表テスト（抜粋）

```sql
-- T-1: 自院セッションのみ見える
SELECT count(*) FROM public.chat_sessions s
WHERE s.hospital_id <> (current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'primary_hospital_id');
-- 期待: 0 行（RLSにより）

-- T-2: 参加していないセッションのメッセージは見えない
SELECT 1 FROM public.chat_messages m
JOIN public.chat_sessions s ON s.id = m.session_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.chat_session_members mem
  WHERE mem.session_id = s.id AND mem.user_id = auth.uid()
) AND (s.user_id <> auth.uid());
-- 期待: 0 行

-- T-3: notices の scope=team のとき所属外は0
-- （所属判定ロジックに合わせてJOINを記述）
```

### 17.4 RLS命名規約（推奨）

* `table__operation__scope__vN` 例: `chat_sessions__select__member__v1`
* 変更時は **バージョンを上げて追加** → 既存を削除（検証後）。

---

## 18. RBAC アクセス行列（抜粋）

| 対象/操作                        | Admin | Manager    | Staff    | AI/Bot       |
| ---------------------------- | ----- | ---------- | -------- | ------------ |
| chat\_sessions: SELECT       | ◯     | ◯          | 自セッションのみ | 必要最小         |
| chat\_messages: INSERT       | ◯     | ◯          | 自セッションのみ | 許可されたセッションのみ |
| notices: INSERT/UPDATE       | ◯     | 部署/チーム権限のみ | ×        | ×            |
| shift\_months: UPDATE status | ◯     | ◯          | ×        | ×            |

> 実体は RLS + 関数で表現（`SECURITY DEFINER` は最小限）。

---

## 19. JWT クレーム設計（Supabase）

* 推奨クレーム例：

  * `sub`（= auth.uid）
  * `user_metadata.primary_hospital_id`
  * `app_metadata.roles`（システムロールコード配列）
  * 必要に応じて `staff_id`
* ポリシー例：

```sql
USING (
  hospital_id = (current_setting('request.jwt.claims', true)::jsonb->'user_metadata'->>'primary_hospital_id')::uuid
)
```

---

## 20. 安全なスキーマ変更パターン（よくある変更）

* **列リネーム**: 新列追加 → 書き分け → アプリ切替 → 旧列削除。
* **NOT NULL化**: 既存補完 → `SET NOT NULL`（VALIDATE前にデータ埋め）。
* **FK追加**: `NOT VALID` → データ整合 → `VALIDATE CONSTRAINT`。
* **大規模インデックス**: `CREATE INDEX CONCURRENTLY`。

---

## 21. 性能保護（RLS×索引×実行計画）

* RLSフィルタ列（例: `hospital_id`, `session_id`）に**必ず索引**。
* 代表クエリで `EXPLAIN (ANALYZE, BUFFERS)` を保存（before/after 比較）。
* 迷ったら **複合索引**（例: `chat_messages(session_id, message_index)`）。

---

## 22. ロールバック戦略

* **技術**: 逆マイグレーション同梱、互換VIEWで即時戻し、機能フラグ（`settings`）で切替。
* **運用**: 直前スナップショット取得、適用後ヘルスチェック（§27）、失敗時は即時 rollback。

---

## 23. 監査・可観測性の運用強化

* `error_logs` に `dedup_hash` で重複抑制。`request_id` / `correlation_id` で追跡。
* 週次で\*\*RLS失敗（403/401）\*\*件数のトレンドを可視化。
* `audit_logs` は DML トリガで自動記録（INSERT/UPDATE/DELETE）。

---

## 24. データライフサイクル & マスキング

* **保持期間**: `app_usage_logs`/`error_logs` は 6–12 ヶ月を目安にアーカイブ。
* **非本番の匿名化**: PHI/PII をダミー化する Seed スクリプトを用意。

---

## 25. AIコーディング用プロンプト規約（埋め込んで使う）

> **System Prompt（抜粋）**
>
> * RLS を無効化/削除してはならない。新規ポリシーは**追加**し、検証後に旧版を削除。
> * 変更は**Expand→Contract**。DDLは**トランザクション**化、巨大索引は `CONCURRENTLY`。
> * すべての変更に**リハーサル用テストSQL**（SELECTで0件/件数一致の検証）を付ける。
> * 影響テーブルの**インデックス**提案を含める。
> * マイグレーションは**可逆**（ダウングレード同梱）。

---

## 26. 運用チェックリスト（前/後）

**Before**

1. 目的/影響範囲を記述（テーブル、RLS、インデックス）。
2. 事前バックアップまたはスナップショット。
3. テストJWTでの RLS 正/負テストを準備。
4. 大規模DDLの所要時間/ロック評価。
5. ロールバック手順の明文化。

**After**

1. ヘルスチェック：主要画面/APIの200, p95 レイテンシ、エラー率。
2. RLSテストSQLで 0件/件数一致を確認。
3. `error_logs` / `app_usage_logs` を監視（初日/初週）。
4. Docs（本書）の変更履歴に追記（§15）。

---

## 27. 代表ヘルスチェックSQL（貼って流すだけ）

```sql
-- p95 っぽい遅延の目安（アプリ計測と併用）
-- 直近1時間のエラー件数
SELECT date_trunc('minute', created_at) AS m, count(*)
FROM public.error_logs
WHERE created_at > now() - interval '60 minutes'
GROUP BY 1 ORDER BY 1 DESC LIMIT 60;

-- 病院×アプリの利用数（直近1日）
SELECT hospital_id, app_id, count(*) AS hits
FROM public.app_usage_logs
WHERE created_at > now() - interval '1 day'
GROUP BY 1,2 ORDER BY hits DESC;
```

---

## 28. セマンティック・スキーマ・バージョニング

* **MAJOR**: 互換破壊（列削除/型変更/RLSモデル変更）。
* **MINOR**: 互換追加（列追加/新ポリシー/索引）。
* **PATCH**: バグ修正/制約 VALIDATE/コメント追加。
* マイグレーションファイル: `YYYYMMDD_HHMM_<scope>_vX.Y.Z.sql` で一意化。
