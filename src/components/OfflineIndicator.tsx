import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium safe-area-top"
        >
          <WifiOff className="w-4 h-4" />
          <span>You're offline. Some features may be limited.</span>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-green-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium safe-area-top"
        >
          <Wifi className="w-4 h-4" />
          <span>Back online!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
