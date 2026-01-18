import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Download, X, Check, ChevronDown, ChevronUp,
  Play, WrapText, Monitor, Code2, RefreshCw
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';

interface CodeFile {
  id: string;
  filename: string;
  language: string;
  code: string;
  isGenerating?: boolean;
}

interface CodeSandboxProps {
  files: CodeFile[];
  onCodeChange?: (fileId: string, code: string) => void;
  onClose: () => void;
  isVisible: boolean;
  activeFileId?: string;
  onFileChange?: (fileId: string) => void;
  enablePreview?: boolean; // NEW: Enable live preview
}

type ViewMode = 'code' | 'preview' | 'split';

export function CodeSandbox({
  files,
  onCodeChange,
  onClose,
  isVisible,
  activeFileId,
  onFileChange,
  enablePreview = true
}: CodeSandboxProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [displayedCode, setDisplayedCode] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('code'); // NEW: View mode
  const [previewKey, setPreviewKey] = useState(0); // NEW: Force iframe refresh

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { isDark } = useTheme();
  const { triggerLight, triggerSuccess } = useHaptics();

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  // Check if files contain web technologies
  const hasWebFiles = useMemo(() => {
    const languages = files.map(f => f.language.toLowerCase());
    return languages.some(lang => ['html', 'css', 'javascript', 'js'].includes(lang));
  }, [files]);

  // Generate preview HTML
  const previewHTML = useMemo(() => {
    const htmlFile = files.find(f => f.language.toLowerCase() === 'html');
    const cssFile = files.find(f => f.language.toLowerCase() === 'css');
    const jsFile = files.find(f =>
      f.language.toLowerCase() === 'javascript' || f.language.toLowerCase() === 'js'
    );

    let html = htmlFile?.code || '<body></body>';

    // Inject CSS
    if (cssFile && cssFile.code) {
      const styleTag = `<style>${cssFile.code}</style>`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${styleTag}</head>`);
      } else if (html.includes('<body>')) {
        html = html.replace('<body>', `<head>${styleTag}</head><body>`);
      } else {
        html = `<head>${styleTag}</head>${html}`;
      }
    }

    // Inject JavaScript
    if (jsFile && jsFile.code) {
      const scriptTag = `<script>${jsFile.code}<\/script>`;
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptTag}</body>`);
      } else {
        html += scriptTag;
      }
    }

    // Add viewport meta for responsiveness
    if (!html.includes('viewport')) {
      const metaTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${metaTag}</head>`);
      } else if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${metaTag}`);
      } else {
        html = `<head>${metaTag}</head>${html}`;
      }
    }

    return html;
  }, [files]);

  // Progressive code generation effect
  useEffect(() => {
    if (!activeFile || !activeFile.isGenerating) {
      setDisplayedCode(activeFile?.code || '');
      return;
    }

    let index = 0;
    setDisplayedCode('');

    const interval = setInterval(() => {
      if (index < activeFile.code.length) {
        setDisplayedCode(activeFile.code.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [activeFile?.code, activeFile?.isGenerating]);

  useEffect(() => {
    setEditableCode(activeFile?.code || '');
  }, [activeFile?.code]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditableCode(activeFile?.code || '');
        setIsEditing(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveEdit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, activeFile?.code]);

  const handleCopy = useCallback(async () => {
    if (!activeFile) return;
    try {
      await navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      triggerSuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [activeFile, triggerSuccess]);

  const handleDownload = useCallback(() => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerLight();
  }, [activeFile, triggerLight]);

  const handleDownloadAll = useCallback(() => {
    files.forEach(file => {
      const blob = new Blob([file.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    triggerLight();
  }, [files, triggerLight]);

  const handleSaveEdit = useCallback(() => {
    if (!activeFile || !onCodeChange) return;
    onCodeChange(activeFile.id, editableCode);
    setIsEditing(false);
    triggerSuccess();
  }, [activeFile, editableCode, onCodeChange, triggerSuccess]);

  const handleRefreshPreview = useCallback(() => {
    setPreviewKey(prev => prev + 1);
    triggerLight();
  }, [triggerLight]);

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

  if (!activeFile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="h-full max-h-[500px] flex flex-col bg-background border border-border rounded-lg overflow-hidden shadow-lg"
        >
          {/* File Tabs */}
          {files.length > 1 && (
            <div className="flex items-center gap-1 px-2 py-2 border-b border-border bg-muted/30 overflow-x-auto">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => onFileChange?.(file.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                    "hover:bg-muted/50",
                    activeFile.id === file.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground"
                  )}
                >
                  {file.filename}
                  {file.isGenerating && (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-1.5 inline-block w-1.5 h-1.5 bg-primary rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {activeFile.language}
              </span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-xs text-muted-foreground">{activeFile.filename}</span>
            </div>
            <div className="flex items-center gap-1">
              {/* View Mode Toggle */}
              {enablePreview && hasWebFiles && (
                <div className="flex items-center gap-0.5 mr-2 p-0.5 bg-muted/50 rounded-md">
                  <Button
                    variant={viewMode === 'code' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('code')}
                    className="h-6 w-6"
                    title="Code only"
                  >
                    <Code2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('split')}
                    className="h-6 w-6"
                    title="Split view"
                  >
                    <div className="flex gap-0.5">
                      <div className="w-1 h-3 bg-current" />
                      <div className="w-1 h-3 bg-current" />
                    </div>
                  </Button>
                  <Button
                    variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('preview')}
                    className="h-6 w-6"
                    title="Preview only"
                  >
                    <Monitor className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {viewMode !== 'code' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshPreview}
                  className="h-7 w-7 text-muted-foreground"
                  title="Refresh preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-7 w-7 text-muted-foreground"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setWrapLines(!wrapLines)}
                className="h-7 w-7 text-muted-foreground"
                title="Toggle line wrap"
              >
                <WrapText className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-7 w-7 text-muted-foreground"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="h-7 w-7 text-muted-foreground"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
              {files.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownloadAll}
                  className="h-7 px-2 text-xs text-muted-foreground"
                  title="Download all files"
                >
                  All
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-7 w-7 text-muted-foreground"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="flex-1 overflow-hidden"
              >
                <div className={cn(
                  "h-full flex",
                  viewMode === 'split' ? "divide-x divide-border" : ""
                )}>
                  {/* Code View */}
                  {(viewMode === 'code' || viewMode === 'split') && (
                    <div className={cn(
                      "overflow-auto",
                      viewMode === 'split' ? "w-1/2" : "w-full"
                    )}>
                      {isEditing ? (
                        <div className="h-full p-4 flex flex-col">
                          <textarea
                            ref={textareaRef}
                            value={editableCode}
                            onChange={(e) => setEditableCode(e.target.value)}
                            className={cn(
                              'flex-1 w-full resize-none bg-transparent border-0',
                              'font-mono text-sm leading-relaxed',
                              'focus:ring-0 focus:outline-none',
                              'text-foreground'
                            )}
                          />
                          <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditableCode(activeFile.code);
                                setIsEditing(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                            >
                              Save (⌘S)
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "cursor-text relative group h-full",
                            "hover:bg-muted/5 transition-colors"
                          )}
                          onClick={() => setIsEditing(true)}
                        >
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <span className="text-xs text-muted-foreground bg-background/90 px-2 py-1 rounded border border-border shadow-sm">
                              Click to edit
                            </span>
                          </div>

                          {activeFile.isGenerating && (
                            <motion.div
                              animate={{ opacity: [1, 0, 1] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="absolute bottom-4 left-4 w-2 h-4 bg-primary z-10"
                            />
                          )}

                          <SyntaxHighlighter
                            language={activeFile.language}
                            style={customStyle}
                            showLineNumbers
                            wrapLines={wrapLines}
                            wrapLongLines={wrapLines}
                            lineNumberStyle={{
                              minWidth: '2.5em',
                              paddingRight: '1em',
                              color: isDark ? 'hsl(0 0% 40%)' : 'hsl(0 0% 60%)',
                              userSelect: 'none',
                            }}
                          >
                            {displayedCode}
                          </SyntaxHighlighter>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview View */}
                  {(viewMode === 'preview' || viewMode === 'split') && hasWebFiles && (
                    <div className={cn(
                      "bg-white overflow-auto",
                      viewMode === 'split' ? "w-1/2" : "w-full"
                    )}>
                      <iframe
                        key={previewKey}
                        ref={iframeRef}
                        srcDoc={previewHTML}
                        title="Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                        className="w-full h-full border-0"
                        style={{ minHeight: '400px' }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generation status */}
          {activeFile.isGenerating && (
            <div className="px-4 py-2 border-t border-border bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full"
                />
                <span>Generating {activeFile.filename}...</span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}