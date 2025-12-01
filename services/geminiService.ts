import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskIcon, TaskType } from '../types';

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
      Assign a type to each task:
      - 'start': The first task (usually waking up)
      - 'flexible': Tasks that can be done in any order (most tasks)
      - 'end': The final task (usually leaving the house)
      There should be exactly one 'start' task and one 'end' task.`,
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
              color: { type: Type.STRING, description: "Hex color code" },
              type: { type: Type.STRING, description: "Task type: 'start', 'flexible', or 'end'" }
            },
            required: ["title", "durationMinutes", "icon", "color", "type"]
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
      color: t.color,
      type: mapStringToTaskType(t.type)
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

function mapStringToTaskType(typeStr: string): TaskType {
  const validTypes: TaskType[] = ['start', 'flexible', 'end'];
  if (validTypes.includes(typeStr as TaskType)) {
    return typeStr as TaskType;
  }
  return 'flexible'; // Default to flexible if invalid
}