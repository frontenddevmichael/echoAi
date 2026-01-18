import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    isThinking?: boolean; // NEW: indicates assistant is thinking
}

export function ChatMessage({ role, content, isThinking }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
                'flex w-full gap-3 px-4 py-2',
                isUser ? 'justify-end' : 'justify-start'
            )}
        >
            {/* Assistant avatar */}
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <AnimatePresence>
                        {isThinking ? (
                            <motion.div
                                key="thinking"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-1"
                            >
                                <span className="animate-bounce">•</span>
                                <span className="animate-bounce delay-150">•</span>
                                <span className="animate-bounce delay-300">•</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="bot"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Replace Bot with Echo AI logo later */}
                                <Bot className="w-4 h-4 text-foreground" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Message bubble */}
            <div
                className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap',
                    isUser
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                )}
            >
                {content}
            </div>

            {/* User avatar */}
            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                </div>
            )}
        </motion.div>
    );
}
