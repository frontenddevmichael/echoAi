import { useCallback } from 'react';
import { AppProvider, useApp, AIMode, Message } from '@/context/AppContext';
import { AppHeader } from '@/components/app/AppHeader';
import { ChatArea } from '@/components/app/ChatArea';
import { ChatInput } from '@/components/app/ChatInput';
import { EmptyState } from '@/components/app/EmptyState';
import { useHaptics } from '@/hooks/useHaptics';

function AppContent() {
  const { messages, addMessage, input, setInput, isLoading, setIsLoading, mode, apiKey } = useApp();
  const { triggerSuccess, triggerError, triggerThinking, stop: stopHaptics } = useHaptics();

  const handleSubmit = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: Omit<Message, 'id' | 'timestamp'> = {
      role: 'user',
      content: input,
      mode,
    };

    addMessage(userMessage);
    setInput('');
    setIsLoading(true);
    triggerThinking(5000);

    // Simulate AI response (in production, this would call the actual API)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const responses: Record<AIMode, { content: string; code?: string; language?: string }> = {
        chat: {
          content: `Great question! Here's what I think about "${input.slice(0, 50)}...":\n\nThis is a simulated response. In the full version, I'd connect to your configured AI provider and give you a thoughtful answer.`,
        },
        code_generation: {
          content: 'Here\'s the code you requested:',
          code: `// Generated code for: ${input.slice(0, 30)}...\n\nfunction example() {\n  console.log('Hello from Echo!');\n  return {\n    success: true,\n    message: 'This is generated code'\n  };\n}\n\nexport default example;`,
          language: 'typescript',
        },
        code_modification: {
          content: 'I\'ve made the following modifications:',
          code: `// Modified version\n\n// Added error handling\ntry {\n  const result = await fetchData();\n  return result;\n} catch (error) {\n  console.error('Error:', error);\n  throw error;\n}`,
          language: 'typescript',
        },
        code_explanation: {
          content: `Let me break down this code for you:\n\n1. **First**, the function initializes...\n2. **Then**, it processes the data...\n3. **Finally**, it returns the result.\n\nThis pattern is commonly used for handling asynchronous operations in a clean, readable way.`,
        },
        debugging: {
          content: 'I found the issue! Here\'s what\'s happening and how to fix it:',
          code: `// The issue was in the error handling\n// Before: Missing null check\n// After: Added proper validation\n\nif (data && data.items) {\n  return data.items.map(item => item.value);\n}\nreturn [];`,
          language: 'typescript',
        },
      };

      const response = responses[mode];
      stopHaptics();
      triggerSuccess();

      const assistantMessage: Omit<Message, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: response.content,
        mode,
        code: response.code,
        language: response.language,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% for demo
      };

      addMessage(assistantMessage);
    } catch (error) {
      stopHaptics();
      triggerError();
      addMessage({
        role: 'assistant',
        content: 'Sorry, something went wrong. Please check your API configuration and try again.',
        mode,
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, mode, addMessage, setInput, setIsLoading, triggerSuccess, triggerError, triggerThinking, stopHaptics]);

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
