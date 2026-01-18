import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSuggestedPrompt?: (prompt: string) => void;
}

export function ChatArea({ messages, isLoading, onSuggestedPrompt }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState('100%');

  // Calculate available height
  useLayoutEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const container = containerRef.current?.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        const availableHeight = viewportHeight - rect.top - 150; // 150px for input area
        setHeight(`${availableHeight}px`);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto py-4 scroll-smooth"
      style={{
        width: "80%",
        margin: "auto",
        height: height
      }}
      role="log"
      aria-label="Chat conversation"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4"
          >
            <div className="max-w-md space-y-3">
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome to Echo AI
              </h2>
              <p className="text-muted-foreground">
                Start a conversation by typing a message below
              </p>

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 gap-2 mt-6">
                {[
                  "Tell me a fun fact",
                  "Help me brainstorm ideas",
                  "Explain a concept",
                ].map((prompt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="px-4 py-2 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
                    onClick={() => onSuggestedPrompt?.(prompt)}
                  >
                    {prompt}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              enableStreaming={
                message.role === 'assistant' &&
                index === messages.length - 1 &&
                !isLoading
              }
              isThinking={
                message.role === 'assistant' &&
                isLoading &&
                index === messages.length - 1
              }
            />
          ))
        )}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}