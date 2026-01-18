import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, MessageSquare } from 'lucide-react';
import { AppProvider, useApp } from '@/context/AppContext';
import { AppHeader } from '@/components/app/AppHeader';
import { ChatArea } from '@/components/app/ChatArea';
import ChatInput from '@/components/app/ChatInput';
import { EmptyState } from '@/components/app/EmptyState';
import { CodeSandbox } from '@/components/app/CodeSandbox';
import { useHaptics } from '@/hooks/useHaptics';
import { sendMessage } from '@/lib/ai';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function AppContent() {
  const { 
    messages, 
    addMessage, 
    updateMessage, 
    input, 
    setInput, 
    isLoading, 
    setIsLoading,
    codeState,
    setCodeState,
    showSandbox,
    setShowSandbox
  } = useApp();
  
  const { triggerSuccess, triggerError, triggerThinking, stop: stopHaptics } = useHaptics();
  const [mobileView, setMobileView] = useState<'chat' | 'code'>('chat');

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;

    // Add user message
    addMessage({
      role: 'user',
      content: input,
    });

    setInput('');
    setIsLoading(true);
    triggerThinking(10000);

    try {
      // Prepare conversation history
      const conversationHistory = [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content: input }
      ];

      // Send to AI with current code context
      const response = await sendMessage({
        messages: conversationHistory,
        currentCode: codeState?.code,
      });

      stopHaptics();
      triggerSuccess();

      // Add assistant response (chat only, no code in messages)
      addMessage({
        role: 'assistant',
        content: response.chat,
        intent: response.intent,
      });

      // If AI returned code, update sandbox
      if (response.code) {
        setCodeState({
          code: response.code,
          language: response.language || 'typescript',
          filename: response.filename,
        });
        setShowSandbox(true);
        // On mobile, switch to code view when code is generated
        if (window.innerWidth < 768) {
          setMobileView('code');
        }
      }

    } catch (error) {
      stopHaptics();
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
  }, [input, messages, codeState, addMessage, setInput, setIsLoading, triggerSuccess, triggerError, triggerThinking, stopHaptics, setCodeState, setShowSandbox]);

  const handleExampleClick = useCallback((example: string) => {
    setInput(example);
  }, [setInput]);

  const handleCodeChange = useCallback((newCode: string) => {
    if (codeState) {
      setCodeState({ ...codeState, code: newCode });
    }
  }, [codeState, setCodeState]);

  const handleCloseSandbox = useCallback(() => {
    setShowSandbox(false);
    setMobileView('chat');
  }, [setShowSandbox]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      {/* Mobile view toggle */}
      {showSandbox && (
        <div className="md:hidden flex border-b border-border">
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
      
      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat container */}
        <div className={cn(
          'flex-1 flex flex-col min-w-0',
          showSandbox && 'md:flex-[0.5]',
          showSandbox && mobileView === 'code' && 'hidden md:flex'
        )}>
          {messages.length === 0 ? (
            <EmptyState onExampleClick={handleExampleClick} />
          ) : (
            <ChatArea messages={messages} isLoading={isLoading} />
          )}
          
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Code sandbox container */}
        <div className={cn(
          'flex-1 min-w-0',
          !showSandbox && 'hidden',
          showSandbox && 'md:flex-[0.5]',
          showSandbox && mobileView === 'chat' && 'hidden md:block'
        )}>
          {codeState && (
            <CodeSandbox
              code={codeState.code}
              language={codeState.language}
              filename={codeState.filename}
              onCodeChange={handleCodeChange}
              onClose={handleCloseSandbox}
              isVisible={showSandbox}
            />
          )}
        </div>
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
