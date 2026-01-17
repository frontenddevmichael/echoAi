import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Intent types that Echo can detect
type Intent = 
  | 'conversation'
  | 'code_generation'
  | 'code_modification'
  | 'code_explanation'
  | 'debugging'
  | 'mixed';

interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  currentCode?: string;
}

// System prompt for Echo - intent-aware, code-aware assistant
const systemPrompt = `You are Echo, an AI coding assistant. You are calm, precise, and helpful.

CRITICAL RESPONSE FORMAT:
You must respond with valid JSON in this exact structure:
{
  "intent": "conversation" | "code_generation" | "code_modification" | "code_explanation" | "debugging" | "mixed",
  "chat": "Your conversational response here. Keep it concise and developer-to-developer.",
  "code": "The complete code if any, or null",
  "language": "The programming language if code exists, or null",
  "filename": "Suggested filename if code exists, or null"
}

INTENT DETECTION RULES:
- "conversation": General chat, questions, greetings, no code involved
- "code_generation": User asks you to create/write/build something
- "code_modification": User provides code and asks to change/refactor/improve it
- "code_explanation": User asks you to explain code or concepts with code examples
- "debugging": User has errors, bugs, or asks to fix something
- "mixed": Complex request involving multiple intents

RESPONSE STYLE:
- Be concise. No filler phrases.
- Sound like a senior developer helping a colleague.
- Never use emojis.
- When generating code, provide complete, working code.
- When explaining, be clear but not verbose.
- For errors, identify root cause first.

IMPORTANT:
- Always respond with valid JSON only. No markdown, no extra text.
- If the user provides code context, consider it when responding.
- The "code" field should contain ONLY the code, no markdown backticks.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, currentCode }: ChatRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware messages
    const contextMessages = [...messages];
    
    // If there's current code in the sandbox, add it as context
    if (currentCode && currentCode.trim()) {
      const lastUserIndex = contextMessages.findLastIndex(m => m.role === 'user');
      if (lastUserIndex >= 0) {
        contextMessages[lastUserIndex] = {
          ...contextMessages[lastUserIndex],
          content: `[Current code in sandbox]:\n${currentCode}\n\n[User message]: ${contextMessages[lastUserIndex].content}`
        };
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...contextMessages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to parse as JSON, fallback to conversation if invalid
    let parsed;
    try {
      // Clean potential markdown wrapping
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      parsed = JSON.parse(cleanContent);
    } catch {
      // If not valid JSON, treat as plain conversation
      parsed = {
        intent: 'conversation',
        chat: content,
        code: null,
        language: null,
        filename: null
      };
    }

    // Validate the response structure
    const result = {
      intent: parsed.intent || 'conversation',
      chat: parsed.chat || parsed.message || content,
      code: parsed.code || null,
      language: parsed.language || null,
      filename: parsed.filename || null
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Echo chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
