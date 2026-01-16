import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ value, onChange, onSubmit, isLoading, placeholder }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { triggerLight, triggerMedium } = useHaptics();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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
    <div className="sticky bottom-0 safe-area-inset bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="echo-surface-elevated rounded-2xl p-2">
          <div className="flex items-end gap-2">
            {/* Attachment button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={triggerLight}
              className="text-muted-foreground flex-shrink-0 mb-1"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || "Type your message..."}
                className={cn(
                  'w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none',
                  'text-sm leading-relaxed placeholder:text-muted-foreground/60',
                  'min-h-[40px] max-h-[200px] py-2.5 px-1'
                )}
                rows={1}
              />
            </div>

            {/* Voice button */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={triggerLight}
              className="text-muted-foreground flex-shrink-0 mb-1"
            >
              <Mic className="w-4 h-4" />
            </Button>

            {/* Submit button */}
            <Button
              variant={value.trim() ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={handleSubmit}
              disabled={!value.trim() || isLoading}
              className={cn(
                'flex-shrink-0 mb-1 transition-all',
                value.trim() && !isLoading && 'shadow-echo'
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
        <p className="text-center text-xs text-muted-foreground mt-3">
          Press Enter to send, Shift+Enter for new line
        </p>
      </motion.div>
    </div>
  );
}
