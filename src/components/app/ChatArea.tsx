import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';

interface ChatAreaProps {
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  isLoading: boolean;
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto py-4" style={{width:"80%", margin:"auto"}}>
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            role={message.role}
            content={message.content}
            // Only the latest assistant message animates if AI is thinking
            isThinking={
              message.role === 'assistant' &&
              isLoading &&
              index === messages.length - 1
            }
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
