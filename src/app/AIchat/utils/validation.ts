import { ChatMessage } from '../types/chat';
import { ID, Timestamp, AppError } from '../types/common';

// 入力サニタイゼーション関数
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // 基本的なサニタイゼーション
  return input
    .trim()
    .replace(/[<>]/g, '') // 基本的なHTMLタグを除去
    .substring(0, 10000); // 最大長制限
};

export const validatePrompt = (prompt: string): { isValid: boolean; error?: string } => {
  if (!prompt || typeof prompt !== 'string') {
    return { isValid: false, error: 'プロンプトが無効です' };
  }
  
  const sanitized = sanitizeInput(prompt);
  if (sanitized.length === 0) {
    return { isValid: false, error: 'プロンプトが空です' };
  }
  
  if (sanitized.length > 10000) {
    return { isValid: false, error: 'プロンプトが長すぎます（最大10000文字）' };
  }
  
  return { isValid: true };
};

// 型ガード
export const isValidId = (value: unknown): value is ID => {
  return typeof value === 'string' && value.length > 0;
};

export const isValidTimestamp = (value: unknown): value is Timestamp => {
  return value instanceof Date && !isNaN(value.getTime());
};

export const isValidMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== 'object') return false;
  const msg = value as ChatMessage;

  return (
    isValidId(msg.id) &&
    isValidTimestamp(msg.timestamp) &&
    typeof msg.text === 'string' &&
    ['user', 'ai', 'system'].includes(msg.sender) &&
    (!msg.type || ['normal', 'mode_change', 'system', 'error'].includes(msg.type))
  );
};

// エラーハンドリング
export class ChatError extends Error implements AppError {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ChatError';
  }

  static fromError(error: unknown): ChatError {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new ChatError(message, 'UNKNOWN_ERROR', error);
  }
}

// データ変換
export const transformMessage = (raw: unknown): ChatMessage => {
  if (!isValidMessage(raw)) {
    throw new ChatError('Invalid message format', 'INVALID_FORMAT', raw);
  }
  return raw;
};

// エラー処理ラッパー
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed:', error);
    errorHandler?.(error);
    return null;
  }
};