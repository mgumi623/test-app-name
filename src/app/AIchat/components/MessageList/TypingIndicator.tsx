import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loading } from '@/components/ui/loading';
import { Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TypingIndicator() {
  const messages = [
    "返答を生成しています...",
    "少々お待ちください...",
    "考え中です..."
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((current) => (current + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex justify-start w-full max-w-6xl mx-auto px-4 animate-fade-in mb-6">
      <div className="flex items-start space-x-3 w-full">
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
          <AvatarFallback className="bg-secondary text-white">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm inline-block">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Loading size="sm" className="flex-shrink-0" />
              <p key={currentMessageIndex} className="text-sm text-muted-foreground message-fade-in">
                {messages[currentMessageIndex]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}