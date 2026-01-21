import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThinkingIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Professional AI thinking indicator - calm, subtle, no flashy effects
 * Inspired by ChatGPT/Claude's understated loading states
 */
export function ThinkingIndicator({ className, size = 'md' }: ThinkingIndicatorProps) {
  const sizeClasses = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  };

  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  return (
    <div 
      className={cn(
        'flex items-center', 
        sizeClasses[size], 
        className
      )}
      role="status"
      aria-label="Thinking..."
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'rounded-full bg-muted-foreground/60',
            dotSizes[size]
          )}
          animate={{
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Inline thinking text with subtle animation
 */
export function ThinkingText({ className }: { className?: string }) {
  return (
    <motion.span
      className={cn('text-muted-foreground text-sm', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <span className="inline-flex items-center gap-2">
        Thinking
        <ThinkingIndicator size="sm" />
      </span>
    </motion.span>
  );
}

/**
 * Block-level thinking state for message bubbles
 */
export function ThinkingBlock({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 py-2',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ThinkingIndicator size="md" />
      <span className="text-sm text-muted-foreground">Generating response...</span>
    </motion.div>
  );
}
