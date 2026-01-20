import { motion, AnimatePresence } from 'framer-motion';
import { Share, Plus, X, ArrowDown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAContext } from '@/context/PWAContext';
import { useHaptics } from '@/hooks/useHaptics';

const steps = [
  {
    icon: Share,
    title: 'Tap the Share button',
    description: 'Find it at the bottom of Safari (the square with arrow)',
    highlight: true,
  },
  {
    icon: ArrowDown,
    title: 'Scroll down in the menu',
    description: 'Look for "Add to Home Screen"',
    highlight: false,
  },
  {
    icon: Plus,
    title: 'Tap "Add to Home Screen"',
    description: 'Then tap "Add" in the top right',
    highlight: false,
  },
  {
    icon: CheckCircle2,
    title: 'Open from Home Screen',
    description: 'Launch Echo like any other app!',
    highlight: false,
  },
];

export function IOSInstallGuide() {
  const { showIOSGuide, closeIOSGuide } = usePWAContext();
  const { triggerLight, triggerMedium } = useHaptics();

  const handleClose = () => {
    triggerLight();
    closeIOSGuide();
  };

  return (
    <AnimatePresence>
      {showIOSGuide && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[61] safe-area-bottom"
          >
            <div className="bg-background rounded-t-3xl max-h-[90vh] overflow-y-auto">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="px-6 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Install Echo</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Add to your home screen in 4 easy steps
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleClose}
                  className="h-9 w-9 text-muted-foreground touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Steps */}
              <div className="px-6 pb-8 space-y-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      {/* Step number */}
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                        ${step.highlight 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                        }
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Step content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Step {index + 1}
                          </span>
                        </div>
                        <h3 className="font-medium text-foreground mt-0.5">
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Safari share button indicator */}
              <div className="px-6 pb-8">
                <div className="bg-muted/50 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Share className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        Look for this icon
                      </p>
                      <p className="text-xs text-muted-foreground">
                        It's at the bottom center of Safari
                      </p>
                    </div>
                    <motion.div
                      animate={{ y: [0, 4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowDown className="w-5 h-5 text-primary" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="px-6 pb-6">
                <Button
                  onClick={handleClose}
                  className="w-full h-12 text-base touch-manipulation"
                >
                  Got it
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
