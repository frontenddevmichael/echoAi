import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

interface PWAContextValue {
  // Status
  isInstalled: boolean;
  isInstallable: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  platform: Platform;
  canInstall: boolean;
  
  // Install prompt
  promptInstall: () => Promise<boolean>;
  showInstallBanner: boolean;
  dismissInstallBanner: () => void;
  
  // iOS guide
  showIOSGuide: boolean;
  openIOSGuide: () => void;
  closeIOSGuide: () => void;
  
  // Update
  updateAvailable: boolean;
  updateServiceWorker: () => void;
  
  // Engagement tracking
  trackInteraction: () => void;
}

const PWAContext = createContext<PWAContextValue | null>(null);

const BANNER_DISMISS_KEY = 'pwa-banner-dismissed';
const BANNER_DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const ENGAGEMENT_THRESHOLD_TIME = 30000; // 30 seconds
const ENGAGEMENT_THRESHOLD_INTERACTIONS = 3;

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  // Engagement tracking
  const [timeOnSite, setTimeOnSite] = useState(0);
  const [interactions, setInteractions] = useState(0);

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/mac|win|linux/.test(userAgent)) {
      setPlatform('desktop');
    } else {
      setPlatform('unknown');
    }

    // Check if running as standalone PWA
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);
    setIsInstalled(isStandaloneMode);
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Track time on site
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnSite(prev => prev + 1000);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Service Worker update detection
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          setRegistration(reg);
          
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        }
      });

      // Listen for controller change (update activated)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  // Check if banner was dismissed
  useEffect(() => {
    const dismissedAt = localStorage.getItem(BANNER_DISMISS_KEY);
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissedTime < BANNER_DISMISS_DURATION) {
        return; // Still within dismiss period
      }
      localStorage.removeItem(BANNER_DISMISS_KEY);
    }

    // Show banner based on engagement
    const shouldShow = 
      !isInstalled && 
      !isStandalone &&
      (!!deferredPrompt || platform === 'ios') &&
      (timeOnSite > ENGAGEMENT_THRESHOLD_TIME || interactions >= ENGAGEMENT_THRESHOLD_INTERACTIONS);

    if (shouldShow) {
      setShowInstallBanner(true);
    }
  }, [isInstalled, isStandalone, deferredPrompt, platform, timeOnSite, interactions]);

  // Prompt to install
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      if (platform === 'ios') {
        setShowIOSGuide(true);
        return false;
      }
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setShowInstallBanner(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }, [deferredPrompt, platform]);

  // Dismiss banner
  const dismissInstallBanner = useCallback(() => {
    setShowInstallBanner(false);
    localStorage.setItem(BANNER_DISMISS_KEY, Date.now().toString());
  }, []);

  // iOS guide controls
  const openIOSGuide = useCallback(() => setShowIOSGuide(true), []);
  const closeIOSGuide = useCallback(() => setShowIOSGuide(false), []);

  // Update service worker
  const updateServiceWorker = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  // Track interaction
  const trackInteraction = useCallback(() => {
    setInteractions(prev => prev + 1);
  }, []);

  const value: PWAContextValue = {
    isInstalled,
    isInstallable: !!deferredPrompt,
    isOnline,
    isStandalone,
    platform,
    canInstall: !!deferredPrompt || platform === 'ios',
    promptInstall,
    showInstallBanner,
    dismissInstallBanner,
    showIOSGuide,
    openIOSGuide,
    closeIOSGuide,
    updateAvailable,
    updateServiceWorker,
    trackInteraction,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
}

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
}
