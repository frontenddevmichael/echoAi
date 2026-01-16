import { motion } from 'framer-motion';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-lg">e</span>
            </div>
            <span className="font-semibold text-lg">echo</span>
          </motion.div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="animated-underline hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="#" className="animated-underline hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="animated-underline hover:text-foreground transition-colors">
              Terms
            </a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <motion.a
              href="#"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-5 h-5 text-muted-foreground" />
            </motion.a>
            <motion.a
              href="#"
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Twitter className="w-5 h-5 text-muted-foreground" />
            </motion.a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Echo. Built with care for developers everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
