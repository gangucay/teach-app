
import { GoogleGenAI, Type } from "@google/genai";
import type { Classroom, Student } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using mock data.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "mock_key" });

const MOCK_DATA: Classroom[] = [
    {
        id: "c1", name: "Lớp 10A1", schedule: "Thứ 2, 4, 6 - 7:00 AM",
        students: [
            { id: "s1", name: "Nguyễn Văn An", generalNotes: "", attendance: [] },
            { id: "s2", name: "Trần Thị Bình", generalNotes: "", attendance: [] },
            { id: "s3", name: "Lê Văn Cường", generalNotes: "", attendance: [{id: "a1", date: "2024-05-20", note: "Vắng có phép"}]}
        ]
    },
    {
        id: "c2", name: "Lớp 11B2", schedule: "Thứ 3, 5, 7 - 1:00 PM",
        students: [
            { id: "s4", name: "Phạm Thị Dung", generalNotes: "Năng nổ", attendance: [] },
            { id: "s5", name: "Hoàng Văn Em", generalNotes: "", attendance: [] }
        ]
    }
];

export const generateInitialData = async (): Promise<Classroom[]> => {
  if (!process.env.API_KEY) {
    return MOCK_DATA;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Create a JSON array of 3 fictional Vietnamese classrooms for a student attendance app. Each classroom should have a `name`, a `schedule` (e.g., 'Mon, Wed, Fri - 8:00 AM'), and an array of 10-15 `students`. Each student should have only a Vietnamese `name`. The output must be only the raw JSON array, with no surrounding text or markdown.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              schedule: { type: Type.STRING },
              students: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      },
    });

    const jsonText = response.text;
    const generatedClassrooms = JSON.parse(jsonText);

    // Hydrate the generated data with IDs and empty fields
    return generatedClassrooms.map((c: any) => ({
      id: crypto.randomUUID(),
      name: c.name,
      schedule: c.schedule,
      students: c.students.map((s: any) => ({
        id: crypto.randomUUID(),
        name: s.name,
        generalNotes: "",
        attendance: [],
      })),
    }));
  } catch (error) {
    console.error("Failed to generate data with Gemini, using mock data.", error);
    return MOCK_DATA;
  }
};
