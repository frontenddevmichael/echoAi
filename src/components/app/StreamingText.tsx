import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/CodeBlock';

interface StreamingTextProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  speed?: 'fast' | 'normal' | 'slow';
}

/**
 * ChatGPT-style progressive text reveal
 * 
 * - Smooth character-by-character appearance
 * - No bouncing, scaling, or novelty effects
 * - Maintains readability at all times
 * - Natural, confident cadence
 */
export function StreamingText({ 
  content, 
  isStreaming = true, 
  className,
  speed = 'normal'
}: StreamingTextProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Speed configurations (characters per batch, delay between batches)
  const speedConfig = useMemo(() => ({
    fast: { chars: 8, delay: 10 },
    normal: { chars: 4, delay: 15 },
    slow: { chars: 2, delay: 25 },
  }), []);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      setIsComplete(true);
      return;
    }

    // Reset when content changes significantly
    if (content.length < displayedContent.length) {
      setDisplayedContent('');
      setIsComplete(false);
    }

    if (displayedContent.length >= content.length) {
      setIsComplete(true);
      return;
    }

    const { chars, delay } = speedConfig[speed];
    
    const timer = setTimeout(() => {
      const nextLength = Math.min(
        displayedContent.length + chars,
        content.length
      );
      setDisplayedContent(content.slice(0, nextLength));
    }, delay);

    return () => clearTimeout(timer);
  }, [content, displayedContent, isStreaming, speed, speedConfig]);

  // Markdown components for consistent styling
  const markdownComponents = useMemo(() => ({
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {children}
      </a>
    ),
    code: ({ inline, className: codeClassName, children }: { 
      inline?: boolean; 
      className?: string; 
      children?: React.ReactNode 
    }) => {
      if (inline) {
        return (
          <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">
            {children}
          </code>
        );
      }
      
      const match = /language-(\w+)/.exec(codeClassName || '');
      const language = match ? match[1] : 'text';
      
      return (
        <CodeBlock 
          code={String(children).replace(/\n$/, '')} 
          language={language}
          expandable={false}
        />
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <div className="my-3">{children}</div>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground my-3">
        {children}
      </blockquote>
    ),
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-xl font-semibold mb-2 mt-4 first:mt-0">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-lg font-semibold mb-2 mt-4 first:mt-0">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>
    ),
  }), []);

  return (
    <motion.div
      className={cn('text-sm sm:text-base', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      <ReactMarkdown components={markdownComponents as any}>
        {displayedContent}
      </ReactMarkdown>
      
      {/* Subtle cursor when still streaming */}
      {isStreaming && !isComplete && (
        <motion.span
          className="inline-block w-0.5 h-4 bg-foreground/60 ml-0.5 align-middle"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
