// Echo AI Service
// Intent-driven responses without mode switching

export type Intent = 
  | 'conversation'
  | 'code_generation'
  | 'code_modification'
  | 'code_explanation'
  | 'debugging'
  | 'mixed';

export interface AIResponse {
  intent: Intent;
  chat: string;
  code: string | null;
  language: string | null;
  filename: string | null;
}

interface ChatParams {
  messages: { role: 'user' | 'assistant'; content: string }[];
  currentCode?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/echo-chat`;

export async function sendMessage(params: ChatParams): Promise<AIResponse> {
  const response = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      messages: params.messages,
      currentCode: params.currentCode,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    if (response.status === 402) {
      throw new Error('AI credits exhausted. Please add credits in your workspace settings.');
    }
    
    throw new Error(error.error || 'Something went wrong. Please try again.');
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }

  return {
    intent: data.intent || 'conversation',
    chat: data.chat || '',
    code: data.code || null,
    language: data.language || null,
    filename: data.filename || null,
  };
}

// Generate a unique user ID for session tracking (stored locally)
export function getUserId(): string {
  const stored = localStorage.getItem('echo-user-id');
  if (stored) return stored;
  
  const newId = crypto.randomUUID();
  localStorage.setItem('echo-user-id', newId);
  return newId;
}
