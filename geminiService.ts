
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRoadmap = async (topic: string, depth: number = 0): Promise<any[]> => {
  if (!process.env.API_KEY) return [];

  const systemInstruction = `You are a world-class T-Shaped Curriculum Architect (Wharton/MIT persona).
Your goal: Design a learning path for "${topic}" that balances Breadth and Depth.

ONTOLOGY RULES:
1. BREADTH (Level 0-10): The first 3 nodes must represent 'Horizontal' knowledge—adjacent fields, mental models, and absolute basics. Use Level 0 for the first node.
2. DEPTH (Level 11-100): The subsequent nodes must represent the 'Vertical' spike—highly specialized, technical mastery in the core topic.
3. PEDAGOGICAL LINKING: Nodes must flow linearly. Level 0 -> Level 5 -> Level 10 -> Level 30 -> Level 60 -> Level 100.
4. STUDY KIT: For each node, provide 3 high-precision 'Pro Search Queries' and 2 'Masterclass Resources'.
5. WHARTON PRECISION: Use rigorous, signal-dense language.

Output exactly 6 nodes for the initial spine (depth 0).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Architect a T-shaped master path for: "${topic}". Begin with absolute zero-level foundations.`,
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
                  search_queries: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING }
                  },
                  resources: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING }
                  }
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
  } catch (error) {
    console.error("Roadmap generation failed", error);
    return [];
  }
};

export const generateNodeContent = async (nodeTitle: string, contextTopic: string): Promise<any> => {
  if (!process.env.API_KEY) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a deep pedagogical dissection of "${nodeTitle}" within the master domain of "${contextTopic}".
      
      Your objective is to provide expert-level mastery content.
      
      STRUCTURE REQUIRED:
      1. EXECUTIVE SUMMARY: High-signal theoretical grounding.
      2. TECHNICAL MECHANICS: 4-6 detailed steps or components explaining 'How' it works.
      3. MINUTE DETAILS: 3-5 'Miniscule' nuances, edge cases, or expert-level observations that distinguish a master from a practitioner.
      4. EXPERT MENTAL MODEL: A single, powerful framing for how to think about this concept.
      5. COMMON PITFALLS: 3 ways novices fail or misunderstand this.
      6. ELI7: A "No Fluff" simplified analogy for a 7-year old.
      
      Format as JSON with keys: executiveSummary, technicalMechanics (array), minuteDetails (array), expertMentalModel, commonPitfalls (array), eli7.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            technicalMechanics: { type: Type.ARRAY, items: { type: Type.STRING } },
            minuteDetails: { type: Type.ARRAY, items: { type: Type.STRING } },
            expertMentalModel: { type: Type.STRING },
            commonPitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
            eli7: { type: Type.STRING }
          },
          required: ["executiveSummary", "technicalMechanics", "minuteDetails", "expertMentalModel", "commonPitfalls", "eli7"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Content generation failed", error);
    return null;
  }
};
