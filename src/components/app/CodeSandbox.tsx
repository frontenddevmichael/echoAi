import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface CodeSandboxProps {
  code: string;
  language: string;
  filename: string | null;
  onCodeChange: (code: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

export function CodeSandbox({ 
  code, 
  language, 
  filename, 
  onCodeChange,
  onClose,
  isVisible 
}: CodeSandboxProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(code);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isDark } = useTheme();
  const { triggerLight, triggerSuccess } = useHaptics();

  useEffect(() => {
    setEditableCode(code);
  }, [code]);

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
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerLight();
  }, [code, filename, language, triggerLight]);

  const handleSaveEdit = useCallback(() => {
    onCodeChange(editableCode);
    setIsEditing(false);
    triggerSuccess();
  }, [editableCode, onCodeChange, triggerSuccess]);

  const customStyle = {
    ...((isDark ? oneDark : oneLight) as Record<string, React.CSSProperties>),
    'pre[class*="language-"]': {
      ...(isDark ? oneDark : oneLight)['pre[class*="language-"]'],
      background: 'transparent',
      margin: 0,
      padding: '1rem',
      fontSize: '0.8125rem',
      lineHeight: '1.6',
    },
    'code[class*="language-"]': {
      ...(isDark ? oneDark : oneLight)['code[class*="language-"]'],
      background: 'transparent',
      fontSize: '0.8125rem',
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="h-full flex flex-col bg-background border-l border-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {language}
              </span>
              {filename && (
                <>
                  <span className="text-muted-foreground/30">·</span>
                  <span className="text-xs text-muted-foreground">{filename}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-7 w-7 text-muted-foreground md:hidden"
              >
                {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-7 w-7 text-muted-foreground"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="h-7 w-7 text-muted-foreground"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Code content */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="flex-1 overflow-auto"
              >
                {isEditing ? (
                  <div className="h-full p-4">
                    <textarea
                      ref={textareaRef}
                      value={editableCode}
                      onChange={(e) => setEditableCode(e.target.value)}
                      className={cn(
                        'w-full h-full resize-none bg-transparent border-0',
                        'font-mono text-sm leading-relaxed',
                        'focus:ring-0 focus:outline-none'
                      )}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditableCode(code);
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="cursor-text"
                    onClick={() => setIsEditing(true)}
                  >
                    <SyntaxHighlighter
                      language={language}
                      style={customStyle}
                      showLineNumbers
                      lineNumberStyle={{
                        minWidth: '2.5em',
                        paddingRight: '1em',
                        color: isDark ? 'hsl(0 0% 40%)' : 'hsl(0 0% 60%)',
                        userSelect: 'none',
                      }}
                    >
                      {code}
                    </SyntaxHighlighter>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
