
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ModelType, AspectRatio } from "../types";

// Note: process.env.API_KEY is injected by the environment

interface GenerateImageParams {
  prompt: string;
  model: ModelType;
  aspectRatio: AspectRatio;
}

/**
 * Handles image generation logic using Google Gemini API.
 */
export const generateImageWithGemini = async ({
  prompt,
  model,
  aspectRatio
}: GenerateImageParams): Promise<string> => {
  // Initialize the API client inside the function to ensure the latest API key is used
  const ai = new GoogleGenerativeAI({ apiKey: process.env.API_KEY });

  try {
    // Configure based on model capabilities
    // Flash Image (nano banana) supports aspectRatio
    // Pro Image supports aspectRatio and imageSize
    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio,
      }
    };

    // If it's the Pro model, we can explicitly request 1K (or higher if supported later)
    if (model === ModelType.GEMINI_PRO_IMAGE) {
      config.imageConfig.imageSize = "1K";
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [{ text: prompt }],
      },
      config: config
    });

    // Extract image from parts
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Note: The MIME type might not always be present in inlineData depending on the model version,
          // but usually defaults to image/png or image/jpeg.
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    // If we reached here, no image was found in the parts.
    // Check if there was text output explaining why (e.g. safety filter)
    const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
    if (textPart) {
      throw new Error(`Model declined to generate image: ${textPart.text}`);
    }

    throw new Error("Model response did not contain inline image data.");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

/**
 * retryOperation
 * Implements exponential backoff for resilience.
 */
export const retryOperation = async <T,>(
  operation: () => Promise<T>,
  retries: number = 2,
  delayMs: number = 1000
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Operation failed, retrying in ${delayMs}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return retryOperation(operation, retries - 1, delayMs * 2);
    }
    throw error;
  }
};
