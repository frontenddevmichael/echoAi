import { motion } from 'framer-motion';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  onExampleClick: (text: string) => void;
}

const examples = [
  'Build a React hook for form validation',
  'Why is my useEffect running twice?',
  'Explain how closures work in JavaScript',
  'Debug: TypeError Cannot read property of undefined',
];

export function EmptyState({ onExampleClick }: EmptyStateProps) {
  const { triggerLight } = useHaptics();

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="inline-flex p-4 rounded-2xl bg-muted/30 mb-6"
        >
          <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center">
            <span className="text-background font-semibold text-2xl">e</span>
          </div>
        </motion.div>

        {/* Title */}
        <h2 className="text-xl font-medium mb-2">How can I help?</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Ask anything. I will figure out what you need.
        </p>

        {/* Examples */}
        <div className="space-y-2">
          {examples.map((example, i) => (
            <motion.button
              key={example}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => {
                triggerLight();
                onExampleClick(example);
              }}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl',
                'bg-muted/30 hover:bg-muted/50 border border-border',
                'text-sm text-foreground transition-colors',
                'active:scale-[0.99]'
              )}
            >
              {example}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
