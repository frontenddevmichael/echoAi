import { motion } from 'framer-motion';
import { Moon, Sun, Settings, Trash2, Download, Share } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useApp } from '@/context/AppContext';
import { SettingsPanel } from '@/components/app/SettingsPanel';
import { usePWAContext } from '@/context/PWAContext';

export function AppHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const { triggerLight, triggerWarning, triggerMedium } = useHaptics();
  const { clearMessages } = useApp();
  const { 
    canInstall, 
    isInstalled, 
    isStandalone, 
    promptInstall, 
    platform,
    openIOSGuide 
  } = usePWAContext();

  const handleThemeToggle = () => {
    triggerLight();
    toggle();
  };

  const handleClear = () => {
    triggerWarning();
    clearMessages();
  };

  const handleInstall = async () => {
    triggerMedium();
    if (platform === 'ios') {
      openIOSGuide();
    } else {
      await promptInstall();
    }
  };

  const showInstallButton = canInstall && !isInstalled && !isStandalone;

  return (
    <>
      <header className="sticky top-0 z-40 safe-area-top">
        <div className="border-b border-border bg-background/95 backdrop-blur-sm px-4 py-3">
          <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-semibold text-lg">e</span>
              </div>
              <span className="font-medium text-lg">echo</span>
            </motion.a>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Install button */}
              {showInstallButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleInstall}
                  className="text-muted-foreground h-9 w-9 touch-manipulation"
                  aria-label="Install app"
                >
                  {platform === 'ios' ? (
                    <Share className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleThemeToggle}
                className="text-muted-foreground h-9 w-9 touch-manipulation"
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
                size="icon"
                onClick={handleClear}
                className="text-muted-foreground h-9 w-9 touch-manipulation"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  triggerLight();
                  setSettingsOpen(true);
                }}
                className="text-muted-foreground h-9 w-9 touch-manipulation"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
