import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateArtisticSignature = async (name: string, aspectRatio: AspectRatio): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `Create a beautiful and artistic signature for the name '${name}'. The style should be elegant, modern, and suitable for a tech conference check-in wall. The signature should be on a clean, solid light-colored background.`,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio,
    },
  });

  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/png;base64,${base64ImageBytes}`;
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const imageData = base64Image.split(',')[1];
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: imageData,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error("No image generated from edit");
};

export const recognizeHandwriting = async (imageDataUrl: string): Promise<string> => {
  const imageData = imageDataUrl.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            data: imageData,
            mimeType: 'image/png',
          },
        },
        {
          text: 'Transcribe the handwritten text in this image. Respond with only the transcribed text, with no extra formatting or explanations.',
        },
      ],
    },
  });

  return response.text.trim();
};

export const generateWallBackground = async (): Promise<string> => {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: "An elegant and minimalist abstract background for a high-tech conference, in the style of Apple's marketing materials. Subtle gradients of blue, silver, and white. Clean, sophisticated, and futuristic.",
    config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
    },
  });
  
  const base64ImageBytes = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64ImageBytes}`;
};