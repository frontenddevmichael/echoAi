import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/useHaptics';
import { ArrowRight, Code2, MessageSquare, Sparkles, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
const fadeUpVariants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const
    }
  })
};
export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    triggerMedium
  } = useHaptics();
  const {
    scrollYProgress
  } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 50]);
  return <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-20">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Glow orb */}
      <motion.div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20" style={{
      background: 'radial-gradient(circle, hsl(var(--foreground) / 0.3) 0%, transparent 70%)'
    }} animate={{
      scale: [1, 1.1, 1],
      opacity: [0.15, 0.25, 0.15]
    }} transition={{
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut'
    }} />

      <motion.div style={{
      opacity,
      scale,
      y
    }} className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        

        {/* Headline */}
        <motion.h1 custom={1} variants={fadeUpVariants} initial="hidden" animate="visible" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.1] mb-6">
          Write code, fix bugs,{' '}
          <span className="relative">
            <span className="relative z-10">understand</span>
            <motion.span className="absolute bottom-2 left-0 right-0 h-3 bg-primary/20 -z-10 rounded" initial={{
            scaleX: 0
          }} animate={{
            scaleX: 1
          }} transition={{
            delay: 0.8,
            duration: 0.5,
            ease: 'easeOut'
          }} style={{
            originX: 0
          }} />
          </span>{' '}
          your projects
        </motion.h1>

        {/* Subtext */}
        <motion.p custom={2} variants={fadeUpVariants} initial="hidden" animate="visible" className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
          It's like having a senior developer who never sleeps, built to feel alive in your hands.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="hero" size="lg" onClick={() => {
          triggerMedium();
          window.location.href = '/app';
        }} className="group">
            Start building
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" onClick={triggerMedium}>
            See how it works
          </Button>
        </motion.div>

        {/* Feature pills */}
        <motion.div custom={4} variants={fadeUpVariants} initial="hidden" animate="visible" className="flex flex-wrap items-center justify-center gap-3 mt-12">
          {[{
          icon: MessageSquare,
          label: 'Chat'
        }, {
          icon: Code2,
          label: 'Generate'
        }, {
          icon: Wrench,
          label: 'Debug'
        }, {
          icon: Sparkles,
          label: 'Explain'
        }].map(({
          icon: Icon,
          label
        }) => <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border text-sm text-muted-foreground">
              <Icon className="w-3.5 h-3.5" />
              {label}
            </div>)}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.5
    }}>
        <motion.div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2" animate={{
        y: [0, 5, 0]
      }} transition={{
        duration: 2,
        repeat: Infinity
      }}>
          <motion.div className="w-1 h-2 rounded-full bg-muted-foreground/50" animate={{
          opacity: [1, 0.3, 1]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
        </motion.div>
      </motion.div>
    </section>;
}