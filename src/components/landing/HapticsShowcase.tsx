import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Smartphone, Vibrate, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
const hapticPatterns = [{
  name: 'Light',
  pattern: 'light' as const,
  description: 'Subtle confirmation'
}, {
  name: 'Medium',
  pattern: 'medium' as const,
  description: 'Standard interaction'
}, {
  name: 'Success',
  pattern: 'success' as const,
  description: 'Task completed'
}, {
  name: 'Error',
  pattern: 'error' as const,
  description: 'Something went wrong'
}, {
  name: 'Warning',
  pattern: 'warning' as const,
  description: 'Attention needed'
}, {
  name: 'Selection',
  pattern: 'selection' as const,
  description: 'Quick tap feedback'
}];
export function HapticsShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px'
  });
  const [activePattern, setActivePattern] = useState<string | null>(null);
  const {
    trigger,
    isSupported
  } = useHaptics();
  const handlePatternClick = (pattern: typeof hapticPatterns[0]) => {
    setActivePattern(pattern.name);
    trigger({
      pattern: pattern.pattern
    });
    setTimeout(() => setActivePattern(null), 300);
  };
  return <section className="py-24 px-6 bg-muted/30" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div initial={{
          opacity: 0,
          x: -30
        }} animate={isInView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.6
        }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-background border border-border mb-6 rounded">
              <Vibrate className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Haptic Feedback</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Feel every interaction
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Echo uses contextual haptics to make your device feel alive. Every button press, 
              every AI response, every code generation—you'll feel the difference.
            </p>

            <div className="flex flex-wrap gap-3">
              {hapticPatterns.map(pattern => <Button key={pattern.name} variant="outline" size="sm" onClick={() => handlePatternClick(pattern)} className={cn('transition-all duration-200', activePattern === pattern.name && 'scale-95 bg-accent')}>
                  {pattern.name}
                </Button>)}
            </div>

            {!isSupported && <p className="text-sm text-muted-foreground mt-4">
                ⓘ Haptic feedback works best on mobile devices with vibration support.
              </p>}
          </motion.div>

          {/* Right visual */}
          <motion.div initial={{
          opacity: 0,
          x: 30
        }} animate={isInView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="relative flex items-center justify-center">
            <div className="relative">
              {/* Phone mockup */}
              <div className="w-64 h-[500px] rounded-[3rem] bg-card border-8 border-foreground/10 shadow-echo-xl overflow-hidden">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground/10 rounded-full" />
                
                <div className="pt-14 px-4 space-y-4">
                  {/* Simulated chat */}
                  <div className="bg-muted rounded-2xl p-3">
                    <p className="text-xs text-muted-foreground">How do I sort an array?</p>
                  </div>
                  
                  <div className="bg-foreground/5 rounded-2xl p-3 ml-4">
                    <p className="text-xs font-mono text-foreground">array.sort((a, b) =&gt; a - b)</p>
                  </div>
                  
                  {/* Haptic wave animation */}
                  <motion.div className="flex justify-center py-8" animate={activePattern ? {
                  scale: [1, 1.1, 1]
                } : {}} transition={{
                  duration: 0.3
                }}>
                    <div className="relative">
                      <Hand className="w-12 h-12 text-muted-foreground" />
                      {activePattern && <>
                          <motion.div className="absolute inset-0 rounded-full border-2 border-foreground/20" initial={{
                        scale: 1,
                        opacity: 1
                      }} animate={{
                        scale: 2.5,
                        opacity: 0
                      }} transition={{
                        duration: 0.6
                      }} />
                          <motion.div className="absolute inset-0 rounded-full border-2 border-foreground/20" initial={{
                        scale: 1,
                        opacity: 1
                      }} animate={{
                        scale: 2.5,
                        opacity: 0
                      }} transition={{
                        duration: 0.6,
                        delay: 0.1
                      }} />
                        </>}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div className="absolute -top-4 -right-4 p-3 bg-card rounded-xl shadow-echo border border-border" animate={{
              y: [0, -8, 0]
            }} transition={{
              duration: 3,
              repeat: Infinity
            }}>
                <Vibrate className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              
              <motion.div className="absolute -bottom-4 -left-4 p-3 bg-card rounded-xl shadow-echo border border-border" animate={{
              y: [0, 8, 0]
            }} transition={{
              duration: 3,
              repeat: Infinity,
              delay: 1.5
            }}>
                <Smartphone className="w-5 h-5 text-muted-foreground" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
}