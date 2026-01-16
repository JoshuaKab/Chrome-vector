
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const vectorizeImage = async (base64Image: string, mimeType: string, isDetailed: boolean = false): Promise<string> => {
  const ai = getAI();
  const model = 'gemini-3-pro-preview';

  const prompt = isDetailed ? `
    Act as an elite master of SVG cartography and vector illustration.
    Your task is to create an ultra-detailed, high-fidelity SVG reproduction of the provided image.
    Precision Rules:
    1. Output ONLY valid, standalone SVG XML code. No prose, no markdown wrappers.
    2. Fidelity: Capture every intricate detail, fine curve, and small visual element. Do not simplify the geometry.
    3. Colors & Textures: Use complex paths with precise hex colors. Implement <linearGradient> and <radialGradient> to accurately reflect lighting, shadows, and color transitions found in the original.
    4. Structure: Organize the SVG using <g> (groups) with descriptive IDs for different visual components (e.g., 'foreground', 'background', 'highlights').
    5. Proportions: Maintain pixel-perfect aspect ratios and use an appropriate viewBox that matches the source image dimensions.
    6. Depth: Use overlapping paths to create a sense of depth and 3D form.
  ` : `
    Act as a professional graphic designer and SVG developer. 
    Analyze the provided image and generate a high-quality, clean SVG representation.
    Rules:
    1. Output ONLY the valid SVG XML code. No markdown, no commentary.
    2. Use paths, shapes, and gradients where appropriate to represent the image as a vector.
    3. Keep the code efficient but detailed enough to represent the primary subjects.
    4. Ensure the viewBox is set correctly based on the image's proportions.
    5. If the image is complex, focus on the main silhouette and prominent color blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        temperature: 0.1,
      }
    });

    const result = response.text || '';
    return result.replace(/```svg/g, '').replace(/```xml/g, '').replace(/```/g, '').trim();
  } catch (error) {
    console.error("Vectorization failed:", error);
    throw new Error("Could not vectorize the image. If the image is too complex, try disabling High Detail mode.");
  }
};

export interface DetectedColor {
  hex: string;
  name: string;
  rgb: { r: number; g: number; b: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

export const detectColors = async (base64Image: string, mimeType: string): Promise<DetectedColor[]> => {
  const ai = getAI();
  const model = 'gemini-3-flash-preview';

  const prompt = `
    Analyze this image and identify the top 5 most prominent and distinct colors. 
    For each color, provide:
    1. A descriptive name (e.g., 'Deep Cobalt', 'Muted Terracotta').
    2. The Hex code.
    3. The RGB values.
    4. The CMYK values.
    
    Return the data as a clean JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING },
              name: { type: Type.STRING },
              rgb: {
                type: Type.OBJECT,
                properties: {
                  r: { type: Type.NUMBER },
                  g: { type: Type.NUMBER },
                  b: { type: Type.NUMBER }
                }
              },
              cmyk: {
                type: Type.OBJECT,
                properties: {
                  c: { type: Type.NUMBER },
                  m: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  k: { type: Type.NUMBER }
                }
              }
            },
            required: ["hex", "name", "rgb", "cmyk"]
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Color detection failed:", error);
    throw new Error("Could not detect colors from the image.");
  }
};
