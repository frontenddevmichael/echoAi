import { motion, AnimatePresence } from 'framer-motion';
import { X, Vibrate, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { isDark, toggle } = useTheme();
  const { isEnabled, isSupported, toggle: toggleHaptics, triggerLight } = useHaptics();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-background border-l border-border overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-medium">Settings</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Appearance */}
                <section>
                  <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isDark ? <Moon className="w-4 h-4 text-muted-foreground" /> : <Sun className="w-4 h-4 text-muted-foreground" />}
                        <div>
                          <p className="text-sm font-medium">Dark Mode</p>
                          <p className="text-xs text-muted-foreground">
                            {isDark ? 'Dark theme active' : 'Light theme active'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isDark}
                        onCheckedChange={() => {
                          triggerLight();
                          toggle();
                        }}
                      />
                    </div>

                    {isSupported && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Vibrate className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Haptic Feedback</p>
                            <p className="text-xs text-muted-foreground">
                              Subtle touch feedback
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={toggleHaptics}
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* About */}
                <section>
                  <h3 className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                    About
                  </h3>
                  <div className="rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center">
                        <span className="text-background font-semibold text-lg">e</span>
                      </div>
                      <div>
                        <p className="font-medium">Echo</p>
                        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
