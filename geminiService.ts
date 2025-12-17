
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * T-Shaped Curriculum Architect Service
 */

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

export const generateNodeContent = async (nodeTitle: string, contextTopic: string): Promise<{ content: string, eli7Content: string }> => {
  if (!process.env.API_KEY) return { content: "", eli7Content: "" };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate interactive learning content for the concept "${nodeTitle}" within the broader context of "${contextTopic}".
      
      You must provide two versions:
      1. PROFESSIONAL: A high-signal, Wharton-level, no-fluff deep dive (approx 200 words). Use bullet points for key mechanics.
      2. ELI7: A "No Fluff" simplified version for a 7-year old using a brilliant analogy. No jargon.
      
      Format your response as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            professional: { type: Type.STRING },
            eli7: { type: Type.STRING }
          },
          required: ["professional", "eli7"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
      content: result.professional,
      eli7Content: result.eli7
    };
  } catch (error) {
    console.error("Content generation failed", error);
    return { content: "Failed to generate content.", eli7Content: "Failed to generate content." };
  }
};
