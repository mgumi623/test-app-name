import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start w-full max-w-4xl mx-auto px-4 animate-fade-in mb-6">
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
          <AvatarFallback className="bg-secondary text-white">
            🤖
          </AvatarFallback>
        </Avatar>
        <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 shadow-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animate-delay-100" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce animate-delay-200" />
          </div>
        </div>
      </div>
    </div>
  );
}