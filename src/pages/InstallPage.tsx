import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Download, 
  Share, 
  Plus, 
  Smartphone, 
  Monitor,
  Apple,
  Chrome
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";

type Platform = "ios" | "android" | "desktop" | "unknown";

const InstallPage = () => {
  const { trigger } = useHaptics();
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    trigger({ pattern: "medium" });
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const iosSteps = [
    { icon: Share, text: "Tap the Share button in Safari" },
    { icon: Plus, text: "Scroll down and tap 'Add to Home Screen'" },
    { icon: Smartphone, text: "Tap 'Add' to install Echo" },
  ];

  const androidSteps = [
    { icon: Chrome, text: "Open menu (three dots) in Chrome" },
    { icon: Download, text: "Tap 'Install app' or 'Add to Home screen'" },
    { icon: Smartphone, text: "Confirm to install Echo" },
  ];

  const desktopSteps = [
    { icon: Chrome, text: "Click the install icon in the address bar" },
    { icon: Download, text: "Or use browser menu → 'Install Echo'" },
    { icon: Monitor, text: "Echo will open as a standalone app" },
  ];

  const steps = platform === "ios" ? iosSteps : platform === "android" ? androidSteps : desktopSteps;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground safe-area-all">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-4 px-4 xs:px-3 py-4 xs:py-3 border-b border-border bg-background/95 backdrop-blur-sm safe-area-top">
        <Link to="/">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => trigger({ pattern: "light" })}
            className="p-2 min-w-touch-sm min-h-touch-sm rounded-xl hover:bg-muted transition-colors flex items-center justify-center touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 xs:w-4 xs:h-4 text-foreground" />
          </motion.button>
        </Link>
        <h1 className="text-fluid-lg font-semibold">Install Echo</h1>
      </header>

      <main className="px-4 xs:px-3 py-8 xs:py-6 max-w-2xl mx-auto">
        {/* Platform indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 xs:mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 xs:px-3 xs:py-1.5 rounded-full bg-muted mb-4 xs:mb-3">
            {platform === "ios" && <Apple className="w-4 h-4 xs:w-3.5 xs:h-3.5" />}
            {platform === "android" && <Smartphone className="w-4 h-4 xs:w-3.5 xs:h-3.5" />}
            {platform === "desktop" && <Monitor className="w-4 h-4 xs:w-3.5 xs:h-3.5" />}
            <span className="text-fluid-xs font-medium capitalize">
              {platform === "ios" ? "iOS" : platform} detected
            </span>
          </div>

          <h2 className="text-fluid-2xl font-bold mb-2 xs:mb-1.5">
            Add Echo to your {platform === "desktop" ? "computer" : "home screen"}
          </h2>
          <p className="text-fluid-sm text-muted-foreground">
            Get instant access without opening a browser
          </p>
        </motion.div>

        {/* Direct install button (Android/Desktop) */}
        {isInstallable && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 xs:mb-6"
          >
            <Button
              size="lg"
              onClick={handleInstall}
              className="w-full min-h-touch text-fluid-sm rounded-xl font-medium touch-manipulation"
            >
              <Download className="w-5 h-5 mr-2" />
              Install Now
            </Button>
          </motion.div>
        )}

        {/* Installation steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 xs:space-y-3"
        >
          <h3 className="text-fluid-base font-semibold mb-4 xs:mb-3">
            {isInstallable ? "Or follow these steps:" : "Follow these steps:"}
          </h3>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center gap-4 xs:gap-3 p-4 xs:p-3 rounded-xl bg-muted/50 border border-border"
            >
              <div className="w-12 h-12 xs:w-10 xs:h-10 rounded-xl bg-background flex items-center justify-center flex-shrink-0">
                <step.icon className="w-6 h-6 xs:w-5 xs:h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 xs:gap-1.5 mb-1">
                  <span className="text-fluid-xs font-medium text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <p className="text-fluid-sm text-foreground">{step.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 xs:mt-8 p-6 xs:p-4 rounded-2xl bg-muted/30 border border-border"
        >
          <h3 className="text-fluid-base font-semibold mb-4 xs:mb-3">Why install?</h3>
          <ul className="space-y-3 xs:space-y-2 text-fluid-sm text-muted-foreground">
            <li className="flex items-start gap-3 xs:gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 flex-shrink-0" />
              <span>Launch instantly from your home screen</span>
            </li>
            <li className="flex items-start gap-3 xs:gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 flex-shrink-0" />
              <span>Works offline with cached sessions</span>
            </li>
            <li className="flex items-start gap-3 xs:gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 flex-shrink-0" />
              <span>Full-screen experience without browser UI</span>
            </li>
            <li className="flex items-start gap-3 xs:gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground mt-2 flex-shrink-0" />
              <span>Automatic updates when connected</span>
            </li>
          </ul>
        </motion.div>

        {/* Continue to app */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 xs:mt-6 text-center"
        >
          <Link to="/app">
            <Button
              variant="outline"
              size="lg"
              onClick={() => trigger({ pattern: "light" })}
              className="min-h-touch text-fluid-sm px-8 xs:px-6 rounded-xl touch-manipulation"
            >
              Continue in browser
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default InstallPage;
