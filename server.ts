import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini AI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment.");
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Chat Endpoint for Exam Tutor
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, category, subject, userGoal, mode } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const ai = getGenAI();

    const systemInstruction = `คุณคือ "AI Exam Coach" สุดยอดติวเตอร์อัจฉริยะภาษาไทยที่เชี่ยวชาญการเตรียมสอบระบบ TCAS ได้แก่ TGAT (TGAT1 การสื่อสารภาษาอังกฤษ, TGAT2 การคิดอย่างมีเหตุผล, TGAT3 สมรรถนะการทำงานในอนาคต), TPAT (TPAT1 กสพท/แพทย์, TPAT2 ศิลป์, TPAT3 วิศวะ/วิทยาศาสตร์, TPAT4 สถาปัตย์, TPAT5 ครู), A-Level (คณิต 1, คณิต 2, ฟิสิกส์, เคมี, ชีววิทยา, ภาษาไทย, สังคม, ภาษาอังกฤษ ฯลฯ), O-NET และข้อสอบโรงเรียน (ม.4-ม.6)

บริบทการติวปัจจุบัน:
- กลุ่มข้อสอบ: ${category || "ข้อสอบทั่วไป"}
- รายวิชา/หัวข้อ: ${subject || "ไม่ระบุ"}
- เป้าหมายของผู้เรียน: ${userGoal ? JSON.stringify(userGoal) : "เตรียมสอบเพื่อทำคะแนนสูงสุด"}
- โหมดการสอน: ${mode || "ติวเตอร์เจาะลึก (Step-by-step)"}

แนวทางการตอบ:
1. ตอบเป็นภาษาไทยอย่างสุภาพ เป็นกันเอง ให้กำลังใจสูง ชัดเจน แม่นยำตามหลักสูตร สสวท. และ Blueprint ของ ทปอ. (TCAS) ล่าสุด
2. ใช้โครงสร้าง Markdown สวยงาม มีการใช้ตัวหนา, ข้อย่อย, ตาราง, หรือกล่องข้อความสรุปสูตร/เทคนิค
3. ถ้าเป็นโจทย์คำนวณหรือตรรกะ ให้อธิบายทีละขั้นตอน (Step-by-Step) เผยให้เห็นเทคนิคตัดช้อยส์และจุดที่เด็กนักเรียนชอบโดนหลอกบ่อยๆ
4. ในตอนท้ายของคำตอบ ให้แนะนำ 3 คำถามหรือโจทย์ฝึกหัดที่ต่อเนื่องในรูปแบบ JSON array หรือ bullet ให้ผู้เรียนกดถามต่อได้ง่าย

ส่งมอบคำตอบที่เป็นประโยชน์สูงสุดและช่วยให้ผู้เรียนเข้าใจอย่างแท้จริง`;

    // Convert messages for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
    res.json({ reply });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: error.message || "เกิดข้อผิดพลาดในการประมวลผลของ AI Chatbot",
    });
  }
});

// 2. AI Exam Generator Endpoint
app.post("/api/generate-exam", async (req, res) => {
  try {
    const { category, subject, topic, difficulty, questionCount = 5 } = req.body;

    const ai = getGenAI();

    const count = Math.min(Math.max(Number(questionCount) || 5, 1), 15);

    const prompt = `จงสร้างชุดข้อสอบจำลองภาษาไทยสำหรับการเตรียมสอบ TCAS / โรงเรียน ดังนี้:
- ประเภทข้อสอบ: ${category} (เช่น TGAT1, TGAT2, TGAT3, TPAT1, TPAT3, TPAT5, A-Level, O-NET, ข้อสอบโรงเรียน)
- วิชา/พาร์ท: ${subject}
- หัวข้อย่อยเจาะจง: ${topic || "ครอบคลุมทุกหัวข้อหลักตาม Test Blueprint"}
- ระดับความยาก: ${difficulty || "ปานกลาง (เหมือนข้อสอบจริง)"}
- จำนวนข้อที่ต้องการ: ${count} ข้อ

ข้อกำหนดของข้อสอบ:
1. แต่ละข้อต้องเป็นโจทย์ปรนัย 4 หรือ 5 ตัวเลือก (ตามมาตรฐานข้อสอบจริงของวิชานั้นๆ เช่น TGAT2 มี 5 ช้อยส์, TGAT1 มี 4 ช้อยส์)
2. คำถามต้องสมจริง มีคุณภาพ สอดคล้องกับแนวข้อสอบจริงของ ทปอ. (Test Blueprint ปีล่าสุด)
3. มีเฉลยที่ถูกต้องชัดเจน (correctOptionIndex: 0 สำหรับข้อ 1, 1 สำหรับข้อ 2 ฯลฯ)
4. มีคำอธิบายเฉลยอย่างละเอียด (explanation) ว่าทำไมตัวเลือกนี้ถึงถูก และตัวเลือกอื่นผิดตรงไหน
5. ระบุหัวข้อย่อย (subtopic) และระดับความยาก (difficulty) ของข้อนั้น`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "ชื่อชุดข้อสอบ" },
            category: { type: Type.STRING, description: "ประเภทข้อสอบ" },
            subject: { type: Type.STRING, description: "ชื่อวิชา" },
            description: { type: Type.STRING, description: "คำอธิบายชุดข้อสอบและเกณฑ์การให้คะแนน" },
            timeLimitMinutes: { type: Type.INTEGER, description: "เวลาในการทำข้อสอบ (นาที)" },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "รหัสข้อ เช่น q1, q2" },
                  questionText: { type: Type.STRING, description: "เนื้อหาโจทย์ข้อสอบ" },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "รายการตัวเลือก ก, ข, ค, ง หรือ 1, 2, 3, 4, 5",
                  },
                  correctOptionIndex: {
                    type: Type.INTEGER,
                    description: "index ของตัวเลือกที่ถูกต้อง (เริ่มจาก 0)",
                  },
                  explanation: {
                    type: Type.STRING,
                    description: "คำอธิบายเฉลยอย่างละเอียด วิธีคิด เทคนิค และเหตุผล",
                  },
                  subtopic: { type: Type.STRING, description: "หัวข้อย่อยของโจทย์ข้อนี้" },
                  difficulty: { type: Type.STRING, description: "ง่าย / ปานกลาง / ยาก" },
                },
                required: ["id", "questionText", "options", "correctOptionIndex", "explanation"],
              },
            },
          },
          required: ["title", "category", "subject", "timeLimitMinutes", "questions"],
        },
      },
    });

    const rawText = response.text || "{}";
    const examData = JSON.parse(rawText);
    res.json(examData);
  } catch (error: any) {
    console.error("Generate exam error:", error);
    res.status(500).json({
      error: error.message || "เกิดข้อผิดพลาดในการสร้างข้อสอบด้วย AI",
    });
  }
});

// 3. AI Performance Analysis Endpoint
app.post("/api/analyze-performance", async (req, res) => {
  try {
    const { profile, history } = req.body;

    const ai = getGenAI();

    const prompt = `วิเคราะห์ผลการทำข้อสอบและความพร้อมของผู้เรียน สำหรับเตรียมสอบเข้ามหาวิทยาลัย / โรงเรียน:
ข้อมูลโปรไฟล์ผู้เรียน:
${JSON.stringify(profile || {}, null, 2)}

ประวัติการทำข้อสอบที่ผ่านมา:
${JSON.stringify(history || [], null, 2)}

จงวิเคราะห์ข้อมูลเชิงลึก:
1. ดัชนีความพร้อมรวม (readinessScore 0-100)
2. สรุปภาพรวมและประเมินโอกาสสอบติดคณะ/เป้าหมาย (overview)
3. รายการจุดแข็งเด่นชัด (strengths)
4. รายการจุดอ่อนที่ต้องเร่งแก้ไขด่วน (weaknesses)
5. แผนการอ่านหนังสือและการฝึกฝน 7 วัน (weeklyPlan)
6. เทคนิคเฉพาะวิชาสำหรับเตรียมสอบ (tips)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readinessScore: { type: Type.INTEGER, description: "คะแนนความพร้อม 0-100" },
            estimatedPercentile: { type: Type.STRING, description: "เปอร์เซ็นต์ไทล์คาดการณ์ เช่น Top 15%" },
            overview: { type: Type.STRING, description: "สรุปภาพรวมผลการประเมิน" },
            targetFacultyFeedback: { type: Type.STRING, description: "ข้อคิดเห็นเกี่ยวกับโอกาสติดคณะเป้าหมาย" },
            strengths: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  detail: { type: Type.STRING },
                },
                required: ["topic", "detail"],
              },
            },
            weaknesses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  detail: { type: Type.STRING },
                  priority: { type: Type.STRING, description: "สูง / ปานกลาง / ต่ำ" },
                },
                required: ["topic", "detail", "priority"],
              },
            },
            weeklyPlan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "เช่น วันที่ 1-2 หรือ วันจันทร์" },
                  focus: { type: Type.STRING, description: "วิชาหรือเรื่องที่ต้องเน้น" },
                  action: { type: Type.STRING, description: "กิจกรรมที่ต้องทำ เช่น ทำโจทย์ 20 ข้อ" },
                },
                required: ["day", "focus", "action"],
              },
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["readinessScore", "overview", "strengths", "weaknesses", "weeklyPlan", "tips"],
        },
      },
    });

    const rawText = response.text || "{}";
    const analysisData = JSON.parse(rawText);
    res.json(analysisData);
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: error.message || "เกิดข้อผิดพลาดในการวิเคราะห์ผลการเรียน",
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Exam Coach Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
