import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Download, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
export function PWASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px'
  });
  const {
    triggerMedium
  } = useHaptics();
  return <section className="py-24 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left visual */}
          <motion.div initial={{
          opacity: 0,
          x: -30
        }} animate={isInView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.6
        }} className="relative flex items-center justify-center order-2 md:order-1">
            <div className="relative">
              {/* Multiple device mockups */}
              <div className="flex items-end gap-4">
                {/* Tablet */}
                <motion.div className="w-48 h-64 rounded-2xl bg-card border-4 border-foreground/10 shadow-echo-lg overflow-hidden" animate={{
                y: [0, -5, 0]
              }} transition={{
                duration: 4,
                repeat: Infinity,
                delay: 0.5
              }}>
                  <div className="p-3 space-y-2">
                    <div className="h-3 w-16 bg-muted rounded" />
                    <div className="h-2 w-full bg-muted/50 rounded" />
                    <div className="h-2 w-3/4 bg-muted/50 rounded" />
                    <div className="mt-4 h-20 w-full bg-echo-code-bg rounded-lg p-2">
                      <div className="h-2 w-full bg-muted/30 rounded mb-1" />
                      <div className="h-2 w-3/4 bg-muted/30 rounded mb-1" />
                      <div className="h-2 w-1/2 bg-muted/30 rounded" />
                    </div>
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div className="w-32 h-56 rounded-[2rem] bg-card border-4 border-foreground/10 shadow-echo-lg overflow-hidden" animate={{
                y: [0, -8, 0]
              }} transition={{
                duration: 4,
                repeat: Infinity
              }}>
                  <div className="p-2 space-y-2">
                    <div className="h-2 w-12 bg-muted rounded mx-auto" />
                    <div className="h-1.5 w-full bg-muted/50 rounded" />
                    <div className="h-1.5 w-3/4 bg-muted/50 rounded" />
                    <div className="mt-3 h-16 w-full bg-echo-code-bg rounded-lg p-1.5">
                      <div className="h-1.5 w-full bg-muted/30 rounded mb-1" />
                      <div className="h-1.5 w-3/4 bg-muted/30 rounded mb-1" />
                      <div className="h-1.5 w-1/2 bg-muted/30 rounded" />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Connection indicator */}
              <motion.div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-card rounded-full shadow-echo border border-border" animate={{
              scale: [1, 1.05, 1]
            }} transition={{
              duration: 2,
              repeat: Infinity
            }}>
                <div className="flex gap-1">
                  <Wifi className="w-4 h-4 text-echo-success" />
                  <WifiOff className="w-4 h-4 text-muted-foreground/30" />
                </div>
                <span className="text-xs text-muted-foreground">Works offline</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right content */}
          <motion.div initial={{
          opacity: 0,
          x: 30
        }} animate={isInView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted/50 border border-border mb-6 rounded">
              <Download className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Progressive Web App</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Install once, use anywhere
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              Echo works seamlessly across all your devices. Install it like a native app, 
              use it offline, and pick up exactly where you left off.
            </p>

            <ul className="space-y-3 mb-8">
              {['Instant loading, even on slow connections', 'Offline-first: your session is always available', 'Syncs automatically when you are back online', 'No app store required - install from your browser'].map((item, i) => <motion.li key={i} initial={{
              opacity: 0,
              x: 20
            }} animate={isInView ? {
              opacity: 1,
              x: 0
            } : {}} transition={{
              delay: 0.4 + i * 0.1
            }} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                  {item}
                </motion.li>)}
            </ul>

            <Button variant="hero" onClick={() => {
            triggerMedium();
            window.location.href = '/install';
          }}>
              <Smartphone className="w-4 h-4 mr-2" />
              Try Echo Now
            </Button>
          </motion.div>
        </div>
      </div>
    </section>;
}
