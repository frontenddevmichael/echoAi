import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserId, Intent } from '@/lib/ai';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: Intent;
  timestamp: Date;
}

export interface CodeState {
  code: string;
  language: string;
  filename: string | null;
}

interface AppContextType {
  // Session
  sessionId: string | null;
  userId: string;
  
  // Messages (conversation only)
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  
  // Code sandbox (single source of truth)
  codeState: CodeState | null;
  setCodeState: (state: CodeState | null) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showSandbox: boolean;
  setShowSandbox: (show: boolean) => void;
  
  // Input
  input: string;
  setInput: (input: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateId(): string {
  return crypto.randomUUID();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [userId] = useState(() => getUserId());
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [codeState, setCodeStateInternal] = useState<CodeState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [input, setInput] = useState('');

  // Initialize or load session
  useEffect(() => {
    const initSession = async () => {
      // Try to load from localStorage first (offline support)
      const cachedSession = localStorage.getItem('echo-session-cache');
      if (cachedSession) {
        try {
          const parsed = JSON.parse(cachedSession);
          setSessionId(parsed.sessionId);
          setMessages(parsed.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
          if (parsed.codeState) {
            setCodeStateInternal(parsed.codeState);
            setShowSandbox(true);
          }
        } catch (e) {
          console.error('Failed to parse cached session:', e);
        }
      }

      // Try to sync with backend
      try {
        const { data: sessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (sessions && sessions.length > 0) {
          const existingSessionId = sessions[0].id;
          setSessionId(existingSessionId);
          
          // Load messages from backend
          const { data: backendMessages } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', existingSessionId)
            .order('created_at', { ascending: true });

          if (backendMessages && backendMessages.length > 0) {
            setMessages(backendMessages.map(m => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              intent: m.intent as Intent | undefined,
              timestamp: new Date(m.created_at)
            })));
          }

          // Load latest code snippet
          const { data: snippets } = await supabase
            .from('code_snippets')
            .select('*')
            .eq('session_id', existingSessionId)
            .order('updated_at', { ascending: false })
            .limit(1);

          if (snippets && snippets.length > 0) {
            setCodeStateInternal({
              code: snippets[0].code,
              language: snippets[0].language,
              filename: snippets[0].filename
            });
            setShowSandbox(true);
          }
        } else {
          // Create new session
          const { data: newSession } = await supabase
            .from('sessions')
            .insert({ user_id: userId })
            .select()
            .single();

          if (newSession) {
            setSessionId(newSession.id);
          }
        }
      } catch (e) {
        console.error('Failed to sync with backend:', e);
        // Continue with local state
        if (!sessionId) {
          setSessionId(generateId());
        }
      }
    };

    initSession();
  }, [userId]);

  // Cache to localStorage on changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('echo-session-cache', JSON.stringify({
        sessionId,
        messages,
        codeState
      }));
    }
  }, [sessionId, messages, codeState]);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>): string => {
    const id = generateId();
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);

    // Persist to backend
    if (sessionId) {
      supabase
        .from('messages')
        .insert({
          id,
          session_id: sessionId,
          role: message.role,
          content: message.content,
          intent: message.intent || null
        })
        .then(({ error }) => {
          if (error) console.error('Failed to save message:', error);
        });
    }

    return id;
  }, [sessionId]);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    setCodeStateInternal(null);
    setShowSandbox(false);
    
    // Create new session
    const newSessionId = generateId();
    setSessionId(newSessionId);

    try {
      await supabase
        .from('sessions')
        .insert({ id: newSessionId, user_id: userId });
    } catch (e) {
      console.error('Failed to create new session:', e);
    }
  }, [userId]);

  const setCodeState = useCallback((state: CodeState | null) => {
    setCodeStateInternal(state);
    
    if (state && sessionId) {
      // Persist to backend
      supabase
        .from('code_snippets')
        .insert({
          session_id: sessionId,
          code: state.code,
          language: state.language,
          filename: state.filename
        })
        .then(({ error }) => {
          if (error) console.error('Failed to save code snippet:', error);
        });
    }
  }, [sessionId]);

  return (
    <AppContext.Provider
      value={{
        sessionId,
        userId,
        messages,
        addMessage,
        updateMessage,
        clearMessages,
        codeState,
        setCodeState,
        isLoading,
        setIsLoading,
        showSandbox,
        setShowSandbox,
        input,
        setInput,
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
