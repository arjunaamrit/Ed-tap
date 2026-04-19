import { GoogleGenAI } from "@google/genai";

async function analyzeHackathon() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: "Analyze the current Google Gemini Hackathon on Devpost which has 35,000 submissions. What are the common themes, popular categories, and what makes a project stand out in such a large pool?",
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  console.log(response.text);
}

analyzeHackathon();
