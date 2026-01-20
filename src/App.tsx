import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import { PWAProvider } from "@/context/PWAContext";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { InstallBanner } from "@/components/InstallBanner";
import { IOSInstallGuide } from "@/components/IOSInstallGuide";
import { UpdatePrompt } from "@/components/UpdatePrompt";
import LandingPage from "./pages/LandingPage";
import AppPage from "./pages/AppPage";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PWAProvider>
        <AppProvider>
          {/* PWA Components */}
          <OfflineIndicator />
          <InstallBanner />
          <IOSInstallGuide />
          <UpdatePrompt />
          
          {/* App */}
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/app" element={<AppPage />} />
              <Route path="/install" element={<InstallPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </PWAProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
