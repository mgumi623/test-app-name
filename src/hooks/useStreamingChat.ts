import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

export interface StreamingChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string, image?: File) => Promise<void>;
  clearMessages: () => void;
}

export function useStreamingChat(
  conversationId: string | null,
  setConversationId: (id: string) => void
): StreamingChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (text: string, image?: File) => {
    if (!text.trim() && !image) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessageId = Date.now().toString();
    const imageUrl = image ? URL.createObjectURL(image) : undefined;
    
    const userMessage: ChatMessage = {
      id: userMessageId,
      content: text,
      isUser: true,
      timestamp: new Date(),
      imageUrl,
    };

    setMessages(prev => [...prev, userMessage]);

    // Add empty AI message for streaming
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
      id: aiMessageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // Prepare request
      const formData = new FormData();
      formData.append('text', text);
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }
      if (image) {
        formData.append('image', image);
      }

      // Make streaming request
      const response = await fetch('/api/dify/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              // Extract conversation_id if present
              if (parsed.conversation_id && !conversationId) {
                setConversationId(parsed.conversation_id);
              }

              // Update AI message content
              if (parsed.answer) {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === aiMessageId 
                      ? { ...msg, content: msg.content + parsed.answer }
                      : msg
                  )
                );
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Remove the empty AI message on error
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
    } finally {
      setIsLoading(false);
      
      // Clean up image URL
      if (imageUrl) {
        setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
      }
    }
  }, [conversationId, setConversationId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
