import { memo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { ThinkingIndicator } from '@/components/ThinkingIndicator';
import { CodeBlock } from '@/components/CodeBlock';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isThinking?: boolean;
  timestamp?: Date;
  enableStreaming?: boolean;
}

/**
 * Production-grade chat message component
 * 
 * - Clean, minimal design
 * - Professional streaming text animation (ChatGPT-style)
 * - Subtle copy functionality
 * - Calm thinking state
 */
export const ChatMessage = memo(function ChatMessage({
  role,
  content,
  isThinking = false,
  timestamp,
  enableStreaming = false,
}: ChatMessageProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(!enableStreaming || isUser);

  // ChatGPT-style streaming effect
  useEffect(() => {
    if (!enableStreaming || isUser) {
      setDisplayedContent(content);
      setIsComplete(true);
      return;
    }

    // Reset if content changed
    if (content.length < displayedContent.length) {
      setDisplayedContent('');
      setIsComplete(false);
    }

    if (displayedContent.length >= content.length) {
      setIsComplete(true);
      return;
    }

    // Progressive reveal - 4 chars at a time, 15ms delay
    const timer = setTimeout(() => {
      const nextLength = Math.min(displayedContent.length + 4, content.length);
      setDisplayedContent(content.slice(0, nextLength));
    }, 15);

    return () => clearTimeout(timer);
  }, [content, displayedContent, enableStreaming, isUser]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [content]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex w-full gap-3 px-4 py-3 group',
        isUser ? 'justify-end' : 'justify-start'
      )}
      role="article"
      aria-label={`${isUser ? 'Your' : 'Assistant'} message`}
    >
      {/* Assistant avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isThinking ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ThinkingIndicator size="sm" />
              </motion.div>
            ) : (
              <motion.div
                key="bot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Bot className="w-4 h-4 text-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Message content */}
      <div className={cn(
        'flex flex-col gap-1 min-w-0',
        'max-w-[85%] sm:max-w-[75%]'
      )}>
        <div
          className={cn(
            'relative rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-foreground text-background rounded-tr-md'
              : 'bg-muted text-foreground rounded-tl-md'
          )}
        >
          {isThinking ? (
            <div className="flex items-center gap-2 py-1">
              <ThinkingIndicator size="sm" />
              <span className="text-muted-foreground text-sm">Thinking...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic">{children}</em>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const isBlock = Boolean(match);
                    
                    if (isBlock) {
                      return (
                        <CodeBlock
                          code={String(children).replace(/\n$/, '')}
                          language={match?.[1] || 'text'}
                          expandable={false}
                          showLineNumbers={false}
                        />
                      );
                    }
                    
                    return (
                      <code
                        className={cn(
                          'px-1.5 py-0.5 rounded text-xs font-mono',
                          isUser
                            ? 'bg-background/20'
                            : 'bg-foreground/10'
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <div className="my-2">{children}</div>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground my-2">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {displayedContent}
              </ReactMarkdown>
              
              {/* Streaming cursor */}
              {!isComplete && (
                <motion.span
                  className="inline-block w-0.5 h-4 bg-current/60 ml-0.5 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>
          )}

          {/* Copy button */}
          {!isUser && !isThinking && (
            <button
              onClick={handleCopy}
              className={cn(
                'absolute -top-2 -right-2 p-1.5 rounded-full',
                'bg-background border border-border shadow-sm',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20'
              )}
              aria-label={copied ? 'Copied' : 'Copy message'}
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && !isThinking && (
          <span className={cn(
            'text-xs text-muted-foreground px-1',
            isUser ? 'text-right' : 'text-left'
          )}>
            {formatTime(timestamp)}
          </span>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </motion.div>
  );
});
