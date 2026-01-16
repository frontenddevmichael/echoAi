import { AIMode, Message } from '@/context/AppContext';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/echo-chat`;

interface StreamChatParams {
  messages: { role: 'user' | 'assistant'; content: string }[];
  mode: AIMode;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export async function streamChat({
  messages,
  mode,
  onDelta,
  onDone,
  onError,
}: StreamChatParams) {
  try {
    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        mode 
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        onError('Rate limit exceeded. Please wait a moment and try again.');
        return;
      }
      if (response.status === 402) {
        onError('AI credits exhausted. Please add credits in your workspace settings.');
        return;
      }
      
      onError(error.error || 'Something went wrong. Please try again.');
      return;
    }

    if (!response.body) {
      onError('No response received from AI');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          // Incomplete JSON, put back and wait for more
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      for (let raw of buffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          // Ignore incomplete chunks at end
        }
      }
    }

    onDone();
  } catch (error) {
    console.error('Stream chat error:', error);
    onError('Connection failed. Please check your network and try again.');
  }
}

// Helper to detect code blocks in response
export function parseCodeBlocks(content: string): { text: string; codeBlocks: { code: string; language: string }[] } {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks: { code: string; language: string }[] = [];
  
  let text = content;
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push({
      language: match[1] || 'plaintext',
      code: match[2].trim(),
    });
  }
  
  // Remove code blocks from text
  text = content.replace(codeBlockRegex, '').trim();
  
  return { text, codeBlocks };
}
