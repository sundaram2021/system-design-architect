import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to delay execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 8192,
      responseMimeType: "application/json"
    }
  });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "I understand. I will follow these instructions precisely and respond only in the specified JSON format." }]
      }
    ]
  });

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await chat.sendMessage(userPrompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Gemini API attempt ${attempt + 1} failed:`, error);
      
      // Wait before retry with exponential backoff (1s, 2s, 4s)
      if (attempt < maxRetries - 1) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }
  
  throw lastError || new Error("Gemini API failed after retries");
}

export async function streamWithGemini(
  systemPrompt: string,
  userPrompt: string,
  onChunk: (chunk: string) => void
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  });

  const chat = model.startChat({
    history: [
      {
        role: "user", 
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "I understand. I will follow these instructions precisely." }]
      }
    ]
  });

  const result = await chat.sendMessageStream(userPrompt);
  
  let fullResponse = "";
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullResponse += chunkText;
    onChunk(chunkText);
  }
  
  return fullResponse;
}
