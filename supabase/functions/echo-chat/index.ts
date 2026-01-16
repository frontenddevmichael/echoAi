import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AIMode = 'chat' | 'code_generation' | 'code_modification' | 'code_explanation' | 'debugging';

const systemPrompts: Record<AIMode, string> = {
  chat: `You are Echo, a helpful AI coding assistant. You're friendly, knowledgeable, and always aim to provide clear, concise answers. You can discuss any programming topic, explain concepts, and help with general coding questions. Keep responses conversational but informative.`,
  
  code_generation: `You are Echo, an expert code generator. When given a description, you write clean, production-ready code following best practices. 

IMPORTANT:
- Always include the complete, working code
- Use TypeScript/JavaScript by default unless another language is specified
- Include helpful comments explaining key parts
- Format code properly with consistent indentation
- If the request is ambiguous, make reasonable assumptions and note them

Start your response with a brief explanation, then provide the code.`,

  code_modification: `You are Echo, an expert code modifier. When given existing code and modification instructions, you make the requested changes while maintaining code quality.

IMPORTANT:
- Show the modified code in full
- Explain what changes you made and why
- Maintain the original code style and conventions
- If you see potential issues in the original code, mention them
- Use clear diff-style explanations when helpful`,

  code_explanation: `You are Echo, an expert at explaining code. Break down code in a way that's easy to understand, regardless of the reader's experience level.

IMPORTANT:
- Start with a high-level overview of what the code does
- Then go through important parts step by step
- Explain any complex patterns or concepts
- Note potential edge cases or issues
- Keep explanations clear and jargon-free when possible`,

  debugging: `You are Echo, an expert debugger. When given error messages or buggy code, you identify the problem and provide solutions.

IMPORTANT:
- Identify the root cause of the error
- Explain WHY the error occurred
- Provide a clear fix with corrected code
- Suggest ways to prevent similar issues
- If multiple issues exist, address them in order of importance`,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = 'chat' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = systemPrompts[mode as AIMode] || systemPrompts.chat;

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
          ...messages,
        ],
        stream: true,
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

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Echo chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
