import { useState, useCallback, useEffect } from 'react';
import { ChatSession } from '../types/chat';
import { sendMessageToDify, ModeType } from '../../../lib/dify';
import { chatService } from '../../../lib/chatService';
import { useAuth } from '../../../contexts/AuthContext';
import { transformMessage } from '../utils/validation';
import { generateUUID } from '../../../lib/chatService';

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
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentMode, setCurrentMode] = useState<ModeType>(initialMode);

  const currentChatId = currentSession?.id || '';
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSessions = useCallback(async () => {
    if (!user?.id) return;
    try {
      console.log('[useChatSessions] Loading sessions for user:', user.id);
      const sessions = await chatService.getChatSessions(user.id);
      setSessions(sessions);
      console.log('[useChatSessions] Sessions loaded successfully:', sessions.length);
      
      // セッション一覧が更新されたことをログ出力
      console.log('[useChatSessions] Updated sessions list:', sessions.map(s => ({ id: s.id, title: s.title })));
    } catch (error) {
      console.error('[useChatSessions] Failed to load sessions:', error);
      // エラーが発生しても空配列を設定して続行
      setSessions([]);
    }
  }, [user?.id]);

  const updateCurrentSession = useCallback((updater: (prev: ChatSession | null) => ChatSession | null) => {
    setCurrentSession(updater);
  }, []);

  // 現在のセッションの読み込み
  const loadCurrentSession = useCallback(async (sessionId?: string, force: boolean = false) => {
    // 既にセッションがある場合は強制フラグがない限り再ロードしない
    if (currentSession && !force) return;
    console.log('[useChatSessions] loadCurrentSession called', { sessionId, userId: user?.id });
    
    if (!user?.id) {
      console.log('[useChatSessions] No user ID, setting loading to false');
      setIsLoading(false);
      return;
    }

    try {
      if (sessionId) {
        console.log('[useChatSessions] Loading session:', sessionId);
        const session = await chatService.getChatSession(sessionId);
        if (session) {
          setCurrentSession(session);
          console.log('[useChatSessions] Session loaded successfully');
          setIsLoading(false);
          return;
        }
      }
      
      // セッションIDが指定されていないか、取得に失敗した場合は新規作成
      console.log('[useChatSessions] Creating new chat session');
      
      // 新規チャット作成のロジックを直接実行
      try {
        const sessionId = await chatService.createChatSession(user.id);
        if (!sessionId) {
          console.error('[useChatSessions] Failed to create session ID');
          setIsLoading(false);
          return;
        }

        const initialMessage = transformMessage({
          id: generateUUID(),
          text: `こんにちは！私はAIアシスタントです。
医療に関する一般的な質問に回答させていただきます。

ご不明な点がございましたら、お気軽にお尋ねください。`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'normal'
        });

        console.log('[useChatSessions] Initial message created:', { sender: initialMessage.sender, text: initialMessage.text.substring(0, 50) });

        await chatService.saveMessage(sessionId, initialMessage.text, initialMessage.sender, user?.id);

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

        setCurrentSession(newChat);
        console.log('[useChatSessions] New chat session created successfully');
        setIsLoading(false);
      } catch (newChatError) {
        console.error('[useChatSessions] Error creating new chat:', newChatError);
        setIsLoading(false);
        // エラー時は空のセッションを設定してUIを表示可能にする
        setCurrentSession(null);
      }
    } catch (error) {
      console.error('[useChatSessions] Error loading current session:', error);
      setIsLoading(false);
      // エラー時は空のセッションを設定してUIを表示可能にする
      setCurrentSession(null);
    }
  }, [user?.id, currentMode]);

  // 新しいチャットセッションの作成
  const createNewChat = useCallback(async () => {
    if (!user?.id) return null;

    // 重複実行を防ぐためのフラグ
    if (isLoading) {
      console.log('[useChatSessions] Already loading, skipping createNewChat');
      return null;
    }

    try {
      console.log('[useChatSessions] Creating new chat session...');
      setIsLoading(true);
      
      const sessionId = await chatService.createChatSession(user.id);
      if (!sessionId) {
        console.error('[useChatSessions] Failed to create session ID');
        setIsLoading(false);
        return null;
      }

      console.log('[useChatSessions] Session created with ID:', sessionId);

      const initialMessage = transformMessage({
        id: generateUUID(),
        text: `こんにちは！私はAIアシスタントです。
医療に関する一般的な質問に回答させていただきます。

ご不明な点がございましたら、お気軽にお尋ねください。`,
        sender: 'ai',
        timestamp: new Date(),
        type: 'normal'
      });

      console.log('[useChatSessions] Initial message created (createNewChat):', { sender: initialMessage.sender, text: initialMessage.text.substring(0, 50) });

      await chatService.saveMessage(sessionId, initialMessage.text, initialMessage.sender, user?.id);

      // セッション一覧を更新
      await loadSessions();
      
      // 新しく作成したセッションを現在のセッションとして設定
      const session = await chatService.getChatSession(sessionId);
      if (session) {
        setCurrentSession(session);
        console.log('[useChatSessions] New chat session created and loaded successfully');
        setIsLoading(false);
        return session;
      }
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error('[useChatSessions] Error creating new chat:', error);
      setIsLoading(false);
      return null;
    }
  }, [user?.id, currentMode, isLoading, loadSessions]);

  // チャットセッションの選択
  const selectChat = useCallback(async (id: string) => {
    try {
      console.log('[useChatSessions] Selecting chat:', id);
      setIsLoading(true);
      await loadCurrentSession(id);
    } catch (error) {
      console.error('[useChatSessions] Error selecting chat:', error);
      setIsLoading(false);
      // エラー時は現在のセッションをクリア
      setCurrentSession(null);
    }
  }, [loadCurrentSession]);

  // チャットセッションの削除
  const deleteChat = useCallback(async (chatId: string) => {
    try {
      console.log('[useChatSessions] Deleting chat:', chatId);
      await chatService.deleteChatSession(chatId);
      // セッション一覧を更新
      await loadSessions();
      if (currentChatId === chatId) {
        console.log('[useChatSessions] Deleted current chat, creating new one...');
        await createNewChat();
      }
    } catch (error) {
      console.error('[useChatSessions] Error deleting chat:', error);
    }
  }, [currentChatId, createNewChat, loadSessions]);

  // 全チャットセッションの一括削除
  const deleteAllChats = useCallback(async () => {
    try {
      // 確認ダイアログ
      const confirmed = window.confirm(
        `全${sessions.length}件のチャット履歴を削除しますか？\nこの操作は取り消せません。`
      );
      
      if (!confirmed) {
        console.log('[useChatSessions] Delete all chats cancelled by user');
        return;
      }
      
      console.log('[useChatSessions] Deleting all chats');
      
      // 現在のセッションIDを保存
      const currentSessionId = currentChatId;
      
      // 全セッションを削除
      const deletePromises = sessions.map(session => 
        chatService.deleteChatSession(session.id)
      );
      
      await Promise.all(deletePromises);
      console.log('[useChatSessions] All chats deleted successfully');
      
      // セッション一覧をクリア
      setSessions([]);
      setCurrentSession(null);
      
      // 新しいチャットを作成
      await createNewChat();
      
    } catch (error) {
      console.error('[useChatSessions] Error deleting all chats:', error);
    }
  }, [sessions, currentChatId, createNewChat]);

  // メッセージ送信
  const sendMessage = useCallback(async (inputText: string, audioFile?: File, imageFile?: File) => {
    if ((!inputText.trim() && !audioFile && !imageFile) || !currentChatId) return;

    // デバッグログを追加
    console.log('[useChatSessions] sendMessage called with:', {
      inputText: inputText?.substring(0, 100),
      hasAudioFile: !!audioFile,
      hasImageFile: !!imageFile,
      audioFileName: audioFile?.name,
      imageFileName: imageFile?.name,
      imageFileSize: imageFile?.size,
      imageFileType: imageFile?.type,
      currentMode
    });

    try {
      let messageText = inputText.trim();
      
      if (audioFile) {
        messageText += !messageText ? `音声ファイル「${audioFile.name}」を分析してください。` : `\n\n[音声ファイル: ${audioFile.name}]`;
      }
      
      if (imageFile) {
        messageText += !messageText ? `画像ファイル「${imageFile.name}」を分析してください。` : `\n\n[画像ファイル: ${imageFile.name}]`;
      }

      const userMessage = transformMessage({
        id: generateUUID(),
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
        type: 'normal'
      });

      console.log('[useChatSessions] User message created:', { sender: userMessage.sender, text: userMessage.text.substring(0, 50) });

      if (currentSession) {
        updateCurrentSession(prev => prev ? {
          ...prev,
          messages: [...prev.messages, userMessage],
          lastMessage: new Date(),
        } : null);
      }

      setIsTyping(true);
      await chatService.saveMessage(currentChatId, userMessage.text, userMessage.sender, user?.id);

      try {
        console.log('[useChatSessions] Calling sendMessageToDify with imageFile:', {
          hasImageFile: !!imageFile,
          imageFileName: imageFile?.name,
          imageFileSize: imageFile?.size,
          imageFileType: imageFile?.type
        });
        
        // 画像ファイルの詳細ログ
        if (imageFile) {
          console.log('[useChatSessions] Image file being sent to Dify:', {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type,
            lastModified: imageFile.lastModified
          });
        }
        
        const difyRes = await sendMessageToDify(messageText, currentMode, audioFile, imageFile);
        
        if (!difyRes || !difyRes.answer) {
          throw new Error('応答の取得に失敗しました');
        }

        const aiMessage = transformMessage({
          id: generateUUID(),
          text: difyRes.answer,
          sender: 'ai',
          timestamp: new Date(),
          type: 'normal'
        });

        console.log('[useChatSessions] AI message created:', { sender: aiMessage.sender, text: aiMessage.text.substring(0, 50) });

        if (currentSession) {
          updateCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, aiMessage],
            lastMessage: new Date(),
          } : null);
        }

        await chatService.saveMessage(currentChatId, aiMessage.text, aiMessage.sender);
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage = transformMessage({
          id: generateUUID(),
          text: error instanceof Error ? error.message : '応答の取得に失敗しました',
          sender: 'ai',
          timestamp: new Date(),
          type: 'error'
        });

        console.log('[useChatSessions] Error message created:', { sender: errorMessage.sender, text: errorMessage.text });

        if (currentSession) {
          updateCurrentSession(prev => prev ? {
            ...prev,
            messages: [...prev.messages, errorMessage],
            lastMessage: new Date(),
          } : null);
        }

        await chatService.saveMessage(currentChatId, errorMessage.text, errorMessage.sender);
      } finally {
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  }, [currentChatId, currentMode, currentSession, updateCurrentSession]);

  // セッション自動リロード
  useEffect(() => {
    const initializeChat = async () => {
      if (user?.id) {
        console.log('[useChatSessions] User authenticated, loading sessions...');
        await loadSessions();
        if (!currentSession) {
          console.log('[useChatSessions] No current session, creating new one...');
          await loadCurrentSession();
        }
      } else {
        console.log('[useChatSessions] No user ID, clearing sessions');
        setSessions([]);
        setCurrentSession(null);
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [user?.id, currentSession?.id]);

  const messages = currentSession?.messages ?? [];

  return {
    currentSession,
    sessions,
    messages,
    isTyping,
    isLoading,
    selectChat,
    createNewChat,
    deleteChat,
    deleteAllChats,
    sendMessage,
    currentMode,
    setCurrentMode,
    loadCurrentSession: () => loadCurrentSession(),
    loadSessions,
  };
};