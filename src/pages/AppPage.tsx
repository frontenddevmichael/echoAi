import { useCallback, useState } from 'react';
import { Code2, MessageSquare, ChevronDown, X } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AppHeader } from '@/components/app/AppHeader';
import { ChatArea } from '@/components/app/ChatArea';
import ChatInput from '@/components/app/ChatInput';
import { EmptyState } from '@/components/app/EmptyState';
import { CodeSandbox } from '@/components/app/CodeSandbox';
import { useHaptics } from '@/hooks/useHaptics';
import { sendMessage } from '@/lib/ai';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface CodeFile {
  id: string;
  filename: string;
  language: string;
  code: string;
  isGenerating?: boolean;
}

interface CodeSandboxInstance {
  id: string;
  name: string;
  files: CodeFile[];
  activeFileId: string;
  createdAt: Date;
  messageId?: string;
}

function AppContent() {
  const {
    messages,
    addMessage,
    input,
    setInput,
    isLoading,
    setIsLoading,
    showSandbox,
    setShowSandbox
  } = useApp();

  const { triggerConfirmation, triggerError, stop: stopHaptics } = useHaptics();
  const [mobileView, setMobileView] = useState<'chat' | 'code'>('chat');

  // Multiple sandboxes
  const [sandboxes, setSandboxes] = useState<CodeSandboxInstance[]>([]);
  const [activeSandboxId, setActiveSandboxId] = useState<string | null>(null);

  const activeSandbox = sandboxes.find(s => s.id === activeSandboxId);

  // NEW: Detect user intent (new sandbox vs update existing)
  const detectUserIntent = useCallback((userMessage: string): 'new' | 'update' => {
    const lower = userMessage.toLowerCase();

    // Keywords that indicate wanting a NEW/SEPARATE sandbox
    const newKeywords = [
      'create a new',
      'make another',
      'build a separate',
      'generate a different',
      'create separate',
      'make a new',
      'new project',
      'different project',
      'another project',
      'separately',
      'separate',
      'in a new sandbox',
      'create another',
      'make me a',
      'build me a',
      'generate a new',
      'new ',
      'another ',
      'different ',
      'also create',
      'also make',
      'also build',
    ];

    // Keywords that indicate UPDATING current sandbox
    const updateKeywords = [
      'update',
      'modify',
      'change',
      'edit',
      'fix',
      'improve',
      'add to',
      'update the',
      'change the',
      'modify the',
      'fix the',
      'improve the',
      'make it',
      'make the',
    ];

    // Check for update intent first (only if there's an active sandbox)
    if (activeSandbox && updateKeywords.some(keyword => lower.includes(keyword))) {
      return 'update';
    }

    // Check for explicit new/separate intent
    if (newKeywords.some(keyword => lower.includes(keyword))) {
      return 'new';
    }

    // Default behavior: always create new sandbox
    // This ensures each generation gets its own sandbox
    return 'new';
  }, [activeSandbox]);

  // Parse markdown code blocks from message content
  const parseMarkdownCodeBlocks = useCallback((content: string): CodeFile[] => {
    const files: CodeFile[] = [];
    const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1].toLowerCase();
      const code = match[2].trim();

      const fileMap: Record<string, { filename: string; id: string }> = {
        html: { filename: 'index.html', id: 'html' },
        css: { filename: 'style.css', id: 'css' },
        javascript: { filename: 'script.js', id: 'js' },
        js: { filename: 'script.js', id: 'js' },
        typescript: { filename: 'index.ts', id: 'ts' },
        ts: { filename: 'index.ts', id: 'ts' },
        jsx: { filename: 'App.jsx', id: 'jsx' },
        tsx: { filename: 'App.tsx', id: 'tsx' },
        python: { filename: 'main.py', id: 'py' },
        java: { filename: 'Main.java', id: 'java' },
        cpp: { filename: 'main.cpp', id: 'cpp' },
        c: { filename: 'main.c', id: 'c' },
      };

      const config = fileMap[language];
      if (config) {
        const existingFile = files.find(f => f.id === config.id);
        if (!existingFile) {
          files.push({
            id: config.id,
            filename: config.filename,
            language: language === 'js' ? 'javascript' : language,
            code: code,
            isGenerating: true,
          });
        }
      }
    }

    return files;
  }, []);

  // Parse structured code response from AI
  const parseCodeFromResponse = useCallback((response: any): CodeFile[] => {
    const files: CodeFile[] = [];

    if (response.html) {
      files.push({
        id: 'html',
        filename: 'index.html',
        language: 'html',
        code: response.html,
        isGenerating: true,
      });
    }

    if (response.css) {
      files.push({
        id: 'css',
        filename: 'style.css',
        language: 'css',
        code: response.css,
        isGenerating: true,
      });
    }

    if (response.javascript || response.js) {
      files.push({
        id: 'js',
        filename: 'script.js',
        language: 'javascript',
        code: response.javascript || response.js,
        isGenerating: true,
      });
    }

    if (files.length === 0 && response.code) {
      files.push({
        id: 'code',
        filename: response.filename || 'code.txt',
        language: response.language || 'typescript',
        code: response.code,
        isGenerating: true,
      });
    }

    return files;
  }, []);

  // Generate a name for the sandbox based on content
  const generateSandboxName = useCallback((files: CodeFile[], messageContent: string): string => {
    const lowerContent = messageContent.toLowerCase();

    if (lowerContent.includes('landing page')) return 'Landing Page';
    if (lowerContent.includes('dashboard')) return 'Dashboard';
    if (lowerContent.includes('portfolio')) return 'Portfolio';
    if (lowerContent.includes('login')) return 'Login Form';
    if (lowerContent.includes('navbar') || lowerContent.includes('navigation')) return 'Navigation Bar';
    if (lowerContent.includes('card')) return 'Card Component';
    if (lowerContent.includes('button')) return 'Button Component';
    if (lowerContent.includes('form')) return 'Form';
    if (lowerContent.includes('hero')) return 'Hero Section';
    if (lowerContent.includes('footer')) return 'Footer';
    if (lowerContent.includes('header')) return 'Header';
    if (lowerContent.includes('sidebar')) return 'Sidebar';
    if (lowerContent.includes('modal')) return 'Modal';
    if (lowerContent.includes('gallery')) return 'Gallery';

    // Fallback: use file types
    const hasHtml = files.some(f => f.language === 'html');
    const hasCss = files.some(f => f.language === 'css');
    const hasJs = files.some(f => f.language === 'javascript' || f.language === 'js');

    if (hasHtml && hasCss && hasJs) return 'Web Project';
    if (hasHtml && hasCss) return 'HTML + CSS';
    if (files.length === 1) return files[0].filename;

    return `Code #${sandboxes.length + 1}`;
  }, [sandboxes.length]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;

    const userMessageId = Date.now().toString();
    const userIntent = detectUserIntent(input); // NEW: Detect intent

    addMessage({
      role: 'user',
      content: input,
    });

    setInput('');
    setIsLoading(true);
    // No haptics during loading - only on completion

    try {
      const conversationHistory = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: input }
      ];

      const response = await sendMessage({
        messages: conversationHistory,
        currentCode: activeSandbox?.files.map(f => `// ${f.filename}\n${f.code}`).join('\n\n'),
      });

      // Single subtle confirmation haptic on completion
      triggerConfirmation();

      const assistantMessageId = (Date.now() + 1).toString();
      addMessage({
        role: 'assistant',
        content: response.chat,
        intent: response.intent,
      });

      const detectedCode = parseMarkdownCodeBlocks(response.chat);

      if (detectedCode.length > 0) {
        // NEW: Check if we should update or create new
        if (userIntent === 'update' && activeSandbox) {
          // UPDATE existing sandbox
          console.log('🔄 Updating existing sandbox:', activeSandbox.name);

          setSandboxes(prev => prev.map(sandbox =>
            sandbox.id === activeSandboxId
              ? {
                ...sandbox,
                files: detectedCode,
                activeFileId: detectedCode[0].id,
              }
              : sandbox
          ));

          setTimeout(() => {
            setSandboxes(prev => prev.map(sandbox =>
              sandbox.id === activeSandboxId
                ? {
                  ...sandbox,
                  files: sandbox.files.map(f => ({ ...f, isGenerating: false }))
                }
                : sandbox
            ));
          }, Math.max(...detectedCode.map(f => f.code.length)) * 10);

        } else {
          // CREATE new sandbox
          console.log('✨ Creating new sandbox');

          const newSandbox: CodeSandboxInstance = {
            id: Date.now().toString(),
            name: generateSandboxName(detectedCode, input),
            files: detectedCode,
            activeFileId: detectedCode[0].id,
            createdAt: new Date(),
            messageId: assistantMessageId,
          };

          setSandboxes(prev => [...prev, newSandbox]);
          setActiveSandboxId(newSandbox.id);
          setShowSandbox(true);

          setTimeout(() => {
            setSandboxes(prev => prev.map(sandbox =>
              sandbox.id === newSandbox.id
                ? {
                  ...sandbox,
                  files: sandbox.files.map(f => ({ ...f, isGenerating: false }))
                }
                : sandbox
            ));
          }, Math.max(...detectedCode.map(f => f.code.length)) * 10);

          if (window.innerWidth < 768) {
            setMobileView('code');
          }
        }
      } else if (response.code) {
        const files = parseCodeFromResponse(response);

        if (files.length > 0) {
          if (userIntent === 'update' && activeSandbox) {
            // UPDATE existing
            console.log('🔄 Updating existing sandbox:', activeSandbox.name);

            setSandboxes(prev => prev.map(sandbox =>
              sandbox.id === activeSandboxId
                ? {
                  ...sandbox,
                  files: files,
                  activeFileId: files[0].id,
                }
                : sandbox
            ));

            setTimeout(() => {
              setSandboxes(prev => prev.map(sandbox =>
                sandbox.id === activeSandboxId
                  ? {
                    ...sandbox,
                    files: sandbox.files.map(f => ({ ...f, isGenerating: false }))
                  }
                  : sandbox
              ));
            }, Math.max(...files.map(f => f.code.length)) * 10);

          } else {
            // CREATE new
            console.log('✨ Creating new sandbox');

            const newSandbox: CodeSandboxInstance = {
              id: Date.now().toString(),
              name: generateSandboxName(files, input),
              files: files,
              activeFileId: files[0].id,
              createdAt: new Date(),
              messageId: assistantMessageId,
            };

            setSandboxes(prev => [...prev, newSandbox]);
            setActiveSandboxId(newSandbox.id);
            setShowSandbox(true);

            setTimeout(() => {
              setSandboxes(prev => prev.map(sandbox =>
                sandbox.id === newSandbox.id
                  ? {
                    ...sandbox,
                    files: sandbox.files.map(f => ({ ...f, isGenerating: false }))
                  }
                  : sandbox
              ));
            }, Math.max(...files.map(f => f.code.length)) * 10);

            if (window.innerWidth < 768) {
              setMobileView('code');
            }
          }
        }
      }

    } catch (error) {
      triggerError();
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(errorMessage);

      addMessage({
        role: 'assistant',
        content: `I encountered an issue: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    input,
    messages,
    activeSandbox,
    activeSandboxId,
    sandboxes.length,
    addMessage,
    setInput,
    setIsLoading,
    triggerConfirmation,
    triggerError,
    setShowSandbox,
    setShowSandbox,
    parseMarkdownCodeBlocks,
    parseCodeFromResponse,
    generateSandboxName,
    detectUserIntent
  ]);

  const handleExampleClick = useCallback((example: string) => {
    setInput(example);
  }, [setInput]);

  const handleSuggestedPrompt = useCallback((prompt: string) => {
    setInput(prompt);
  }, [setInput]);

  const handleCodeChange = useCallback((fileId: string, newCode: string) => {
    if (!activeSandboxId) return;

    setSandboxes(prev => prev.map(sandbox =>
      sandbox.id === activeSandboxId
        ? {
          ...sandbox,
          files: sandbox.files.map(file =>
            file.id === fileId ? { ...file, code: newCode } : file
          )
        }
        : sandbox
    ));
  }, [activeSandboxId]);

  const handleFileChange = useCallback((fileId: string) => {
    if (!activeSandboxId) return;

    setSandboxes(prev => prev.map(sandbox =>
      sandbox.id === activeSandboxId
        ? { ...sandbox, activeFileId: fileId }
        : sandbox
    ));
  }, [activeSandboxId]);

  const handleCloseSandbox = useCallback(() => {
    setShowSandbox(false);
    setMobileView('chat');
  }, [setShowSandbox]);

  const handleDeleteSandbox = useCallback((sandboxId: string) => {
    setSandboxes(prev => prev.filter(s => s.id !== sandboxId));
    if (activeSandboxId === sandboxId) {
      const remaining = sandboxes.filter(s => s.id !== sandboxId);
      setActiveSandboxId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      if (remaining.length === 0) {
        setShowSandbox(false);
      }
    }
  }, [activeSandboxId, sandboxes]);

  const hasSandbox = showSandbox && sandboxes.length > 0 && activeSandbox;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <AppHeader />

      {hasSandbox && (
        <div className="md:hidden flex border-b border-border shrink-0">
          <button
            onClick={() => setMobileView('chat')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              mobileView === 'chat'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setMobileView('code')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              mobileView === 'code'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground'
            )}
          >
            <Code2 className="w-4 h-4" />
            Code
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className={cn(
          'flex flex-col min-h-0',
          hasSandbox ? 'hidden md:flex md:w-[60%]' : 'w-full',
          hasSandbox && mobileView === 'chat' && 'flex w-full md:w-[60%]',
          hasSandbox && mobileView === 'code' && 'hidden md:flex'
        )}>
          <div className="flex-1 overflow-hidden min-h-0">
            {messages.length === 0 ? (
              <EmptyState onExampleClick={handleExampleClick} />
            ) : (
              <ChatArea
                messages={messages}
                isLoading={isLoading}
                onSuggestedPrompt={handleSuggestedPrompt}
              />
            )}
          </div>

          <div className="shrink-0 border-t border-border">
            <ChatInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>

        {hasSandbox && (
          <div className={cn(
            'flex flex-col min-h-0 border-l border-border bg-background',
            'hidden md:flex md:w-[40%]',
            mobileView === 'code' && 'flex w-full md:w-[40%]'
          )}>
            {sandboxes.length > 1 && (
              <div className="shrink-0 px-4 py-2 border-b border-border bg-muted/30">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between text-sm"
                    >
                      <span className="truncate">{activeSandbox.name}</span>
                      <ChevronDown className="w-4 h-4 ml-2 shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[300px] max-h-[400px] overflow-y-auto">
                    {sandboxes.map((sandbox) => (
                      <DropdownMenuItem
                        key={sandbox.id}
                        onClick={() => setActiveSandboxId(sandbox.id)}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          activeSandboxId === sandbox.id && "bg-accent"
                        )}
                      >
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {sandbox.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {sandbox.files.length} file{sandbox.files.length !== 1 ? 's' : ''} • {
                              new Date(sandbox.createdAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })
                            }
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSandbox(sandbox.id);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div className="flex-1 overflow-hidden min-h-0">
              <CodeSandbox
                files={activeSandbox.files}
                activeFileId={activeSandbox.activeFileId}
                onFileChange={handleFileChange}
                onCodeChange={handleCodeChange}
                onClose={handleCloseSandbox}
                isVisible={true}
                enablePreview={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppPage() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}