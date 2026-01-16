import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type AIMode = 'chat' | 'code_generation' | 'code_modification' | 'code_explanation' | 'debugging';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: AIMode;
  timestamp: Date;
  code?: string;
  language?: string;
  confidence?: number;
}

interface Session {
  id: string;
  messages: Message[];
  mode: AIMode;
  createdAt: Date;
  updatedAt: Date;
}

interface AppContextType {
  // Session
  session: Session | null;
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  
  // Mode
  mode: AIMode;
  setMode: (mode: AIMode) => void;
  
  // Input
  input: string;
  setInput: (input: string) => void;
  
  // State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Settings
  apiKey: string;
  setApiKey: (key: string) => void;
  apiProvider: 'openrouter' | 'together' | 'huggingface' | 'custom';
  setApiProvider: (provider: 'openrouter' | 'together' | 'huggingface' | 'custom') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setModeState] = useState<AIMode>('chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [apiProvider, setApiProviderState] = useState<'openrouter' | 'together' | 'huggingface' | 'custom'>('openrouter');

  // Load from localStorage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem('echo-session');
    const storedApiKey = localStorage.getItem('echo-api-key');
    const storedProvider = localStorage.getItem('echo-api-provider');
    
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
        setMessages(parsed.messages || []);
        setModeState(parsed.mode || 'chat');
      } catch (e) {
        console.error('Failed to parse stored session:', e);
      }
    } else {
      // Create new session
      const newSession: Session = {
        id: generateId(),
        messages: [],
        mode: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSession(newSession);
    }
    
    if (storedApiKey) {
      setApiKeyState(storedApiKey);
    }
    
    if (storedProvider) {
      setApiProviderState(storedProvider as any);
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    if (session) {
      const updatedSession = {
        ...session,
        messages,
        mode,
        updatedAt: new Date(),
      };
      localStorage.setItem('echo-session', JSON.stringify(updatedSession));
    }
  }, [session, messages, mode]);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    if (session) {
      const newSession: Session = {
        ...session,
        id: generateId(),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSession(newSession);
    }
  }, [session]);

  const setMode = useCallback((newMode: AIMode) => {
    setModeState(newMode);
  }, []);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem('echo-api-key', key);
  }, []);

  const setApiProvider = useCallback((provider: 'openrouter' | 'together' | 'huggingface' | 'custom') => {
    setApiProviderState(provider);
    localStorage.setItem('echo-api-provider', provider);
  }, []);

  return (
    <AppContext.Provider
      value={{
        session,
        messages,
        addMessage,
        clearMessages,
        mode,
        setMode,
        input,
        setInput,
        isLoading,
        setIsLoading,
        apiKey,
        setApiKey,
        apiProvider,
        setApiProvider,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
