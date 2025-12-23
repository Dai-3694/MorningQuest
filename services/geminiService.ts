import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskIcon, TaskType, MissionLog } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSchedule = async (promptText: string): Promise<Task[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

export const generateRewardComment = async (childName: string, logs: MissionLog[]): Promise<string> => {
  try {
    // 最近の10件の実績を分析対象にする
    const recentLogs = logs.slice(-10);
    const successCount = recentLogs.filter(l => l.isSuccess).length;

    // スピード改善の傾向があるかチェック
    const avgScheduled = recentLogs.reduce((acc, l) => acc + l.totalDurationSeconds, 0) / recentLogs.length;
    const avgActual = recentLogs.reduce((acc, l) => acc + (l.actualDurationSeconds || l.totalDurationSeconds), 0) / recentLogs.length;
    const isFaster = avgActual < avgScheduled;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        あなたは子供を励ます優しいコーチです。
        名前: ${childName}
        最近の10日間の実績:
        - 成功率: ${successCount}/10
        - 平均予定時間: ${Math.round(avgScheduled / 60)}分
        - 平均実績時間: ${Math.round(avgActual / 60)}分
        - 傾向: ${isFaster ? '予定より早く終わることが多い' : 'じっくり取り組んでいる'}

        この実績に基づいて、子供が明日からもまた頑張りたくなるような、具体的で心のこもった褒め言葉（100文字程度）を日本語で生成してください。
        「〜だよ」「〜だね」といった親しみやすい口調でお願いします。
      `
    });

    return response.text || "いつも頑張っているね！これからも応援しているよ！";
  } catch (error) {
    console.error("Gemini Reward Comment Error:", error);
    return "10回達成おめでとう！毎日の積み重ねが素晴らしいよ！";
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