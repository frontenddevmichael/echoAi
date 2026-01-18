import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    isThinking?: boolean;
    timestamp?: Date;
    enableStreaming?: boolean;
}

export function ChatMessage({
    role,
    content,
    isThinking,
    timestamp = new Date(),
    enableStreaming = false
}: ChatMessageProps) {
    const isUser = role === 'user';
    const [copied, setCopied] = useState(false);
    const [displayedContent, setDisplayedContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(enableStreaming && !isUser);

    // Streaming text effect
    useEffect(() => {
        if (!isStreaming) {
            setDisplayedContent(content);
            return;
        }

        let index = 0;
        setDisplayedContent('');

        const interval = setInterval(() => {
            if (index < content.length) {
                setDisplayedContent(content.slice(0, index + 1));
                index++;
            } else {
                setIsStreaming(false);
                clearInterval(interval);
            }
        }, 20);

        return () => clearInterval(interval);
    }, [content, isStreaming]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
                'flex w-full gap-3 px-4 py-2 group',
                isUser ? 'justify-end' : 'justify-start'
            )}
            role="article"
            aria-label={`${isUser ? 'User' : 'Assistant'} message`}
        >
            {/* Assistant avatar */}
            {!isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center mt-1">
                    <AnimatePresence mode="wait">
                        {isThinking ? (
                            <motion.div
                                key="thinking"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-0.5"
                                aria-label="Assistant is thinking"
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        animate={{
                                            y: [0, -4, 0],
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            repeat: Infinity,
                                            delay: i * 0.15,
                                            ease: 'easeInOut',
                                        }}
                                        className="text-xs"
                                    >
                                        •
                                    </motion.span>
                                ))}
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

            {/* Message bubble with copy button */}
            <div className="flex flex-col gap-1 max-w-[75%]">
                <div
                    className={cn(
                        'rounded-2xl px-4 py-2.5 text-sm leading-relaxed relative',
                        isUser
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                    )}
                >
                    {/* Wrapper div with prose styles */}
                    <div
                        className={cn(
                            "prose prose-sm max-w-none",
                            isUser
                                ? "prose-invert"
                                : "dark:prose-invert"
                        )}
                    >
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => (
                                    <p className="mb-2 last:mb-0">{children}</p>
                                ),
                                code: ({ inline, children, ...props }) =>
                                    inline ? (
                                        <code
                                            className={cn(
                                                "px-1.5 py-0.5 rounded text-xs font-mono",
                                                isUser
                                                    ? "bg-primary-foreground/20"
                                                    : "bg-muted-foreground/20"
                                            )}
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    ) : (
                                        <pre
                                            className={cn(
                                                "p-3 rounded-lg my-2 overflow-x-auto",
                                                isUser
                                                    ? "bg-primary-foreground/10"
                                                    : "bg-muted-foreground/10"
                                            )}
                                        >
                                            <code className="text-xs font-mono">{children}</code>
                                        </pre>
                                    ),
                                ul: ({ children }) => (
                                    <ul className="list-disc list-inside mb-2 space-y-1">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal list-inside mb-2 space-y-1">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="ml-2">{children}</li>
                                ),
                                a: ({ children, href }) => (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline hover:opacity-80 transition-opacity"
                                    >
                                        {children}
                                    </a>
                                ),
                                strong: ({ children }) => (
                                    <strong className="font-semibold">{children}</strong>
                                ),
                            }}
                        >
                            {displayedContent}
                        </ReactMarkdown>
                    </div>

                    {/* Streaming cursor */}
                    {isStreaming && (
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="inline-block w-1.5 h-4 bg-current ml-0.5 align-middle"
                        />
                    )}

                    {/* Copy button */}
                    {!isUser && !isThinking && (
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "absolute -bottom-7 right-0 transition-opacity p-1.5 rounded-md",
                                "opacity-0 group-hover:opacity-100",
                                "hover:bg-muted-foreground/10"
                            )}
                            aria-label="Copy message"
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <Check className="w-3.5 h-3.5 text-green-600" />
                            ) : (
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                        </button>
                    )}
                </div>

                {/* Timestamp */}
                {!isThinking && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className={cn(
                            "text-xs text-muted-foreground px-1",
                            isUser ? "text-right" : "text-left"
                        )}
                    >
                        {formatTime(timestamp)}
                    </motion.span>
                )}
            </div>

            {/* User avatar */}
            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-1">
                    <User className="w-4 h-4 text-primary-foreground" />
                </div>
            )}
        </motion.div>
    );
}