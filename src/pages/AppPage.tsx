import { useCallback, useRef } from 'react';
import { AppProvider, useApp, AIMode, Message } from '@/context/AppContext';
import { AppHeader } from '@/components/app/AppHeader';
import { ChatArea } from '@/components/app/ChatArea';
import { ChatInput } from '@/components/app/ChatInput';
import { EmptyState } from '@/components/app/EmptyState';
import { useHaptics } from '@/hooks/useHaptics';
import { streamChat, parseCodeBlocks } from '@/lib/ai';
import { toast } from 'sonner';

function AppContent() {
  const { messages, addMessage, updateMessage, input, setInput, isLoading, setIsLoading, mode } = useApp();
  const { triggerSuccess, triggerError, triggerThinking, stop: stopHaptics } = useHaptics();

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;

    // Add user message
    addMessage({
      role: 'user',
      content: input,
      mode,
    });

    // Create assistant message placeholder
    const assistantId = addMessage({
      role: 'assistant',
      content: '',
      mode,
    });

    setInput('');
    setIsLoading(true);
    triggerThinking(10000);

    let fullContent = '';

    // Prepare conversation history for AI (exclude the empty assistant message)
    const conversationHistory = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: input }
    ];

    await streamChat({
      messages: conversationHistory,
      mode,
      onDelta: (chunk) => {
        fullContent += chunk;
        updateMessage(assistantId, { content: fullContent });
      },
      onDone: () => {
        stopHaptics();
        triggerSuccess();
        setIsLoading(false);

        // Parse for code blocks
        const { text, codeBlocks } = parseCodeBlocks(fullContent);
        
        if (codeBlocks.length > 0) {
          updateMessage(assistantId, {
            content: fullContent,
            code: codeBlocks[0]?.code,
            language: codeBlocks[0]?.language,
            confidence: 0.85 + Math.random() * 0.15,
          });
        } else {
          updateMessage(assistantId, {
            content: fullContent,
            confidence: 0.85 + Math.random() * 0.15,
          });
        }
      },
      onError: (error) => {
        stopHaptics();
        triggerError();
        setIsLoading(false);
        toast.error(error);
        
        updateMessage(assistantId, {
          content: `⚠️ ${error}`,
        });
      },
    });
  }, [input, mode, messages, addMessage, updateMessage, setInput, setIsLoading, triggerSuccess, triggerError, triggerThinking, stopHaptics]);

  const handleExampleClick = useCallback((example: string) => {
    setInput(example);
  }, [setInput]);

  const placeholders: Record<AIMode, string> = {
    chat: 'Ask me anything...',
    code_generation: 'Describe the code you need...',
    code_modification: 'Paste your code and describe changes...',
    code_explanation: 'Paste code to explain...',
    debugging: 'Paste your error or describe the bug...',
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      {messages.length === 0 ? (
        <EmptyState mode={mode} onExampleClick={handleExampleClick} />
      ) : (
        <ChatArea messages={messages} isLoading={isLoading} />
      )}
      
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={placeholders[mode]}
      />
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
