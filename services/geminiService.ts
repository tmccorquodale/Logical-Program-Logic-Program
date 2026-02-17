import { GoogleGenAI, Type } from "@google/genai";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestNeeds = async (goal: string): Promise<string[]> => {
  if (!goal) return [];
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As an expert in public health and medical research program design, suggest 4 core 'Needs' or 'Problem Statements' for a project with this goal: "${goal}". Focus on evidence-based gaps or systemic health issues.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response for needs", e);
    return [];
  }
};

export const suggestAims = async (need: string, goal: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Goal: "${goal}"\nNeed: "${need}"\nSuggest 3 specific 'Aims' that address this need while contributing to the overall goal. Aims must be SMART.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response for aims", e);
    return [];
  }
};

export const suggestLogicDetails = async (aim: string): Promise<{
  activities: string[],
  outputs: string[],
  shortTermImpacts: string[],
  longTermImpacts: string[]
}> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `For the program aim: "${aim}", provide a detailed breakdown of activities, outputs, and impacts. Provide 3-4 items for each category.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
          outputs: { type: Type.ARRAY, items: { type: Type.STRING } },
          shortTermImpacts: { type: Type.ARRAY, items: { type: Type.STRING } },
          longTermImpacts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["activities", "outputs", "shortTermImpacts", "longTermImpacts"]
      }
    }
  });

  try {
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response for logic details", e);
    return { activities: [], outputs: [], shortTermImpacts: [], longTermImpacts: [] };
  }
};