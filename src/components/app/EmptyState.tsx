import { motion } from 'framer-motion';
import { Code2, MessageSquare, Sparkles, Wrench, BookOpen } from 'lucide-react';
import { AIMode } from '@/context/AppContext';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  mode: AIMode;
  onExampleClick: (text: string) => void;
}

const modeContent: Record<AIMode, {
  icon: typeof Code2;
  title: string;
  description: string;
  examples: string[];
}> = {
  chat: {
    icon: MessageSquare,
    title: 'Chat with Echo',
    description: 'Ask anything about coding, get explanations, or just have a conversation.',
    examples: [
      'What\'s the difference between let and const?',
      'How do I center a div?',
      'Explain async/await in simple terms',
    ],
  },
  code_generation: {
    icon: Code2,
    title: 'Generate Code',
    description: 'Describe what you need and get clean, production-ready code.',
    examples: [
      'Create a React hook for form validation',
      'Write a function to debounce API calls',
      'Build a responsive navbar component',
    ],
  },
  code_modification: {
    icon: Sparkles,
    title: 'Modify Code',
    description: 'Paste your code and describe the changes you want.',
    examples: [
      'Add error handling to this function',
      'Convert this to TypeScript',
      'Optimize this for performance',
    ],
  },
  code_explanation: {
    icon: BookOpen,
    title: 'Explain Code',
    description: 'Paste any code snippet to get a clear, detailed explanation.',
    examples: [
      'What does this regex do?',
      'Explain this algorithm step by step',
      'Why is this code using a closure?',
    ],
  },
  debugging: {
    icon: Wrench,
    title: 'Debug Issues',
    description: 'Share your error messages or buggy code and get solutions.',
    examples: [
      'TypeError: Cannot read property of undefined',
      'Why is my useEffect running twice?',
      'My API call returns 403, how do I fix it?',
    ],
  },
};

export function EmptyState({ mode, onExampleClick }: EmptyStateProps) {
  const { triggerLight } = useHaptics();
  const content = modeContent[mode];
  const Icon = content.icon;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="inline-flex p-4 rounded-2xl bg-muted/50 mb-6"
        >
          <Icon className="w-8 h-8 text-muted-foreground" />
        </motion.div>

        {/* Title */}
        <h2 className="text-2xl font-semibold mb-2">{content.title}</h2>
        <p className="text-muted-foreground mb-8">{content.description}</p>

        {/* Examples */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Try asking:</p>
          {content.examples.map((example, i) => (
            <motion.button
              key={example}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => {
                triggerLight();
                onExampleClick(example);
              }}
              className={cn(
                'w-full text-left px-4 py-3 rounded-xl',
                'bg-muted/30 hover:bg-muted/50 border border-border',
                'text-sm text-foreground transition-all',
                'hover:shadow-echo hover:scale-[1.01] active:scale-[0.99]'
              )}
            >
              "{example}"
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
