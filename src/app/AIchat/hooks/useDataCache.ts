interface CacheOptions {
  ttl: number;  // Time to live in milliseconds
  maxSize?: number;
}

export class DataCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private options: CacheOptions;

  constructor(options: CacheOptions) {
    this.options = options;
  }

  set(key: string, data: T): void {
    if (this.options.maxSize && this.cache.size >= this.options.maxSize) {
      const oldestKey = [...this.cache.entries()]
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

import { ChatMessage } from '../types/chat';

// メッセージバッチ処理のヘルパー
export class MessageBatcher {
  private queue: ChatMessage[] = [];
  private timer: NodeJS.Timeout | null = null;
  private batchSize: number;
  private batchDelay: number;

  constructor(batchSize = 10, batchDelay = 100) {
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }

  add(message: ChatMessage, onBatch: (messages: ChatMessage[]) => void) {
    this.queue.push(message);

    if (this.queue.length >= this.batchSize) {
      this.flush(onBatch);
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(onBatch), this.batchDelay);
    }
  }

  private flush(onBatch: (messages: ChatMessage[]) => void) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length > 0) {
      onBatch(this.queue);
      this.queue = [];
    }
  }
}