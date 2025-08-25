import { useState } from 'react';

export const useClipboard = () => {
  const [copiedMessageId, setCopiedMessageId] = useState<string>();

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(undefined), 2000);
    } catch {
      /* noop */
    }
  };

  return {
    copiedMessageId,
    copyToClipboard,
  };
};