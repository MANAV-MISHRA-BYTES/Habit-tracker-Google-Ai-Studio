import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getHabitMotivation = async (habitTitle: string, currentStreak: number): Promise<string> => {
  if (!ai) return "Keep going! You're doing great.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Give me a very short, punchy (max 15 words) motivational quote specific to the habit "${habitTitle}" and a current streak of ${currentStreak} days.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Consistency is key. Keep the flame alive!";
  }
};

export const refineNoteContent = async (content: string, instruction: string): Promise<string> => {
  if (!ai) return content;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following note content based on this instruction: "${instruction}".\n\nNote Content:\n${content}`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return content;
  }
};