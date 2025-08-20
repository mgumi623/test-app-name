const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase設定
const supabaseUrl = 'https://gbsacfrzikxhrohsgruo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdic2FjZnJ6aWt4aHJvaHNncnVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDQzMDg1MiwiZXhwIjoyMDcwMDA2ODUyfQ.QVFlXwK7hYROrorxNkkeCm7JCE9Bu5wkcrBAu-T_6DU';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// インポート開始位置を指定（続きから実行する場合に使用）
const START_FROM = 3136;
const BATCH_SIZE = 20; // バッチサイズを維持

async function importUsers() {
  try {
    // CSVファイルのパスを指定
    const csvPath = path.join(__dirname, '..', 'src', 'app', 'Login', '承認データ.csv');
    
    // CSVファイルを読み込む（BOMを除去）
    let csvData = fs.readFileSync(csvPath, 'utf-8');
    if (csvData.charCodeAt(0) === 0xFEFF) {
      csvData = csvData.slice(1);
    }

    // 各行をパースして余分なカンマを削除
    const lines = csvData.split('\n').map(line => line.trim());
    const records = [];
    
    // ヘッダー行をスキップして処理
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      const [staff_id, password] = line.split(',');
      if (staff_id && password) {
        // パスワードが6文字未満の場合は0で埋める
        const paddedPassword = password.length < 6 ? password.padEnd(6, '0') : password;
        records.push({ staff_id, password: paddedPassword });
      }
    }

    // 開始位置から処理
    const targetRecords = records.slice(START_FROM - 1);
    console.log(`${targetRecords.length}件のユーザーデータを処理します（${START_FROM}件目から）`);
    
    let successCount = 0;
    let errorCount = 0;

    // レコードをバッチに分割して処理
    for (let i = 0; i < targetRecords.length; i += BATCH_SIZE) {
      const batch = targetRecords.slice(i, i + BATCH_SIZE);
      const currentStart = START_FROM + i;
      console.log(`\nバッチ処理: ${currentStart}~${Math.min(currentStart + BATCH_SIZE - 1, START_FROM + targetRecords.length - 1)}件目`);

      // バッチ内の各ユーザーを処理
      for (const record of batch) {
        const email = `${record.staff_id}@example.com`;
        const password = record.password;
        
        try {
          // ユーザーを作成
          const { data, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              staff_id: record.staff_id
            }
          });

          if (createError) {
            // ユーザーが既に存在する場合は更新
            if (createError.message.includes('already been registered')) {
              const { data: users } = await supabase.auth.admin.listUsers();
              const existingUser = users.users.find(u => u.email === email);
              if (existingUser) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                  existingUser.id,
                  { password, email_confirm: true }
                );
                if (updateError) {
                  console.error(`Error updating user ${record.staff_id}:`, updateError.message);
                  errorCount++;
                } else {
                  console.log(`User updated successfully: ${record.staff_id}`);
                  successCount++;
                }
              }
            } else {
              console.error(`Error creating user ${record.staff_id}:`, createError.message);
              errorCount++;
            }
          } else {
            console.log(`User created successfully: ${record.staff_id}`);
            successCount++;
          }

          // レート制限を避けるために少し待機
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          if (error.message?.includes('ECONNRESET')) {
            // 接続エラーの場合は少し長めに待機してリトライ
            console.log(`Connection error for user ${record.staff_id}, retrying after 5 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
            i -= BATCH_SIZE; // このバッチを再試行
            break;
          } else {
            console.error(`Failed to process user ${record.staff_id}:`, error);
            errorCount++;
          }
        }
      }

      // バッチ間で待機
      await new Promise(resolve => setTimeout(resolve, 500));

      // 進捗状況を表示
      const progress = ((i + batch.length) / targetRecords.length * 100).toFixed(1);
      console.log(`進捗: ${progress}% (${successCount + errorCount}/${targetRecords.length}件)`);
    }

    console.log(`
インポート完了:
- 成功: ${successCount}件
- 失敗: ${errorCount}件
- 合計: ${targetRecords.length}件
- 開始位置: ${START_FROM}件目から
    `);

  } catch (error) {
    console.error('Import error:', error);
  }
}

// スクリプトを実行
importUsers();