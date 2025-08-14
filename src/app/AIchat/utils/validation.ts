import { ChatMessage } from '../types/chat';
import { ID, Timestamp, AppError } from '../types/common';

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
    (!msg.type || ['normal', 'mode_change', 'system'].includes(msg.type))
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
    if (error instanceof ChatError) return error;
    
    const message = error instanceof Error ? error.message : String(error);
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
  errorHandler: (error: ChatError) => void
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    errorHandler(ChatError.fromError(error));
    return undefined;
  }
};