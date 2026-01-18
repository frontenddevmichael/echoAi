import { Header } from '@/components/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HapticsShowcase } from '@/components/landing/HapticsShowcase';
import { PWASection } from '@/components/landing/PWASection';
import { Footer } from '@/components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background" style={{overflowX:'hidden',}}>
      <Header />
      <main>
        <HeroSection />
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="haptics">
          <HapticsShowcase />
        </div>
        <div id="pwa">
          <PWASection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
