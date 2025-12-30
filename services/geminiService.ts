
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const chatWithGemini = async (message: string, history: any[] = []) => {
  const ai = getAI();
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
  });
  return response.text;
};

export const generateImage = async (prompt: string) => {
  const ai = getAI();
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in response");
};

export const analyzeText = async (text: string, task: string) => {
  const ai = getAI();
  const prompt = `Task: ${task}\n\nContent:\n${text}`;
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text;
};
