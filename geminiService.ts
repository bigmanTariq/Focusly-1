
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * T-SHAPED CURRICULUM ARCHITECT
 * Enforces Horizontal Breadth (adjacent fields/models) followed by Vertical Depth (technical mastery).
 */

export const generateRoadmap = async (topic: string, depth: number = 0): Promise<any[]> => {
  if (!process.env.API_KEY) return [];

  const systemInstruction = `You are a world-class T-Shaped Pedagogical Architect. 
Your goal: Transform "${topic}" into a structured 6-node learning spine.

PEDAGOGICAL ONTOLOGY:
1. THE HORIZONTAL (Nodes 1-3): Focus on 'Breadth'. 
   - Node 1: Absolute Foundations (Lvl 0). 
   - Node 2: Adjacent Domains & Context (Lvl 5). 
   - Node 3: Core Mental Models & First Principles (Lvl 10).
2. THE VERTICAL (Nodes 4-6): Focus on 'Depth'.
   - Node 4: Technical Execution & Mechanics (Lvl 30).
   - Node 5: Advanced Optimization & Systems (Lvl 60).
   - Node 6: Expert Nuance, Edge Cases & Mastery (Lvl 100).

OUTPUT REQUIREMENTS:
- Every node MUST have a title that reflects expert terminology.
- Description MUST explain the "Why" and the "How".
- Every node MUST be classified as 'signal'.
- Provide high-precision pro search queries for each.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Architect the T-Shaped mastery path for: "${topic}". Strictly follow the Lvl 0, 5, 10, 30, 60, 100 progression.`,
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
      contents: `Perform an exhaustive expert-level pedagogical dissection of "${nodeTitle}" in the domain of "${contextTopic}".
      
      GOAL: Take a user from zero to expert on this specific node.
      
      STRICT STRUCTURE:
      1. EXECUTIVE SUMMARY: High-signal, dense theoretical grounding.
      2. TECHNICAL MECHANICS: 5 detailed, sequential steps of how this actually functions in practice.
      3. MINUTE DETAILS: 4 "Miniscule" expert secrets, subtle nuances, or high-level observations that practitioners miss.
      4. EXPERT MENTAL MODEL: A powerful analogy or cognitive framework for this concept.
      5. COMMON PITFALLS: Where people fail and why.
      6. ELI7: A "No Fluff" brilliant simple version.
      
      Tone: Professional, signal-dense, Wharton-style precision.`,
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
