import { useState, useCallback, useEffect } from 'react';
import { ChatSession } from '../types/chat';
import { sendMessageToDify, ModeType } from '../../../lib/dify';
import { chatService } from '../../../lib/chatService';
import { useAuth } from '../../../contexts/AuthContext';
import { getMobileInfo, categorizeError, getMobileErrorMessage, checkNetworkStatus } from '../../../lib/mobileUtils';
import { withErrorHandling, transformMessage } from '../utils/validation';

interface UseChatSessionsOptions {
  initialMode: ModeType;
  batchSize?: number;
  batchDelay?: number;
  cacheTTL?: number;
}

export const useChatSessions = ({
  initialMode = '通常'
}: UseChatSessionsOptions) => {
  const { user } = useAuth();
  const [state, setState] = useState<{
    chatSessions: ChatSession[];
    currentChatId: string;
    currentMode: ModeType;
  }>({ 
    chatSessions: [], 
    currentChatId: '',
    currentMode: initialMode
  });

  const { chatSessions, currentChatId, currentMode } = state;

  // State management functions
  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setChatSessions = useCallback((sessions: ChatSession[] | ((prev: ChatSession[]) => ChatSession[])) => {
    if (typeof sessions === 'function') {
      updateState({ chatSessions: sessions(state.chatSessions) });
    } else {
      updateState({ chatSessions: sessions });
    }
  }, [state.chatSessions, updateState]);

  const setCurrentChatId = useCallback((id: string) => {
    updateState({ currentChatId: id });
  }, [updateState]);

  const setCurrentMode = useCallback(async (mode: ModeType) => {
    updateState({ currentMode: mode });
    if (currentChatId) {
      try {
        const modeMessage = transformMessage({
          id: crypto.randomUUID(),
          text: `${mode}モードに切り替えました`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'mode_change'
        });

        const messageId = await chatService.saveMessage(currentChatId, modeMessage.text, modeMessage.sender);
        
        if (messageId) {
          setChatSessions((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, modeMessage],
                    lastMessage: new Date(),
                  }
                : chat
            )
          );
        }
      } catch (error) {
        console.error('Error updating mode:', error);
      }
    }
  }, [updateState, currentChatId, setChatSessions]);

  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  const createNewChat = useCallback(async function createNewChat() {
    if (!user?.id) return;

    await withErrorHandling(async () => {
      const sessionId = await chatService.createChatSession(user.id);
      if (!sessionId) return;

      const initialMessage = transformMessage({
        id: crypto.randomUUID(),
        text: `こんにちは！私はAIアシスタントです。
初めてご利用いただきありがとうございます。医療に関する一般的な質問に回答させていただきます。

ご不明な点がございましたら、お気軽にお尋ねください。`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'normal'
      });

      await chatService.saveMessage(sessionId, initialMessage.text, initialMessage.sender);

      const newChat: ChatSession = {
        id: sessionId,
        title: '新しいチャット',
        messages: [initialMessage],
        lastMessage: new Date(),
        user_id: user.id,
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          currentMode: currentMode,
          messageCount: 1,
          hasUnread: false,
          isTemporary: false
        }
      };

      setState(prevState => ({
        ...prevState,
        chatSessions: [newChat, ...prevState.chatSessions],
        currentChatId: sessionId
      }));
    }, (error) => {
      console.error('Error creating new chat:', error);
    });
  }, [user?.id, currentMode, setChatSessions, setCurrentChatId]);

  const loadChatSessions = useCallback(async function loadChatSessions() {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const sessions = await chatService.getChatSessions(user.id);
      setChatSessions(sessions);
      
      // セッションが空の場合のみ新規チャットを作成
      if (sessions.length === 0) {
        await createNewChat();
      } else {
        setCurrentChatId(sessions[0].id);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, createNewChat]);

  useEffect(() => {
    if (user?.id) {
      loadChatSessions();
    }
  }, [user?.id]);


  const selectChat = useCallback(async function selectChat(id: string) {
    setCurrentChatId(id);
    
    const session = chatSessions.find(chat => chat.id === id);
    if (!session?.messages?.length) {
      const initialMessage = transformMessage({
        id: crypto.randomUUID(),
        text: `こんにちは！私はAIアシスタントです。
医療に関する一般的な質問に回答させていただきます。

ご不明な点がございましたら、お気軽にお尋ねください。`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'normal'
      });

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === id
            ? {
                ...chat,
                messages: [initialMessage],
                lastMessage: new Date(),
              }
            : chat
        )
      );

      await chatService.saveMessage(id, initialMessage.text, initialMessage.sender);
      return;
    }
    
    const switchMessage = transformMessage({
      id: crypto.randomUUID(),
      text: 'チャットを切り替えました',
      sender: 'ai',
      timestamp: new Date(),
      type: 'mode_change'
    });

    try {
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === id
            ? {
                ...chat,
                messages: [...chat.messages, switchMessage],
                lastMessage: new Date(),
              }
            : chat
        )
      );

      await chatService.saveMessage(id, switchMessage.text, switchMessage.sender);
    } catch (error) {
      console.error('Error switching chat:', error);
    }
  }, [setChatSessions, setCurrentChatId]);

  const deleteChat = useCallback(async (chatId: string) => {
    await withErrorHandling(async () => {
      await chatService.deleteChatSession(chatId);
      setChatSessions(prev => prev.filter(chat => chat.id !== chatId));
      if (currentChatId === chatId) {
        const remainingSessions = chatSessions.filter(chat => chat.id !== chatId);
        if (remainingSessions.length > 0) {
          setCurrentChatId(remainingSessions[0].id);
        } else {
          setCurrentChatId('');
        }
      }
    }, (error) => {
      console.error('Error deleting chat:', error);
    });
  }, [chatSessions, currentChatId, setChatSessions, setCurrentChatId]);

  // メッセージからタイトルを生成する関数
  const generateTitle = (text: string): string => {
    // メッセージから最初の文を抽出
    const firstSentence = text.split(/[\n\.\?？]/).filter(s => s.trim())[0];
    
    // 文が長すぎる場合は省略
    const maxLength = 20;
    if (firstSentence.length <= maxLength) {
      return firstSentence.trim();
    }
    return firstSentence.substring(0, maxLength).trim() + '...';
  };

  const sendMessage = useCallback(async function sendMessage(inputText: string, audioFile?: File) {
    if ((!inputText.trim() && !audioFile) || !currentChatId) return;
    const currentSession = chatSessions.find(session => session.id === currentChatId);
    
    // 一時的なチャットの場合、最初のメッセージ送信時に永続化
    if (currentSession?.metadata?.isTemporary) {
      const sessionId = await chatService.createChatSession(user?.id || '');
      if (!sessionId) return;

      // メッセージの永続化
      await Promise.all([
        ...currentSession.messages.map(msg =>
          chatService.saveMessage(sessionId, msg.text, msg.sender)
        )
      ]);

      // メッセージからタイトルを生成
      const newTitle = generateTitle(inputText);

      // チャットセッションの更新
      setState(prevState => ({
        ...prevState,
        chatSessions: prevState.chatSessions.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                id: sessionId,
                metadata: {
                  ...chat.metadata,
                  isTemporary: false
                },
                title: newTitle
              }
            : chat
        ),
        currentChatId: sessionId
      }));
    }
    console.log('Sending message:', { inputText, hasAudioFile: !!audioFile, currentChatId });

    await withErrorHandling(async () => {
      const messageText = audioFile
        ? !inputText.trim()
          ? `音声ファイル「${audioFile.name}」を分析してください。`
          : `${inputText.trim()}\n\n[音声ファイル: ${audioFile.name}]`
        : inputText.trim();

      const isSystemMessage = messageText.includes('モードを') || 
                            messageText.includes('チャットを切り替えました');

      const userMessage = transformMessage({
        id: crypto.randomUUID(),
        text: messageText,
        sender: isSystemMessage ? 'ai' : 'user',
        timestamp: new Date(),
        type: isSystemMessage ? 'mode_change' : 'normal'
      });

      // まずローカル状態を更新
      setState(prevState => ({
        ...prevState,
        chatSessions: prevState.chatSessions.map(chat =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, userMessage],
                lastMessage: new Date(),
              }
            : chat
        ),
      }));

      // データベースに保存
      await chatService.saveMessage(currentChatId, userMessage.text, userMessage.sender);
      
      if (isSystemMessage) {
        return;
      }


      setIsTyping(true);

      try {
        // ネットワークチェック
        const mobileInfo = getMobileInfo();
        if (mobileInfo.isMobile && !mobileInfo.online) {
          throw new Error('オフライン状態です。インターネット接続を確認してください。');
        }
        
        if (mobileInfo.isMobile) {
          const networkOk = await checkNetworkStatus();
          if (!networkOk) {
            throw new Error('ネットワーク接続が不安定です。');
          }
        }

        let difyRes;
        try {
          difyRes = await sendMessageToDify(
            messageText,
            currentMode,
            audioFile
          );
          if (!difyRes || !difyRes.answer) {
            throw new Error('応答の取得に失敗しました。もう一度お試しください。');
          }
        } catch (difyError) {
          console.error('Dify API error:', difyError);
          if (difyError instanceof Error) {
            // カスタムエラーメッセージがある場合はそれを使用
            if (difyError.message.includes('応答時間が長すぎます') || 
                difyError.message.includes('タイムアウト')) {
              throw difyError;
            }
            // その他のエラーの場合は一般的なメッセージ
            throw new Error('応答の取得に失敗しました。ネットワーク接続を確認してください。');
          }
          throw difyError;
        }

        const aiMessage = transformMessage({
          id: crypto.randomUUID(),
          text: difyRes.answer ?? '（回答が空でした）',
          sender: 'ai',
          timestamp: new Date(),
          type: 'normal'
        });

        // まずローカル状態を更新
        setState(prevState => ({
          ...prevState,
          chatSessions: prevState.chatSessions.map(chat =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: [...chat.messages, aiMessage],
                  lastMessage: new Date(),
                }
              : chat
          ),
        }));

        await chatService.saveMessage(currentChatId, aiMessage.text, aiMessage.sender);

      } catch (err) {
        const errorCategory = categorizeError(err);
        const errorText = getMobileErrorMessage(errorCategory);
        
        const errorMessage = transformMessage({
          id: crypto.randomUUID(),
          text: err instanceof Error && err.message.length < 200
            ? `${errorText} (詳細: ${err.message})`
            : errorText,
          sender: 'ai',
          timestamp: new Date(),
          type: 'normal'
        });

        setState(prevState => ({
          ...prevState,
          chatSessions: prevState.chatSessions.map(chat =>
            chat.id === currentChatId
              ? {
                  ...chat,
                  messages: [...chat.messages, errorMessage],
                  lastMessage: new Date(),
                }
              : chat
          ),
        }));

        await chatService.saveMessage(currentChatId, errorMessage.text, errorMessage.sender);
      } finally {
        setIsTyping(false);
      }
    }, (error) => {
      console.error('Error sending message:', error);
    });
  }, [currentChatId, currentMode, setChatSessions]);

  const currentChat = chatSessions?.find?.((c) => c.id === currentChatId) || null;
  const messages = currentChat?.messages ?? [];

  return {
    chatSessions,
    currentChatId,
    messages,
    isTyping,
    isLoading,
    selectChat,
    createNewChat,
    deleteChat,
    sendMessage,
    currentMode,
    setCurrentMode,
  };
};