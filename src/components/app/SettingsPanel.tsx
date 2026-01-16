import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Vibrate, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { apiKey, setApiKey, apiProvider, setApiProvider } = useApp();
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
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border shadow-echo-xl overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-semibold">Settings</h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-8">
                {/* Appearance */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        <div>
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">
                            {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
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
                          <Vibrate className="w-5 h-5" />
                          <div>
                            <p className="font-medium">Haptic Feedback</p>
                            <p className="text-sm text-muted-foreground">
                              Feel interactions on your device
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

                {/* AI Configuration */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    AI Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="provider" className="mb-2 block">
                        AI Provider
                      </Label>
                      <Select value={apiProvider} onValueChange={(v) => setApiProvider(v as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openrouter">OpenRouter</SelectItem>
                          <SelectItem value="together">Together AI</SelectItem>
                          <SelectItem value="huggingface">HuggingFace</SelectItem>
                          <SelectItem value="custom">Custom Endpoint</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="apiKey" className="mb-2 block">
                        API Key
                      </Label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="apiKey"
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter your API key"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Your API key is stored locally and never sent to our servers.
                      </p>
                    </div>
                  </div>
                </section>

                {/* About */}
                <section>
                  <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                    About
                  </h3>
                  <div className="echo-surface rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center">
                        <span className="text-background font-bold text-xl">e</span>
                      </div>
                      <div>
                        <p className="font-semibold">Echo</p>
                        <p className="text-sm text-muted-foreground">Version 1.0.0</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      An AI-powered coding assistant that feels alive in your hands.
                    </p>
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
