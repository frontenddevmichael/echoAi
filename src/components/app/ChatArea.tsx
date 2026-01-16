import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '@/context/AppContext';
import { CodeBlock } from '@/components/CodeBlock';
import { ThinkingDots } from '@/components/ThinkingIndicator';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

function ChatMessage({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
      className={cn(
        'flex gap-3 px-4 py-4',
        isUser ? 'flex-row-reverse' : ''
      )}
    >
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={cn(
        'flex-1 max-w-3xl',
        isUser ? 'text-right' : ''
      )}>
        <div className={cn(
          'inline-block rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}>
          {/* Text content */}
          {message.content && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          )}
        </div>

        {/* Code block - outside the bubble for better display */}
        {message.code && (
          <div className={cn('mt-3', isUser ? 'text-left' : '')}>
            <CodeBlock
              code={message.code}
              language={message.language || 'typescript'}
            />
          </div>
        )}

        {/* Confidence indicator */}
        {message.confidence !== undefined && !isUser && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-foreground/30"
                initial={{ width: 0 }}
                animate={{ width: `${message.confidence * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <span>{Math.round(message.confidence * 100)}% confidence</span>
          </div>
        )}
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
      <div className="max-w-4xl mx-auto py-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 px-4 py-4"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex items-center">
                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
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
