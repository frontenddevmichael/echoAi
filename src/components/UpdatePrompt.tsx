import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAContext } from '@/context/PWAContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useState } from 'react';

export function UpdatePrompt() {
  const { updateAvailable, updateServiceWorker } = usePWAContext();
  const { triggerMedium, triggerLight } = useHaptics();
  const [dismissed, setDismissed] = useState(false);

  const handleUpdate = () => {
    triggerMedium();
    updateServiceWorker();
  };

  const handleDismiss = () => {
    triggerLight();
    setDismissed(true);
  };

  const show = updateAvailable && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-4 right-4 z-[100] safe-area-top"
        >
          <div className="max-w-md mx-auto">
            <div className="bg-card border border-border rounded-xl shadow-lg p-3 flex items-center gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  Update available
                </p>
                <p className="text-xs text-muted-foreground">
                  New features and improvements
                </p>
              </div>

              {/* Actions */}
              <Button
                size="sm"
                onClick={handleUpdate}
                className="touch-manipulation"
              >
                Update
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 w-8 text-muted-foreground touch-manipulation"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
