import { motion } from 'framer-motion';
import { MessageSquare, Code2, Wrench, BookOpen, Sparkles } from 'lucide-react';
import { AIMode } from '@/context/AppContext';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  mode: AIMode;
  onModeChange: (mode: AIMode) => void;
}

const modes: { id: AIMode; icon: typeof MessageSquare; label: string }[] = [
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'code_generation', icon: Code2, label: 'Generate' },
  { id: 'code_modification', icon: Sparkles, label: 'Modify' },
  { id: 'code_explanation', icon: BookOpen, label: 'Explain' },
  { id: 'debugging', icon: Wrench, label: 'Debug' },
];

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  const { triggerSelection } = useHaptics();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border">
      {modes.map((m) => {
        const isActive = mode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => {
              triggerSelection();
              onModeChange(m.id);
            }}
            className={cn(
              'relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center',
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="mode-indicator"
                className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border"
                transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <m.icon className="w-4 h-4" />
              <span className="hidden lg:inline">{m.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
