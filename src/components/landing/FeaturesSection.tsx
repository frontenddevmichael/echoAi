import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Code2, MessageSquare, Sparkles, Wrench, Zap, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: MessageSquare,
    title: 'Natural Conversations',
    description: 'Chat like you would with a colleague. Ask questions, discuss approaches, and get thoughtful responses.',
    gradient: 'from-foreground/5 to-foreground/10',
  },
  {
    icon: Code2,
    title: 'Code Generation',
    description: 'Describe what you need in plain language. Get clean, production-ready code with best practices built in.',
    gradient: 'from-foreground/5 to-foreground/10',
  },
  {
    icon: Wrench,
    title: 'Smart Debugging',
    description: 'Paste your error, get the fix. Echo understands stack traces and suggests targeted solutions.',
    gradient: 'from-foreground/5 to-foreground/10',
  },
  {
    icon: BookOpen,
    title: 'Code Explanation',
    description: 'Highlight any snippet. Receive clear, contextual explanations—from high-level to line-by-line.',
    gradient: 'from-foreground/5 to-foreground/10',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 px-6" ref={ref}>
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted/50 border border-border mb-6">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to ship faster
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From quick questions to complex refactors, Echo adapts to how you work.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={cn(
                'group relative p-8 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-echo-lg hover:border-border/80'
              )}
            >
              {/* Background gradient */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                feature.gradient
              )} />
              
              <div className="relative z-10">
                <div className="inline-flex p-3 rounded-xl bg-muted/50 mb-5">
                  <feature.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>

              {/* Hover line */}
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-foreground/10"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
