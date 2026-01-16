import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Settings, Trash2, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useApp, AIMode } from '@/context/AppContext';
import { ModeSelector } from '@/components/app/ModeSelector';
import { SettingsPanel } from '@/components/app/SettingsPanel';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const { triggerLight, triggerWarning } = useHaptics();
  const { clearMessages, mode, setMode } = useApp();

  const handleThemeToggle = () => {
    triggerLight();
    toggle();
  };

  const handleClear = () => {
    triggerWarning();
    clearMessages();
  };

  return (
    <>
      <header className="sticky top-0 z-40 safe-area-inset">
        <div className="echo-glass border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-lg">e</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">echo</span>
            </motion.a>

            {/* Mode selector - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-4">
              <ModeSelector mode={mode} onModeChange={setMode} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleThemeToggle}
                className="text-muted-foreground"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isDark ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </motion.div>
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleClear}
                className="text-muted-foreground hidden sm:flex"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  triggerLight();
                  setSettingsOpen(true);
                }}
                className="text-muted-foreground"
              >
                <Settings className="w-4 h-4" />
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  triggerLight();
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                className="md:hidden"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden md:hidden echo-glass border-b border-border"
            >
              <div className="p-4">
                <ModeSelector mode={mode} onModeChange={(m) => {
                  setMode(m);
                  setMobileMenuOpen(false);
                }} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="w-full mt-3 text-muted-foreground"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear conversation
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
