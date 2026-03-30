import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

/**
 * Helper to ensure the AI client is initialized with a valid key.
 */
function getAI() {
  // Try to get the API key from various possible locations
  // process.env.GEMINI_API_KEY is the standard way in AI Studio
  // import.meta.env.VITE_GEMINI_API_KEY is the standard way in Vite for local dev
  const apiKey = (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : null) || 
                 (import.meta.env?.VITE_GEMINI_API_KEY);

  if (!apiKey) {
    throw new Error("Gemini API key is missing. Please ensure GEMINI_API_KEY is set in your environment variables via the Settings menu.");
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
    throw new Error("Failed to initialize AI client. Check your API key configuration.");
  }
}

export interface Source {
  url: string;
  title: string;
}

export interface SearchResult {
  summary: string;
  sources: Source[];
}

/**
 * Defines a word based on its context within a document.
 */
export async function defineWord(word: string, context: string): Promise<{ success: boolean; definition: string }> {
  try {
    const client = getAI();
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Define the word "${word}" as it is used in the following context: "${context}". Provide a clear, concise definition.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            definition: {
              type: Type.STRING,
              description: "The definition of the word.",
            },
          },
          required: ["definition"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      success: !!result.definition,
      definition: result.definition || "Definition not found.",
    };
  } catch (error) {
    console.error("Error defining word with Gemini:", error);
    throw error;
  }
}

/**
 * Provides more detailed information about a word in context, limited to 129 +-9 words.
 */
export async function getMoreInfo(word: string, context: string): Promise<{ success: boolean; info: string }> {
  try {
    const client = getAI();
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Provide more detailed information and interesting facts about the word "${word}" as it is used in the following context: "${context}". Keep your response concise and aim for approximately 129 words (between 120 and 138 words).`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            info: {
              type: Type.STRING,
              description: "The detailed information about the word.",
            },
          },
          required: ["info"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      success: !!result.info,
      info: result.info || "No additional information found.",
    };
  } catch (error) {
    console.error("Error getting more info with Gemini:", error);
    throw error;
  }
}

/**
 * Explains a sentence or phrase contextually, keeping the big picture in mind.
 */
export async function explainSentence(sentence: string, context: string): Promise<{ success: boolean; explanation: string }> {
  try {
    const client = getAI();
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Explain the following sentence or phrase contextually within the provided document snippet. Keep the "big picture" idea in mind and be concise.
      
      SENTENCE/PHRASE: "${sentence}"
      CONTEXT: "${context}"`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: {
              type: Type.STRING,
              description: "The contextual explanation of the sentence or phrase.",
            },
          },
          required: ["explanation"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      success: !!result.explanation,
      explanation: result.explanation || "Explanation not found.",
    };
  } catch (error) {
    console.error("Error explaining sentence with Gemini:", error);
    throw error;
  }
}

/**
 * Translates text into a target language.
 */
export async function translateText(text: string, targetLanguageName: string): Promise<{ translation: string }> {
  try {
    const client = getAI();
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: `Translate the following text into ${targetLanguageName}: "${text}". Return only the translated text.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: {
              type: Type.STRING,
              description: "The translated text.",
            },
          },
          required: ["translation"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      translation: result.translation || "Translation failed.",
    };
  } catch (error) {
    console.error("Error translating text with Gemini:", error);
    throw error;
  }
}

/**
 * Searches the web and summarizes the results for a query.
 */
export async function searchAndSummarize(query: string): Promise<SearchResult> {
  try {
    const client = getAI();
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
      },
    });

    const summary = response.text || "No summary available.";
    
    // Extract sources from grounding metadata
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web) {
          sources.push({
            url: chunk.web.uri || "",
            title: chunk.web.title || "Source",
          });
        }
      }
    }

    return {
      summary,
      sources,
    };
  } catch (error) {
    console.error("Error searching and summarizing with Gemini:", error);
    throw error;
  }
}

/**
 * Chats with a document using streaming.
 */
export async function* chatWithDocumentStream(
  question: string,
  documentContent: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
) {
  try {
    const client = getAI();
    const chat = client.chats.create({
      model: "gemini-3.1-flash-lite-preview",
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        systemInstruction: `You are a helpful assistant that answers questions about the following document:
        
        DOCUMENT CONTENT:
        ${documentContent}
        
        Use the document content to answer the user's questions. If the answer is not in the document, say so.`,
      },
      history: conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessageStream({ message: question });

    for await (const chunk of result) {
      yield chunk.text || "";
    }
  } catch (error) {
    console.error("Error chatting with document using Gemini:", error);
    throw error;
  }
}
