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
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHaptics } from "@/hooks/useHaptics";
import { usePWA } from "@/hooks/usePWA";

const InstallPage = () => {
  const { trigger } = useHaptics();
  const { platform, isInstallable, isInstalled, promptInstall } = usePWA();
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    trigger({ pattern: "medium" });
    await promptInstall();
    setInstalling(false);
  };

  const iosSteps = [
    { icon: Share, text: "Tap the Share button in Safari" },
    { icon: Plus, text: "Scroll and tap 'Add to Home Screen'" },
    { icon: Smartphone, text: "Tap 'Add' to install Echo" },
  ];

  const androidSteps = [
    { icon: Download, text: "Tap 'Install' button above" },
    { icon: Smartphone, text: "Or tap menu (⋮) → 'Install app'" },
    { icon: Check, text: "Confirm to add Echo to home screen" },
  ];

  const desktopSteps = [
    { icon: Download, text: "Click 'Install' button above" },
    { icon: Monitor, text: "Or click install icon in address bar" },
    { icon: Check, text: "Echo opens as standalone app" },
  ];

  const steps = platform === "ios" ? iosSteps : platform === "android" ? androidSteps : desktopSteps;

  if (isInstalled) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center p-4 safe-area-all">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-echo-success/20 flex items-center justify-center">
            <Check className="w-8 h-8 text-echo-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Already Installed!</h1>
          <p className="text-muted-foreground mb-6">Echo is ready on your device</p>
          <Link to="/app">
            <Button size="lg" className="min-h-touch">Open App</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground safe-area-all">
      <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm safe-area-top">
        <Link to="/">
          <button
            onClick={() => trigger({ pattern: "light" })}
            className="p-2 min-h-touch-sm min-w-touch-sm rounded-xl hover:bg-muted transition-colors flex items-center justify-center touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        <h1 className="text-lg font-semibold">Install Echo</h1>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted mb-3">
            <Smartphone className="w-4 h-4" />
            <span className="text-xs font-medium capitalize">
              {platform === "ios" ? "iOS" : platform} detected
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Add to Home Screen</h2>
          <p className="text-sm text-muted-foreground">Get instant access like a native app</p>
        </motion.div>

        {isInstallable && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
            <Button
              size="lg"
              onClick={handleInstall}
              disabled={installing}
              className="w-full min-h-touch text-base rounded-xl font-medium touch-manipulation"
            >
              <Download className="w-5 h-5 mr-2" />
              {installing ? "Installing..." : "Install Now"}
            </Button>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
          <h3 className="text-sm font-semibold mb-3">
            {isInstallable ? "Or follow these steps:" : "Follow these steps:"}
          </h3>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                <step.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                <p className="text-sm">{step.text}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 text-center">
          <Link to="/app">
            <Button variant="outline" size="lg" className="min-h-touch px-6 rounded-xl touch-manipulation">
              Continue in browser
            </Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
};

export default InstallPage;
