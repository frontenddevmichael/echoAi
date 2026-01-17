import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { Message } from '@/context/AppContext';
import { ThinkingDots } from '@/components/ThinkingIndicator';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'flex gap-3 px-4 py-3',
        isUser ? 'flex-row-reverse' : ''
      )}
    >
      {/* Avatar - only for user */}
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-background" />
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'flex-1 max-w-2xl',
        isUser ? 'text-right' : ''
      )}>
        <div className={cn(
          'inline-block rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-foreground text-background'
            : 'text-foreground'
        )}>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex gap-3 px-4 py-3"
            >
              <div className="flex items-center">
                <div className="px-4 py-2.5">
                  <ThinkingDots />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
