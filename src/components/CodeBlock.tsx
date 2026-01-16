import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
  expandable?: boolean;
}

export function CodeBlock({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
  className,
  expandable = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { isDark } = useTheme();
  const { triggerLight, triggerSuccess } = useHaptics();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      triggerSuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code, triggerSuccess]);

  const handleDownload = useCallback(() => {
    triggerLight();
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, filename, language, triggerLight]);

  const toggleExpand = useCallback(() => {
    triggerLight();
    setExpanded(!expanded);
  }, [expanded, triggerLight]);

  const customStyle = {
    ...(isDark ? oneDark : oneLight),
    'pre[class*="language-"]': {
      ...((isDark ? oneDark : oneLight)['pre[class*="language-"]'] || {}),
      background: 'transparent',
      margin: 0,
      padding: '1rem',
      fontSize: '0.875rem',
      lineHeight: '1.6',
    },
    'code[class*="language-"]': {
      ...((isDark ? oneDark : oneLight)['code[class*="language-"]'] || {}),
      background: 'transparent',
      fontFamily: 'JetBrains Mono, SF Mono, Monaco, Consolas, monospace',
    },
  };

  return (
    <motion.div
      layout
      className={cn(
        'echo-code-block group relative overflow-hidden',
        expanded && 'fixed inset-4 z-50',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-echo-warning/60" />
            <div className="w-3 h-3 rounded-full bg-echo-success/60" />
          </div>
          {filename && (
            <span className="text-xs text-muted-foreground font-mono ml-2">
              {filename}
            </span>
          )}
          {language && !filename && (
            <span className="text-xs text-muted-foreground font-mono ml-2 uppercase">
              {language}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {expandable && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleExpand}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDownload}
            className="text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="h-3.5 w-3.5 text-echo-success" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      {/* Code */}
      <div className={cn('overflow-auto', expanded ? 'max-h-[calc(100vh-8rem)]' : 'max-h-96')}>
        <SyntaxHighlighter
          language={language}
          style={customStyle}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: isDark ? '#4a5568' : '#a0aec0',
            userSelect: 'none',
          }}
          wrapLines
          lineProps={() => ({
            style: {
              display: 'block',
            },
          })}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>

      {/* Expanded backdrop */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleExpand}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
