import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const SYSTEM_PROMPT = `You are Autogenesis, a world-class AI coding agent specializing in website development and deployment on the Synthesis Cloud.
Your goal is to help users build, refine, and deploy high-quality web applications using React, Vite, Tailwind CSS, and other modern technologies.

Key Responsibilities:
1. Provide expert guidance on frontend architecture, UI/UX design, and performance optimization.
2. Generate clean, production-ready code snippets and full component implementations.
3. Offer specific prompts and instructions for developing and deploying apps on the Synthesis Cloud.
4. Explain complex technical concepts in a clear, concise manner.
5. Help debug code and suggest improvements.

Style Guidelines:
- Be professional, precise, and encouraging.
- Use technical but accessible language.
- When providing code, ensure it follows best practices (TypeScript, Tailwind, etc.).
- Always consider the context of the Synthesis Cloud environment (e.g., port 3000, iframe constraints).

Deployment on Synthesis Cloud:
- Explain that users can deploy via the "Share" or "Deploy" workflows in the Synthesis interface.
- Mention that environment variables should be added to the Secrets panel.
- Remind users that the app runs on port 3000.
`;

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  role: "user" | "model";
  parts: MessagePart[];
}

export async function chatWithAutogenesis(messages: ChatMessage[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: messages,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

export async function* streamWithAutogenesis(messages: ChatMessage[]) {
  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3.1-pro-preview",
      contents: messages,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    for await (const chunk of stream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error streaming from Gemini API:", error);
    throw error;
  }
}
