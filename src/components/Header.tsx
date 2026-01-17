import { motion } from 'framer-motion';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
interface HeaderProps {
  showAppLink?: boolean;
}
export function Header({
  showAppLink = true
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    isDark,
    toggle
  } = useTheme();
  const {
    triggerLight
  } = useHaptics();
  const handleThemeToggle = () => {
    triggerLight();
    toggle();
  };
  return <header className="fixed top-0 left-0 right-0 z-50 safe-area-inset">
      <motion.div initial={{
      y: -100
    }} animate={{
      y: 0
    }} transition={{
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }} className="mx-4 mt-4">
        <div className="echo-glass rounded-2xl px-4 py-3 border-2 border-dashed border-secondary-foreground">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.a href="/" className="flex items-center gap-3" whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }}>
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-lg">e</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">echo</span>
            </motion.a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#haptics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Haptics
              </a>
              <a href="#pwa" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Install
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={handleThemeToggle} className="text-muted-foreground">
                <motion.div initial={false} animate={{
                rotate: isDark ? 0 : 180
              }} transition={{
                duration: 0.3
              }}>
                  {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </motion.div>
              </Button>

              {showAppLink && <Button variant="default" size="sm" onClick={() => {
              triggerLight();
              window.location.href = '/app';
            }} className="hidden sm:flex">
                  Open App
                </Button>}

              {/* Mobile menu button */}
              <Button variant="ghost" size="icon-sm" onClick={() => {
              triggerLight();
              setMobileMenuOpen(!mobileMenuOpen);
            }} className="md:hidden">
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div initial={{
        height: 0,
        opacity: 0
      }} animate={{
        height: mobileMenuOpen ? 'auto' : 0,
        opacity: mobileMenuOpen ? 1 : 0
      }} transition={{
        duration: 0.2
      }} className={cn('overflow-hidden md:hidden', mobileMenuOpen && 'mt-2')}>
          <div className="echo-glass rounded-2xl p-4 space-y-3">
            <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              Features
            </a>
            <a href="#haptics" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              Haptics
            </a>
            <a href="#pwa" className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              Install
            </a>
            {showAppLink && <Button variant="default" size="sm" className="w-full mt-2" onClick={() => {
            triggerLight();
            window.location.href = '/app';
          }}>
                Open App
              </Button>}
          </div>
        </motion.div>
      </motion.div>
    </header>;
}