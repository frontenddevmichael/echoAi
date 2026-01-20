import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAContext } from '@/context/PWAContext';
import { useHaptics } from '@/hooks/useHaptics';

export function InstallBanner() {
  const { 
    showInstallBanner, 
    dismissInstallBanner, 
    promptInstall, 
    platform,
    isInstalled,
    isStandalone,
    openIOSGuide
  } = usePWAContext();
  const { triggerMedium, triggerLight } = useHaptics();

  // Don't show if already installed
  if (isInstalled || isStandalone) return null;

  const handleInstall = async () => {
    triggerMedium();
    if (platform === 'ios') {
      openIOSGuide();
    } else {
      await promptInstall();
    }
  };

  const handleDismiss = () => {
    triggerLight();
    dismissInstallBanner();
  };

  return (
    <AnimatePresence>
      {showInstallBanner && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
        >
          <div className="mx-3 mb-3 sm:mx-4 sm:mb-4">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-4 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                {/* App icon */}
                <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0">
                  <span className="text-background font-bold text-xl">e</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">Install Echo</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {platform === 'ios' 
                      ? 'Add to Home Screen for the best experience'
                      : 'Install for offline access & faster loading'}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      className="gap-1.5 touch-manipulation"
                    >
                      {platform === 'ios' ? (
                        <>
                          <Share className="w-4 h-4" />
                          How to Install
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Install
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="text-muted-foreground touch-manipulation"
                    >
                      Not now
                    </Button>
                  </div>
                </div>

                {/* Close button */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-8 w-8 flex-shrink-0 -mt-1 -mr-1 text-muted-foreground touch-manipulation"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
