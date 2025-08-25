import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormattedText } from '../utils/textFormatter';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant' | 'system' | 'tool';
  timestamp: Date;
  type?: 'mode_change' | 'normal' | 'system';
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  copiedMessageId?: string;
  onCopyMessage?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isTyping, copiedMessageId, onCopyMessage }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div 
      className="flex-1 overflow-y-auto p-4 space-y-3 bg-transparent"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <motion.div
              className={`max-w-[75%] rounded-xl border-2 border-gray-300 hover:border-gray-400 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 ${
                message.sender === 'user'
                  ? 'bg-white text-black'
                  : message.type === 'system'
                  ? 'bg-white text-black'
                  : 'bg-white text-black'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <FormattedText text={message.text} className="whitespace-pre-wrap flex-1 leading-relaxed text-black" />
                {onCopyMessage && message.sender !== 'system' && (
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCopyMessage(message.id)}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 opacity-70 hover:opacity-100 transition-all duration-200"
                    title="コピー"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </motion.button>
                )}
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.3 }}
                className="text-xs mt-1 text-gray-500 flex items-center gap-1"
              >
                <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {message.timestamp.toLocaleTimeString('ja-JP', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </motion.p>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      <AnimatePresence>
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-3 text-black">
              <motion.img 
                src="/image/clover.svg" 
                alt="loading"
                className="w-12 h-12 lg:w-14 lg:h-14"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.span
                key="loading-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="text-sm text-gray-700"
              >
                <LoadingText />
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div ref={messagesEndRef} />
    </motion.div>
  );
};

// ローディング文言コンポーネント
const LoadingText: React.FC = () => {
  const messages = React.useMemo(() => [
    '少々お待ちください…',
    '回答を作成しています…',
    '関連情報を整理しています…',
    '最適な表現に整えています…',
    '応答の品質を確認しています…'
  ], []);

  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % messages.length), 5000);
    return () => clearInterval(t);
  }, [messages.length]);

  return <>{messages[idx]}</>;
};

export default MessageList;