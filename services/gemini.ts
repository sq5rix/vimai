import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '3:4' | '4:3' = '1:1'): Promise<string> => {
  const ai = getClient();
  
  // Using gemini-2.5-flash-image for standard generation as per requirements for speed/efficiency in this context,
  // or gemini-3-pro-image-preview for high quality if needed. Let's use 2.5 flash image for responsiveness in this demo.
  // However, the new guide suggests generateContent for nano banana series (flash image).
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: '1K' // Defaulting to 1K
        }
      }
    });

    let base64Image = '';
    
    // Iterate to find the image part
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Image) {
      throw new Error("No image generated.");
    }

    // Determine mime type, default to png if not specified in response (usually it is plain bytes in inlineData)
    // The guide example constructs it: `data:image/png;base64,${base64EncodeString}`
    return `data:image/png;base64,${base64Image}`;

  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};

export const editText = async (selection: string, instruction: string, fullContext?: string): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    You are an expert editor helper.
    
    Original Text Selection:
    """
    ${selection}
    """
    
    User Instruction: "${instruction}"
    
    Task: Rewrite the "Original Text Selection" following the user's instruction. 
    Return ONLY the rewritten text. Do not add markdown code blocks or explanations unless asked.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
    }
  });

  return response.text || selection;
};

export const continueWriting = async (currentText: string): Promise<string> => {
    const ai = getClient();
    // Take the last 2000 characters to maintain context but avoid token limits if the doc is huge
    const context = currentText.slice(-3000); 
    
    const prompt = `
      You are a creative co-author. Continue the following text naturally.
      
      Current Text Context:
      """
      ${context}
      """
      
      Continue writing from where the text left off. Keep the style consistent. 
      Return only the new added text.
    `;
  
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
  
    return response.text || "";
  };

export const imageToText = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = getClient();

  const prompt = `
    Transcribe the text from this image exactly as it appears.
    If it is handwritten, do your best to read it accurately.
    Return ONLY the raw text found in the image. Do not add markdown blocks or explanations.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        },
        { text: prompt }
      ]
    }
  });

  return response.text || "";
};