import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  // Use a method to get the AI instance instead of a static property to ensure the correct API key is used and follow guidelines.
  private static getAI() {
    // Fix: Use process.env.API_KEY directly as per guidelines
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async editImage(base64Image: string, prompt: string, mimeType: string = 'image/png'): Promise<string | null> {
    try {
      // Fix: Create a new GoogleGenAI instance right before making an API call
      const ai = this.getAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: `Please edit this image based on the following instruction: ${prompt}. Return the edited image.`,
            },
          ],
        },
      });

      if (!response.candidates?.[0]?.content?.parts) return null;

      // Fix: Iterate through all parts to find the image part as per guidelines
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Gemini Image Editing Error:", error);
      return null;
    }
  }
}