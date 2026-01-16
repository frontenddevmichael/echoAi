import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';

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
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
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
  apiProvider: 'openrouter' | 'together' | 'huggingface' | 'custom' | 'lovable';
  setApiProvider: (provider: 'openrouter' | 'together' | 'huggingface' | 'custom' | 'lovable') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateId() {
  return crypto.randomUUID();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [mode, setModeState] = useState<AIMode>('chat');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [apiProvider, setApiProviderState] = useState<'openrouter' | 'together' | 'huggingface' | 'custom' | 'lovable'>('lovable');

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

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>): string => {
    const id = generateId();
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
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

  const setApiProvider = useCallback((provider: 'openrouter' | 'together' | 'huggingface' | 'custom' | 'lovable') => {
    setApiProviderState(provider);
    localStorage.setItem('echo-api-provider', provider);
  }, []);

  return (
    <AppContext.Provider
      value={{
        session,
        messages,
        addMessage,
        updateMessage,
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
