import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { triggerLight, triggerMedium } = useHaptics();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleSubmit = useCallback(() => {
    if (!value.trim() || isLoading) return;
    triggerMedium();
    onSubmit();
  }, [value, isLoading, onSubmit, triggerMedium]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <div className="sticky bottom-0 safe-area-inset bg-gradient-to-t from-background via-background to-transparent pt-4 pb-4 px-4">
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-3xl mx-auto"
      >
        <div className="rounded-2xl border border-border bg-background p-2 shadow-sm">
          <div className="flex items-end gap-2">
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className={cn(
                  'w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none',
                  'text-sm leading-relaxed placeholder:text-muted-foreground/50',
                  'min-h-[40px] max-h-[160px] py-2.5 px-2'
                )}
                rows={1}
              />
            </div>

            {/* Submit button */}
            <Button
              variant={value.trim() ? 'default' : 'ghost'}
              size="icon"
              onClick={handleSubmit}
              disabled={!value.trim() || isLoading}
              className={cn(
                'flex-shrink-0 h-9 w-9 rounded-xl transition-all',
                value.trim() && !isLoading && 'shadow-sm'
              )}
            >
              {isLoading ? (
                <Square className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Hint text */}
        <p className="text-center text-xs text-muted-foreground/50 mt-2">
          Enter to send
        </p>
      </motion.div>
    </div>
  );
}
