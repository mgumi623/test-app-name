import { useState } from 'react';

export const useClipboard = () => {
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  const copyToClipboard = async (text: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      /* noop */
    }
  };

  return {
    copiedMessageId,
    copyToClipboard,
  };
};