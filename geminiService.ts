
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry(fn: () => Promise<any>, maxRetries = 3, initialDelay = 2000) {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      // Check if it's a rate limit error (429)
      if (error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        const delay = initialDelay * Math.pow(2, i);
        console.warn(`Rate limit hit. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const generateRoadmap = async (topic: string, depth: number = 0): Promise<any[]> => {
  if (!process.env.API_KEY) return [];

  const systemInstruction = `You are a world-class T-Shaped Pedagogical Architect. 
Goal: Transform "${topic}" into a 6-node linear mastery spine.
T-SHAPE PHILOSOPHY:
1. THE HORIZONTAL (Nodes 1-3): Context, First Principles. Focus on "What" and "Why".
2. THE VERTICAL (Nodes 4-6): Expert Execution, Edge Cases. Focus on "How" and "Optimizing".`;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      // Using flash for roadmap structure as it has higher rate limits and is excellent for structural logic
      model: "gemini-3-flash-preview",
      contents: `Architect the T-Shaped mastery path for: "${topic}". Use levels: 0 (Identification), 5 (Terminology), 15 (Mechanics), 40 (Application), 75 (Optimization), 100 (Synthesis).`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['signal', 'noise'] },
                  difficulty_level: { type: Type.INTEGER },
                  learning_outcome: { type: Type.STRING },
                  search_queries: { type: Type.ARRAY, items: { type: Type.STRING } },
                  resources: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["title", "description", "type", "difficulty_level", "learning_outcome", "search_queries", "resources"]
              }
            }
          },
          required: ["nodes"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result.nodes.sort((a: any, b: any) => a.difficulty_level - b.difficulty_level);
  });
};

export const generateNodeContent = async (nodeTitle: string, contextTopic: string, complexity: number = 50): Promise<any> => {
  if (!process.env.API_KEY) return null;

  const BloomLevel = complexity < 10 ? 
    "LEVEL 0 (IDENTIFICATION): Provide a pre-filled data set. User's ONLY job is to change ONE clearly labelled cell or line to match the 'Signal'. Extremely low cognitive load." :
    complexity < 30 ? 
    "LEVEL 30 (APPLICATION): Provide a partial structure. User fills in the critical path logic." :
    "LEVEL 100 (SYNTHESIS): Provide a chaotic, noise-filled environment. User must refactor it for purity.";

  const systemInstruction = `You are a Subject Matter Dissector using Learning Science (Cognitive Load Theory).
Focus: "${nodeTitle}" within "${contextTopic}".
Difficulty: ${complexity}/100.

PEDAGOGICAL REQUIREMENTS:
- Level < 10: Task must be 'Zero-Config'. The user just spots the signal.
- Playground: Use 'spreadsheet' for data/finance, 'code' for logic/algorithms.
- Hint System: 3 hints ranging from 'Conceptual' to 'Literal'.`;

  return callWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Generate a mastery deep-dive for "${nodeTitle}". Difficulty: ${complexity}. ${BloomLevel}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            technicalMechanics: { type: Type.ARRAY, items: { type: Type.STRING } },
            minuteDetails: { type: Type.ARRAY, items: { type: Type.STRING } },
            expertMentalModel: { type: Type.STRING },
            commonPitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
            eli7: { type: Type.STRING },
            detoxProtocol: { type: Type.ARRAY, items: { type: Type.STRING } },
            playground: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['code', 'spreadsheet', 'canvas', 'none'] },
                initialData: { type: Type.STRING },
                prompt: { type: Type.STRING },
                scaffolding: {
                  type: Type.OBJECT,
                  properties: {
                    correctSignal: { type: Type.STRING },
                    noiseDistractions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    expertHints: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["correctSignal", "noiseDistractions", "expertHints"]
                }
              },
              required: ["type", "initialData", "prompt", "scaffolding"]
            }
          },
          required: ["executiveSummary", "technicalMechanics", "minuteDetails", "expertMentalModel", "commonPitfalls", "eli7", "detoxProtocol", "playground"]
        }
      }
    });

    return JSON.parse(response.text);
  });
};
