import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskIcon } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSchedule = async (promptText: string): Promise<Task[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a morning routine schedule for a child based on this request: "${promptText}". 
      Break it down into actionable steps.
      Assign a relevant icon from this list: [sun, toothbrush, shirt, utensils, backpack, door-open, book, gamepad, circle].
      Assign a friendly color hex code (pastel or bright).
      Ensure the total duration matches reasonable expectations.
      The final step should usually be leaving the house.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short task name in Japanese" },
              durationMinutes: { type: Type.NUMBER, description: "Duration in minutes" },
              icon: { type: Type.STRING, description: "One of the allowed icon strings" },
              color: { type: Type.STRING, description: "Hex color code" }
            },
            required: ["title", "durationMinutes", "icon", "color"]
          }
        }
      }
    });

    const rawTasks = JSON.parse(response.text || "[]");
    
    // Map to internal Task type with IDs
    return rawTasks.map((t: any, index: number) => ({
      id: `gen-${Date.now()}-${index}`,
      title: t.title,
      durationMinutes: t.durationMinutes,
      icon: mapStringToEnum(t.icon),
      color: t.color
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("スケジュールの作成に失敗しました。");
  }
};

function mapStringToEnum(iconStr: string): TaskIcon {
  const values = Object.values(TaskIcon);
  if (values.includes(iconStr as TaskIcon)) {
    return iconStr as TaskIcon;
  }
  return TaskIcon.DEFAULT;
}