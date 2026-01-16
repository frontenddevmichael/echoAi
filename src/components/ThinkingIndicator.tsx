import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThinkingIndicatorProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThinkingIndicator({ className, size = 'md' }: ThinkingIndicatorProps) {
  const sizeClasses = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  return (
    <div className={cn('relative overflow-hidden rounded-full', sizeClasses[size], className)}>
      {/* Background track */}
      <div className="absolute inset-0 bg-muted rounded-full" />
      
      {/* Liquid ripple effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Secondary wave */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

export function ThinkingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
