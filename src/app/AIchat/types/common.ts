// ID型
export type ID = string;

// タイムスタンプ型
export type Timestamp = Date;

// 型変換ユーティリティ
export const asID = (value: string): ID => value as ID;
export const asTimestamp = (value: Date): Timestamp => value as Timestamp;

// 共通のステータス型
export type Status = 'idle' | 'loading' | 'success' | 'error';

// エラー型
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// ページネーション用の型
export interface PaginationParams {
  page: number;
  limit: number;
  cursor?: string;
}

// レスポンス用の共通型
export interface ApiResponse<T> {
  data: T;
  status: Status;
  error?: AppError;
  pagination?: {
    nextCursor?: string;
    hasMore: boolean;
    total?: number;
  };
}