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

// 1. AI Chat Endpoint for Exam Tutor & Interactive Multi-turn Study Buddy
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages,
      category,
      subject,
      gradeLevel,
      userGoal,
      tutorMode = "socratic",
      selectedLesson,
      recentExamHistory,
      image,
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const ai = getGenAI();

    // Student Profile & Target Context
    const studentName = userGoal?.name || "ผู้เรียน";
    const studentGrade = userGoal?.gradeLevel || gradeLevel || "มัธยมศึกษา";
    const dreamTarget = userGoal?.dreamFaculty
      ? `${userGoal.dreamFaculty} ${userGoal.dreamUniversity || ""}`
      : "สอบเข้ามหาวิทยาลัย / พัฒนาผลการเรียน";
    const currentSubject = subject || category || "ทั่วไป";
    const currentLesson = selectedLesson || "ตามบริบทบทสนทนา";

    // Recent Exam Context (if provided)
    let historyContext = "";
    if (Array.isArray(recentExamHistory) && recentExamHistory.length > 0) {
      const topRecent = recentExamHistory.slice(0, 3).map((h: any) =>
        `- วิชา: ${h.subject || h.title} | คะแนน: ${h.score}/${h.totalQuestions} (${h.percentage}%)`
      ).join("\n");
      historyContext = `\nประวัติการทำข้อสอบล่าสุดของผู้เรียน:\n${topRecent}\n`;
    }

    const systemInstruction = `คุณคือ "AI Study Buddy" สุดยอดผู้ช่วยเรียนรู้และติวเตอร์ส่วนตัวอัจฉริยะภาษาไทย (Smart Interactive Socratic Tutor) ประจำระบบ AI Study Buddy

=== ข้อมูลและบริบทของผู้เรียนในปัจจุบัน ===
- ชื่อผู้เรียน: ${studentName}
- ระดับชั้นปัจจุบัน: ${studentGrade}
- คณะ/เป้าหมายในฝัน: ${dreamTarget}
- วิชา/หมวดหมู่ที่กำลังติว: ${currentSubject}
- บทเรียนที่กำลังศึกษา: ${currentLesson}
- โหมดการติว (Tutor Mode): ${tutorMode === "socratic" ? "เน้นชวนคิดทีละขั้นตอน (Socratic Interactive)" : tutorMode === "quick_solution" ? "เน้นเฉลยและวิธีลัด (Quick Solution)" : "อธิบายละเอียดครอบคลุม (Comprehensive Step-by-Step)"}
${historyContext}

=== กฎเหล็กการสนทนาแบบต่อเนื่องหลายรอบ (MULTI-TURN CONVERSATION & CONTEXT MEMORY) ===
1. **จดจำบริบทของการสนทนาทั้งหมดอย่างสมบูรณ์ (Continuous Context Memory):**
   - ผู้ใช้กำลังสนทนาต่อเนื่องในห้องแชตนี้ AI ต้องเชื่อมโยงเนื้อหา คำถาม โจทย์ และสูตรที่คุยกันในข้อความก่อนหน้าทั้งหมด
   - เข้าใจคำถามต่อเนื่องทันที เช่น “แล้วข้อนี้ล่ะ?”, “ทำไมถึงได้คำตอบนี้?”, “สูตรนี้มาจากไหน?”, “แล้วถ้าเปลี่ยนตัวเลขเป็น 10 ล่ะ?”, “ขอโจทย์เรื่องนี้อีกข้อ”, “อธิบายขั้นที่ 2 ให้ฟังอีกรอบ”, “ต่อเลย”, “ยังไม่เข้าใจตรงนี้” โดยไม่ต้องให้ผู้ใช้พิมพ์โจทย์หรือคำถามเดิมซ้ำ
2. **การตอบสนองเมื่อผู้ใช้ตอบคำถามของ AI (Build upon User Answers):**
   - หากผู้ใช้พิมพ์ตอบคำตอบสั้นๆ (เช่น “2”, “ใช้กฎข้อที่สองของนิวตัน”, “$\\sin(30^\\circ)$”, “เพราะความดันสูงกว่า”) ให้รับรู้ทันทีว่าเป็นคำตอบของคำถามตรวจความเข้าใจที่ AI เพิ่งถามไป
   - นำคำตอบนั้นมาประเมินทันที:
     * หากตอบถูกต้อง: ชมเชยและพาไปสู่ขั้นตอนถัดไปทันที
     * หากตอบผิดหรือคลาดเคลื่อน: ชี้แจงด้วยน้ำเสียงอบอุ่น ให้กำลังใจ อธิบายจุดที่เข้าใจผิด และชวนให้ลองคิดใหม่อีกครั้ง
3. **การถามย้อนกลับเพื่อขอข้อมูลเพิ่มเติม (Clarification Before Answering):**
   - หากผู้ใช้ถามคำถามที่ข้อมูลไม่ครบถ้วน (เช่น “ข้อ 1 ตอบอะไร” แต่ยังไม่ได้ส่งโจทย์มา หรือ “ช่วยคิดหน่อย” โดยไม่มีตัวเลข) ให้ถามขอโจทย์ ตัวเลือก หรือรูปภาพอย่างสุภาพและชัดเจนก่อนตอบ

=== พฤติกรรมติวเตอร์อัจฉริยะ (TUTOR MODE & SOCRATIC PEDAGOGY) ===
1. **อธิบายทีละขั้นตอน (Step-by-Step Guidance):**
   - เรียบเรียงวิธีคิดเป็นขั้นตอนที่ 1, 2, 3 ชัดเจน ไม่ข้ามขั้นตอน ชี้จุดสังเกตสำคัญและสิ่งที่โจทย์บอก
2. **ไม่เฉลยคำตอบสุดท้ายทันทีถ้าผู้เรียนกำลังฝึกทำโจทย์:**
   - ให้คำใบ้ (Hints), สูตรที่เกี่ยวข้อง, หรือแนวทางตั้งสมการก่อน แล้วชวนให้ผู้เรียนลองคำนวณขั้นสุดท้ายด้วยตัวเอง (เว้นแต่ผู้ใช้จะระบุชัดเจนว่า "ขอเฉลยเต็ม", "เฉลยให้ดูหน่อย", "ขอคำตอบเลย")
3. **ถามคำถามสั้นๆ เพื่อตรวจความเข้าใจ (Check for Understanding):**
   - ปิดท้ายคำอธิบายด้วยคำถามสั้นๆ ชวนคิด 1 คำถาม หรือคำถามปลายเปิด เพื่อเช็คว่าผู้เรียนเข้าใจจริงไหม
4. **ปรับระดับความลึกและภาษาตามระดับชั้น:**
   - ประถม (ป.1-ป.6): ภาษาง่าย เป็นกันเอง มีตัวอย่างเปรียบเทียบในชีวิตประจำวัน
   - ม.ต้น (ม.1-ม.3): อธิบายหลักการเบื้องต้น เชื่อมโยงสูตรพื้นฐาน
   - ม.ปลาย (ม.4-ม.6 / TGAT / TPAT / A-Level): เจาะลึกทฤษฎี เทคนิคตัดช้อยส์ จุดที่ข้อสอบชอบลวง (Common Traps) และสูตรลัด

=== กฎเหล็กการแสดงผลสัญลักษณ์และสมการคณิตศาสตร์/วิทยาศาสตร์ (MATHEMATICAL NOTATION & LATEX) ===
- ทุกสูตร ตัวแปร สมการ และสัญลักษณ์ทางคณิตศาสตร์/วิทยาศาสตร์ ต้องเขียนด้วยสัญกรณ์ LaTeX เสมอ:
  * แบบ Inline: ครอบด้วย $ เช่น $\\pi$, $\\sqrt{x}$, $x^2$, $\\frac{a}{b}$, $\\sin \\theta$, $\\cos \\theta$, $\\sum_{i=1}^n$, $\\int$, $\\le$, $\\ge$, $\\ne$, $\\approx$, $90^\\circ$, $\\pm$, $\\times$, $\\Delta t$, $58.5\\text{ g/mol}$
  * แบบ Block/Display: ครอบด้วย $$...$$ เช่น $$\\Sigma F = ma$$, $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
- **ห้ามเขียนเป็นโค้ดคอมพิวเตอร์ดิบ** เช่น ห้ามเขียน 'sqrt(x)', 'x^2', 'a/b', 'sin(x)', 'pi'

=== ผลลัพธ์ที่ต้องส่งกลับ (JSON FORMAT) ===
ต้องส่งออกผลลัพธ์เป็น JSON Object ที่มี 2 ฟิลด์เสมอ:
1. "reply": ข้อความคำตอบของ AI Study Buddy ในรูปแบบ Markdown และ LaTeX ที่สมบูรณ์ สุภาพ ให้กำลังใจ และมีขั้นตอนชัดเจน
2. "suggestedQuestions": อาร์เรย์ของคำถามหรือทางเลือกต่อเนื่อง 3-4 ข้อ ที่ตรงกับบริบทของบทเรียนที่กำลังคุยกัน เพื่อให้ผู้เรียนคลิกถามต่อได้สะดวก`;

    // 1. Sanitize & Filter messages (Exclude previous error bubbles from history)
    const cleanMessages = messages.filter(
      (m: any) =>
        m &&
        typeof m.content === "string" &&
        m.content.trim().length > 0 &&
        !m.isError &&
        !m.content.startsWith("⚠️")
    );

    // 2. Multi-turn rules for Gemini API:
    //    - The first content item MUST have role: "user"
    //    - Roles must strictly alternate (user -> model -> user -> model)
    //    Find the first user message index to skip leading model welcome messages
    const firstUserIndex = cleanMessages.findIndex((m: any) => m.role === "user");
    let turnsToProcess =
      firstUserIndex !== -1 ? cleanMessages.slice(firstUserIndex) : [];

    if (turnsToProcess.length === 0) {
      turnsToProcess = [{ role: "user", content: "สวัสดีครับ ช่วยสอนบทเรียนหน่อย" }];
    }

    // Keep up to 20 most recent messages if history gets very long
    if (turnsToProcess.length > 20) {
      turnsToProcess = turnsToProcess.slice(-20);
      // Ensure it still starts with user
      if (turnsToProcess[0].role !== "user") {
        turnsToProcess = turnsToProcess.slice(1);
      }
    }

    // 3. Convert to Gemini contents structure with alternating roles & merged consecutive same-role parts
    const contents: Array<{ role: "user" | "model"; parts: any[] }> = [];

    for (let i = 0; i < turnsToProcess.length; i++) {
      const currentMsg = turnsToProcess[i];
      const role: "user" | "model" = currentMsg.role === "user" ? "user" : "model";
      const textContent = currentMsg.content.trim();
      const isLastMessage = i === turnsToProcess.length - 1;

      const currentParts: any[] = [];
      // Attach image to the latest user message if available
      if (isLastMessage && image && image.data && image.mimeType) {
        currentParts.push({
          inlineData: {
            mimeType: image.mimeType,
            data: image.data,
          },
        });
      }

      if (textContent) {
        currentParts.push({ text: textContent });
      }

      if (currentParts.length === 0) continue;

      const prevTurn = contents[contents.length - 1];
      if (prevTurn && prevTurn.role === role) {
        // Merge into previous turn of same role to maintain strict alternation
        prevTurn.parts.push(...currentParts);
      } else {
        contents.push({
          role,
          parts: currentParts,
        });
      }
    }

    // Double check: ensure first turn is "user"
    if (contents.length === 0 || contents[0].role !== "user") {
      contents.unshift({
        role: "user",
        parts: [{ text: "สวัสดีครับ เริ่มต้นการเรียนรู้" }],
      });
    }

    // 4. Try supported models: gemini-3.6-flash -> gemini-3.5-flash-lite -> gemini-3.7-flash
    const candidateModels = ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.7-flash"];
    let rawResponseText = "";
    let lastErr: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description:
                    "เนื้อหาคำตอบของ AI Study Buddy ในรูปแบบ Markdown และ LaTeX ที่สมบูรณ์ สุภาพ เข้าใจง่าย มีขั้นตอนชัดเจน",
                },
                suggestedQuestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    "คำถามหรือตัวเลือกที่ผู้เรียนน่าจะอยากถามต่อ 3-4 ข้อ ที่เกี่ยวข้องกับเรื่องที่เพิ่งคุยกัน",
                },
              },
              required: ["reply", "suggestedQuestions"],
            },
            temperature: 0.7,
          },
        });

        if (response.text) {
          rawResponseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Attempt with ${modelName} with json schema failed, trying next:`, err.message || err);
        lastErr = err;
      }
    }

    // Fallback: If structured response failed, try plain text generation
    if (!rawResponseText) {
      for (const fallbackModel of ["gemini-3.6-flash", "gemini-3.5-flash-lite"]) {
        try {
          const plainResponse = await ai.models.generateContent({
            model: fallbackModel,
            contents: contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          if (plainResponse.text) {
            rawResponseText = plainResponse.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Plain fallback with ${fallbackModel} failed:`, err.message || err);
          lastErr = err;
        }
      }
    }

    if (!rawResponseText) {
      throw lastErr || new Error("AI service temporary unavailable");
    }

    let parsedData: { reply: string; suggestedQuestions: string[] };

    try {
      parsedData = JSON.parse(rawResponseText);
      if (!parsedData.reply) {
        parsedData.reply = rawResponseText;
      }
      if (!Array.isArray(parsedData.suggestedQuestions) || parsedData.suggestedQuestions.length === 0) {
        parsedData.suggestedQuestions = [
          "ขอโจทย์ฝึกทำเรื่องนี้เพิ่ม 1 ข้อ",
          "ทำไมถึงใช้สูตรนี้?",
          "ช่วยอธิบายตรงนี้ให้ละเอียดขึ้นหน่อย",
        ];
      }
    } catch {
      parsedData = {
        reply: rawResponseText,
        suggestedQuestions: [
          "ขอโจทย์ฝึกทำเรื่องนี้เพิ่ม 1 ข้อ",
          "ทำไมถึงใช้สูตรนี้?",
          "ช่วยอธิบายตรงนี้ให้ละเอียดขึ้นหน่อย",
        ],
      };
    }

    res.json({
      reply: parsedData.reply,
      suggestedQuestions: parsedData.suggestedQuestions,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: "ระบบ AI ขัดข้องชั่วคราว กรุณาลองส่งข้อความอีกครั้ง",
      details: error.message,
    });
  }
});

// 2. AI Exam Generator Endpoint with 3-Phase Planning, Topic Distribution, Multi-Round Anti-Repetition, and LaTeX Math
app.post("/api/generate-exam", async (req, res) => {
  try {
    const {
      gradeLevel = "ม.6",
      subjectCategory = "วิชาพื้นฐาน",
      subject = "คณิตศาสตร์",
      lesson = "",
      topic = "",
      subtopic = "",
      category = "School",
      difficulty = "ปานกลาง",
      questionCount = 5,
      recentQuestions = [],
    } = req.body;

    const ai = getGenAI();
    const count = Math.min(Math.max(Number(questionCount) || 5, 1), 15);

    // Build Recent Questions / Recency Penalty Section with Spaced Repetition Logic
    let recentQuestionsContext = "";
    if (Array.isArray(recentQuestions) && recentQuestions.length > 0) {
      const formattedRecent = recentQuestions
        .slice(0, 30)
        .map((rq: any, idx: number) => {
          const text = typeof rq === "string" ? rq : rq.questionText || "";
          const rank = typeof rq === "object" && rq.recencyRank ? `[รอบที่เพิ่งทำล่าสุด Rank ${rq.recencyRank}]` : "";
          const topicInfo = typeof rq === "object" && rq.topic ? ` (${rq.topic})` : "";
          return `${idx + 1}. ${rank}${topicInfo} "${text}"`;
        })
        .join("\n");

      recentQuestionsContext = `
=== ประวัติข้อสอบที่ผู้ใช้เคยได้รับในรอบก่อนหน้า (HISTORICAL QUESTIONS & RECENCY PENALTY) ===
รายการข้อสอบที่ผู้ใช้เคยได้รับมาแล้วในรอบก่อน ๆ:
${formattedRecent}

=== กลยุทธ์การสุ่มข้อสอบและการป้องกันการออกซ้ำข้ามรอบ (MULTI-ROUND DIVERSIFICATION & ANTI-REPETITION STRATEGY) ===
1. 🔴 **ข้อหรือแนวโจทย์ที่เพิ่งออกล่าสุด (Rank 1 - รอบที่เพิ่งออกไปล่าสุด):**
   - **หลีกเลี่ยงมากที่สุด (Strong Avoidance - โอกาส 0%):** ห้ามนำโจทย์เดิมหรือแนวโจทย์เดิมจากรอบล่าสุดมาออกซ้ำติดกันเด็ดขาด
2. 🟠 **ข้อที่เคยออกใน 2-3 รอบก่อนหน้า (Rank 2-3):**
   - **ลดโอกาสถูกเลือกให้น้อยที่สุด (Low Probability 5%):** หลีกเลี่ยงเพื่อไม่ให้ผู้ใช้รู้สึกซ้ำซาก
3. 🟢 **ข้อที่เคยออกมานานแล้ว (Rank > 3 หรือมากกว่า 4 รอบที่แล้ว):**
   - **สามารถนำกลับมาออกได้ "เป็นบางครั้ง" (Spaced Repetition Review ประมาณ 10-15% ของชุดข้อสอบ):** เพื่อใช้ทบทวนความรู้ แต่ต้องปรับเปลี่ยนสถานการณ์หรือบริบทให้มีมิติใหม่
4. ⭐️ **แนวโจทย์ / หัวข้อย่อย / มิติการคิด / สถานการณ์ใหม่ที่ยังไม่เคยออก:**
   - **ให้ความสำคัญสูงสุด (Highest Priority - 85-90% ของชุดข้อสอบ):** ต้องเลือกโจทย์ใหม่ที่ยังไม่เคยออกในประวัติก่อนเสมอ
5. 🔄 **ไม่ใช่แค่เปลี่ยนตัวเลขแล้วถือว่าเป็นข้อสอบใหม่:**
   - ต้องเปลี่ยน "รูปแบบ", "วิธีคิด", หรือ "สถานการณ์" ของโจทย์ด้วย เช่น:
     * เปลี่ยนแนวทางแก้ปัญหา (เช่น จากหาค่าตรงๆ -> โจทย์ประยุกต์ชีวิตจริง -> การวิเคราะห์เงื่อนไข/ช่วงคำตอบ -> การแก้สมการหลายขั้นตอน)
     * สลับสิ่งที่โจทย์กำหนด (Given) และสิ่งที่ต้องการหา (Target)
     * เปลี่ยนรูปทรงเรขาคณิต ฟังก์ชัน หรือความสัมพันธ์
*เป้าหมายหลัก:*
- รอบที่ 1 → ข้อสอบชุดหนึ่ง
- รอบที่ 2 → ควรได้ข้อสอบส่วนใหญ่ที่แตกต่างจากรอบแรก
- รอบที่ 3 → ควรแตกต่างจากรอบก่อน ๆ
- เมื่อสร้างหลายรอบ สามารถนำข้อเก่ากลับมาได้ "เป็นบางครั้ง" เพื่อทบทวน
`;
    }

    // Deep Subject Nature Rules for prompt customization
    const subjectPromptRules = `
=== กฎเหล็กประจำวิชาและธรรมชาติของเนื้อหา (STRICT SUBJECT NATURE RULES) ===
1. 【คณิตศาสตร์ / TGAT 2 การคิดอย่างมีเหตุผล / A-Level คณิต 1, 2 / TPAT 3 พาร์ทคำนวณ】:
   - **หัวใจหลัก:** ข้อสอบต้องเป็น "โจทย์คำนวณและการแก้ปัญหา (Numerical Calculation & Problem Solving)"
   - **องค์ประกอบบังคับ:** ต้องมีตัวเลข, ตัวแปร, สมการ, สูตร, การคำนวณ, และการวิเคราะห์หาคำตอบเชิงตัวเลข/พีชคณิต
   - **ห้ามเป็นคำถามทฤษฎีล้วน:** ห้ามถามนิยามหรือความหมาย เช่น "ข้อใดคือความหมายของ...", "สูตรนี้ใช้ทำอะไร" (ต้องเป็นโจทย์แก้ปัญหาจริง)
   - **การกระจายหัวข้อ (ตัวอย่าง เช่น เรื่องตรีโกณมิติ 10 ข้อ):** ต้องกระจายหลากหลายมิติ เช่น
     * คำนวณค่าฟังก์ชันตรีโกณมิติพื้นฐาน / มุมประกอบ ($A+B$)
     * หาความยาวด้าน / สามเหลี่ยมมุมฉาก
     * หามุม หรือ Inverse Trig
     * ใช้สูตรผลคูณเป็นผลบวก / ผลบวกเป็นผลคูณ / มุมสองเท่า
     * วิเคราะห์รูปสามเหลี่ยมใดๆ ด้วยกฎของไซน์ (Law of Sines)
     * การประยุกต์กฎของโคไซน์ (Law of Cosines) ในสถานการณ์จริง
     * โจทย์ประยุกต์ระยะทางและความสูง (Angle of Elevation / Depression)
     * การแก้สมการตรีโกณมิติในช่วง $[0, 2\\pi]$
     * การวิเคราะห์เอกลักษณ์หรือเงื่อนไขตรีโกณมิติ
     * โจทย์หลายขั้นตอน หรือการประยุกต์ฟังก์ชันตรีโกณมิติกับกราฟ/คาบ/แอมพลิจูด
   - **ห้ามออกโจทย์แพทเทิร์นเดียวซ้ำๆ** เช่น ห้ามเป็นหาค่า $\\sin$ อย่างเดียวทุกข้อ

2. 【ฟิสิกส์ / A-Level ฟิสิกส์ / TPAT 3 วิทย์กายภาพ】:
   - **หัวใจหลัก:** เน้นโจทย์คำนวณ ใช้สูตร วิเคราะห์แรง การเคลื่อนที่ กราฟ หน่วย และสถานการณ์จริง
   - **องค์ประกอบ:** การแทนค่าตัวแปรในสูตรฟิสิกส์, ระบุค่าและหน่วยที่ชัดเจน ($\\text{m/s}$, $\\text{m/s}^2$, $\\text{N}$, $\\text{J}$, $\\text{W}$, $\\text{Pa}$, $\\text{T}$, $\\text{V}$, $\\text{A}$, $\\text{Hz}$), กราฟการเคลื่อนที่ ($s-t, v-t$), งาน-พลังงาน, โมเมนตัม, สนามแม่เหล็ก/ไฟฟ้า, คลื่น

3. 【เคมี / A-Level เคมี】:
   - **หัวใจหลัก:** เหมาะกับหัวข้อที่เลือกอย่างเคร่งครัด
   - **องค์ประกอบ:** การคำนวณโมล, มวลสาร, ความเข้มข้นสารละลาย ($\\text{mol/L}$, $\\%\\text{w/w}$), ดุลสมการเคมี, ปริมาณสารสัมพันธ์, กฎของแก๊ส ($PV=nRT$), $\\text{pH}/\\text{pOH}$, ค่าคงที่สมดุล, อัตราปฏิกิริยา, ตารางธาตุและพันธะเคมี

4. 【ชีววิทยา / A-Level ชีววิทยา】:
   - **หัวใจหลัก:** ใช้ทั้งความเข้าใจ วิเคราะห์ เปรียบเทียบ เชื่อมโยงกระบวนการ และสถานการณ์
   - **องค์ประกอบ:** การวิเคราะห์ผลการทดลอง/แผนภาพ, การถ่ายทอดทางพันธุกรรม (Genetics & Punnett Square), กลไกการสังเคราะห์ด้วยแสง, การหายใจระดับเซลล์, สรีรวิทยาของพืชและสัตว์

5. 【ภาษาอังกฤษ / TGAT 1 / A-Level ภาษาอังกฤษ】:
   - **ต้องตรงกับประเภททักษะที่เลือก:**
     - ถ้าเป็น Grammar/โครงสร้าง: Cloze test / Sentence completion วัด Tenses, Conditionals, Relative clauses, Subject-Verb Agreement, Passive voice
     - ถ้าเป็น Vocabulary: Context Clues, Synonyms, Antonyms, Idioms
     - ถ้าเป็น Reading: ต้องมี Passage สั้น 1-2 ย่อหน้าใน questionText แล้วถาม Main Idea / Inferences / Specific Details
     - ถ้าเป็น Conversation/Speaking: สร้างสถานการณ์และบทสนทนาโต้ตอบ (Speaker A & B)

6. 【ภาษาไทย / สังคมศึกษา / A-Level ภาษาไทยและสังคม】:
   - ภาษาไทย: หลักภาษา (ชนิดคำ, โครงสร้างประโยค, การสร้างคำ, เสียงวรรณยุกต์), การอ่านจับใจความ, วรรณคดี
   - สังคมศึกษา: เศรษฐศาสตร์ (กลไกราคา, อุปสงค์-อุปทาน), ประวัติศาสตร์, ภูมิศาสตร์, ศาสนาและหน้าที่พลเมือง ให้มีทั้งความเข้าใจ วิเคราะห์ เปรียบเทียบ ประยุกต์ และสถานการณ์
`;

    const prompt = `คุณคือระบบ AI Exam Generation Engine ขั้นสูงสำหรับหลักสูตรการศึกษาไทย
ภารกิจ: วางแผนและสร้างชุดข้อสอบจำลองภาษาไทยคุณภาพสูง ครอบคลุมเนื้อหา ตรงตามธรรมชาติของวิชา และมีความหลากหลาย ไม่ซ้ำซาก

=== พารามิเตอร์ที่กำหนดโดยผู้ใช้ ===
- ระดับชั้น (Grade Level): ${gradeLevel} (ห้ามนำเนื้อหาของระดับชั้นอื่นมาออก เช่น ม.4 ห้ามออกเนื้อหา ม.5 หรือ ม.6)
- วิชา (Subject): ${subject}
- หมวดวิชา (Subject Category): ${subjectCategory}
- บทเรียนที่เลือก (Lesson): ${lesson || "ตามโครงสร้างหลักสูตร"}
- หัวข้อที่เลือก (Topic): ${topic || "หัวข้อที่เกี่ยวข้อง"}
- หัวข้อย่อย (Subtopic): ${subtopic || "ครอบคลุมทุกหัวข้อย่อย"}
- ประเภทการสอบ / สนามสอบ (Exam Category): ${category}
- ระดับความยากที่เลือก (Difficulty): ${difficulty} *** [สำคัญที่สุด: ต้องสร้างข้อสอบทุกข้อให้ตรงกับนิยามความซับซ้อนของการคิดของระดับ "${difficulty}" 100%] ***
- จำนวนข้อที่ต้องการ: ${count} ข้อ

=== กระบวนการทำงานบังคับก่อนสร้างข้อสอบทุกชุด (MANDATORY 5-STEP GENERATION PIPELINE) ===
AI จะต้องปฏิบัติตามลำดับขั้นตอนนี้อย่างเคร่งครัด:
ขั้นตอนที่ 1 [วิเคราะห์เนื้อหาบทเรียน]: วิเคราะห์บทเรียน "${lesson}" และหัวข้อ "${topic || subtopic || lesson}" ว่ามีองค์ความรู้ สูตร นิยาม และทักษะอะไรบ้าง
ขั้นตอนที่ 2 [สร้างรายการแนวโจทย์ที่เป็นไปได้ (Question Archetypes)]: ระบุแนวโจทย์หลากหลายแบบที่เป็นไปได้ในบทนี้ เช่น:
   1. **คำนวณโดยตรง (Direct Computation):** คำนวณหาค่าตามสูตร/นิยาม
   2. **ประยุกต์ใช้สูตร (Formula Application):** เลือกใช้สูตรที่เหมาะสมกับสถานการณ์
   3. **วิเคราะห์เงื่อนไข (Condition Analysis):** หาขอบเขต คำตอบที่เป็นไปได้ หรือข้อจำกัด
   4. **แก้ปัญหาหลายขั้นตอน (Multi-step Problem Solving):** เชื่อมโยงตัวแปรตัวกลาง
   5. **โจทย์สถานการณ์จริง / ปัญหาประยุกต์ (Real-world Scenario / Applied Problem):** ตีความจากเรื่องราวในชีวิตประจำวัน
   6. **เปรียบเทียบหรือวิเคราะห์สัดส่วน (Comparison & Proportionality):** เปรียบเทียบ 2 สถานการณ์ (ถ้าเปลี่ยนตัวแปรนี้ ค่าจะเปลี่ยนเป็นกี่เท่า)
   7. **โจทย์ย้อนกลับ / ให้ผลลัพธ์หาค่าต้นทาง (Reverse Problem / Backward Reasoning):** กำหนดค่าปลายทาง/ผลลัพธ์ แล้วให้หาตัวแปรเริ่มต้น
   8. **วิเคราะห์กราฟ ตาราง แผนภาพ หรือรูปทรง (Diagram / Graph / Table / Geometry Analysis):** ตีความจากข้อมูลภาพหรือตาราง
   9. **วิเคราะห์ความถูกต้องของข้อความ (True / False Statement Evaluation):** พิจารณาว่าข้อความ ก, ข, ค ข้อใดถูกต้อง
   10. **เชื่อมโยงหลายแนวคิดภายในบท (Cross-concept Linkage):** ผสานมากกว่าหนึ่งหัวข้อย่อย
ขั้นตอนที่ 3 [เลือกและกระจายหลายแนวโจทย์ (Multi-Paradigm Selection)]: สำหรับข้อสอบ ${count} ข้อในชุดนี้ ต้องเลือกแนวโจทย์ที่แตกต่างกันมาผสมผสาน ห้ามใช้แนวโจทย์เดียวกันติดต่อกัน
ขั้นตอนที่ 4 [สร้างข้อสอบตามแนวที่เลือก]: สร้างโจทย์แต่ละข้อให้มีมิติวิธีคิด เอกลักษณ์เฉพาะ และระดับความยาก "${difficulty}"
ขั้นตอนที่ 5 [ตรวจสอบความซ้ำซ้อนและความหลากหลาย (Anti-Pattern Check)]: ตรวจสอบว่าไม่มี 2 ข้อใดในชุดที่คิดด้วยวิธีเดียวกันหรือแค่เปลี่ยนตัวเลข

=== กฎเหล็กความหลากหลายของแนวโจทย์ (STRICT QUESTION PARADIGM & PATTERN DIVERSITY RULES) ===
1. **ห้ามยึดติดกับโจทย์หลักเพียงไม่กี่รูปแบบ (No Monotonous Patterns):**
   - **ห้ามสร้างโจทย์ที่มีโครงสร้างเหมือนกันแล้วเปลี่ยนแค่ตัวเลขหรือตัวแปรเด็ดขาด** (Strictly forbidden from creating cookie-cutter questions where only numbers change).
   - ผู้ใช้ต้องรู้สึกว่าแต่ละข้อ **"ต้องคิดคนละแบบ ใช้ทักษะคนละด้าน"**
2. **การกระจายแนวโจทย์ในชุดเดียวกัน (Intra-set Paradigm Alternation):**
   - ในชุดเดียวกัน ทั้ง ${count} ข้อ **ห้ามใช้แนวโจทย์หรือสูตรเดิมซ้ำติดกันเกิน 1 ข้อ**
   - ต้องสลับสับเปลี่ยนระหว่าง: คำนวณตรง, โจทย์ย้อนกลับ (Reverse), วิเคราะห์เงื่อนไข, ปัญหาประยุกต์สถานการณ์, เปรียบเทียบสัดส่วน, ตีความรูป/ตาราง/ข้อความ
3. **การกระจายหัวข้อย่อย (Subtopic Coverage):**
   - หากบทเรียน "${lesson}" มีหลายหัวข้อย่อย ต้องกระจายข้อสอบให้ครอบคลุมหลายหัวข้อย่อยอย่างทั่วถึง ห้ามกระจุกตัวอยู่เพียงหัวข้อย่อยเดียว
4. **ความหลากหลายของวิชาคำนวณ (คณิตศาสตร์, ฟิสิกส์, เคมี):**
   - *คณิตศาสตร์:* สลับระหว่างโจทย์พีชคณิต/สมการ, เรขาคณิต/ตรีโกณมิติ, โจทย์ประยุกต์คำพูด, โจทย์หาค่าสูงสุด-ต่ำสุด, โจทย์วิเคราะห์ช่วงคำตอบ (Domain/Range/Inequality)
   - *ฟิสิกส์:* สลับระหว่างโจทย์คำนวณตัวเลข, โจทย์สัดส่วน/เปรียบเทียบสองเหตุการณ์ ($F \propto a$), โจทย์สถานการณ์จริง, โจทย์ทฤษฎีบทการอนุรักษ์, โจทย์ย้อนกลับหาความเร็ว/เวลาเริ่มต้น
   - *เคมี:* สลับระหว่างโจทย์ปริมาณสาร, ความเข้มข้น/การเจือจาง, สารกำหนดปริมาณ, ผลได้ร้อยละ, การวิเคราะห์สมบัติสารและการทดลอง
5. **การเปลี่ยนแนวโจทย์ข้ามรอบ (Cross-Round Diversity):**
   - เมื่อผู้ใช้กดสร้างข้อสอบใหม่ ให้เปลี่ยนแนวคิด สถานการณ์ และประเภทคำถามจากรอบที่แล้ว (ดูประวัติข้อสอบล่าสุดด้านล่าง)

=== กรอบนิยามระดับความยากเชิงมิติการคิดและความซับซ้อน (COGNITIVE COMPLEXITY & DIFFICULTY FRAMEWORK) ===
*กฎเหล็กสำคัญที่สุด:*
- **ห้ามทำข้อสอบง่ายโดยลดตัวเลขอย่างเดียว**
- **ห้ามทำข้อสอบยากโดยเพิ่มตัวเลขใหญ่ๆ หรือเลขทศนิยมเยอะๆ อย่างเดียว**
- ความแตกต่างของระดับความยาก **ต้องวัดจาก "ความซับซ้อนของการคิด (Cognitive Complexity & Reasoning Depth)"** เท่านั้น!

1. 🟢 **ระดับ "ง่าย" (Easy - Foundational & Direct Application):**
   - **ลักษณะโจทย์:** วัดความรู้ความเข้าใจพื้นฐานของบทเรียนนั้น (Recall & Direct Concept Application)
   - **วิธีคิดและขั้นตอน:** ใช้วิธีทำตรงไปตรงมา ไม่ซับซ้อน (Single-step or Direct 1-Formula)
   - **การให้ข้อมูล:** โจทย์ให้ตัวแปรต้นครบถ้วน สามารถแทนค่าในสูตรพื้นฐานแล้วหาคำตอบได้โดยตรง
   - **เงื่อนไข:** ไม่มีเงื่อนไขแฝง ไม่มีกับดักซ่อนเร้น
   - **เป้าหมายผู้เรียน:** นักเรียนที่เข้าใจนิยามและสูตรพื้นฐานของบทเรียนต้องสามารถทำได้อย่างมั่นใจ
   - **ตัวอย่าง:**
     * *คณิตศาสตร์:* กำหนดด้านประกอบมุมฉาก 2 ด้าน ถามหาด้านตรงข้ามมุมฉากตรงๆ หรือ คำนวณค่า $\sin(30^\circ) + \cos(60^\circ)$
     * *ฟิสิกส์:* กำหนดมวล $m$ และความเร่ง $a$ ถามหาแรงลัพธ์ $F = ma$ โดยตรง
     * *เคมี:* คำนวณโมลจากมวลและมวลโมเลกุลที่กำหนด $n = \frac{g}{M_w}$ ตรงๆ

2. 🟡 **ระดับ "ปานกลาง" (Medium - Applied Concept & Multi-Step Reasoning):**
   - **ลักษณะโจทย์:** ต้องประยุกต์ใช้ความรู้ และเชื่อมโยงความเข้าใจ (Application & Strategic Selection)
   - **วิธีคิดและขั้นตอน:** มีขั้นตอนการคิด 2-3 ขั้นตอน (Multi-step Calculation)
   - **การใช้สูตรและแนวคิด:** ต้องใช้มากกว่า 1 สูตร หรือ 1 แนวคิด เช่น ต้องหาตัวแปรตัวกลาง (Intermediate Variable) ก่อน 1 สเต็ป แล้วนำค่านั้นไปแทนในอีกสูตรหนึ่งเพื่อหาคำตอบสุดท้าย
   - **เงื่อนไขและการวิเคราะห์:** มีข้อมูลหรือเงื่อนไขที่ต้องวิเคราะห์ก่อนเลือกสูตร หรือต้องแปลงหน่วย/จัดรูปสมการ
   - **เป้าหมายผู้เรียน:** นักเรียนต้องเข้าใจเนื้อหาอย่างแท้จริง ไม่ใช่เพียงแค่ท่องจำสูตร
   - **ตัวอย่าง:**
     * *คณิตศาสตร์:* กำหนดด้าน 2 ด้านและมุมที่ไม่ใช่มุมฉาก ต้องใช้กฎของโคไซน์ (Law of Cosines) หาด้านที่ 3 ก่อน แล้วนำไปคำนวณหาพื้นที่สามเหลี่ยม หรือ แก้สมการกำลังสองที่มีการจัดรูปก่อน
     * *ฟิสิกส์:* กำหนดความเร่งและเวลา หาความเร็วปลายก่อน แล้วนำความเร็วไปคำนวณหาพลังงานจลน์ หรือ โจทย์การเคลื่อนที่ที่มีการเปลี่ยนสถานะ
     * *เคมี:* คำนวณความเข้มข้นของสารละลายหลังการเจือจาง หรือ คำนวณปริมาณสารตั้งต้นที่เหลือจากสมการเคมีที่มีสารกำหนดปริมาณ

3. 🔴 **ระดับ "ยาก" (Hard - Deep Analysis, Multi-Concept Synthesis & High Cognitive Load):**
   - **ลักษณะโจทย์:** ต้องวิเคราะห์สถานการณ์ที่ซับซ้อน เชื่อมโยงหลายมิติ และสังเคราะห์องค์ความรู้ (Complex Synthesis, Evaluation & High-Level Problem Solving)
   - **วิธีคิดและขั้นตอน:** มีกระบวนการแก้ปัญหาหลายขั้นตอนต่อเนื่อง (3-4 ขั้นตอนขึ้นไป)
   - **การใช้สูตรและแนวคิด:** ต้องบูรณาการหลายสูตร หรือเชื่อมโยงหลายหัวข้อย่อยภายในบทเรียนเดียวกัน (Cross-concept linkage within chapter)
   - **เงื่อนไขซับซ้อน:** มีเงื่อนไขข้อจำกัด (Constraints), ช่วงของคำตอบ (Domain/Range/Inequalities), การหาค่าสูงสุด-ต่ำสุด (Optimization), หรือโจทย์ที่ต้องคิดย้อนกลับ (Reverse Reasoning)
   - **สถานการณ์และการวิเคราะห์:** มีบริบทสถานการณ์จริงที่ต้องแปลความหมายเป็นตัวแปรและสมการก่อน และต้องใช้เหตุผลทางตรรกศาสตร์ในการตัดตัวเลือก
   - **เป้าหมายผู้เรียน:** ท้าทายความคิดระดับสูงของผู้เรียน ข้อสอบระดับข้อสอบแข่งขัน คัดเลือกเข้ามหาวิทยาลัยชั้นนำ (เช่น ข้อสอบ A-Level / TPAT พาร์ทยาก)
   - **ตัวอย่าง:**
     * *คณิตศาสตร์:* แก้สมการตรีโกณมิติที่ต้องจัดรูปด้วยเอกลักษณ์มุมหลายเท่า + แยกตัวประกอบ + ตรวจสอบเงื่อนไขโดเมนที่กำหนดเพื่อหาผลรวมคำตอบ หรือ หาค่าสูงสุด/ต่ำสุดของฟังก์ชันที่มีเงื่อนไขจำกัด
     * *ฟิสิกส์:* วัตถุเคลื่อนที่บนพื้นเอียงที่มีแรงเสียดทาน แล้วเคลื่อนที่ต่อไปชนสปริง คำนวณระยะหดของสปริง (ผสานเรื่อง แรง + กฎนิวตัน + กฎการอนุรักษ์พลังงาน)
     * *เคมี:* ปริมาณสารสัมพันธ์ที่มีผลได้ร้อยละ + การดุลสมการรีดอกซ์หลายขั้นตอน + การคำนวณสมดุลเคมีแบบต่อยอด

=== กฎเหล็กการสร้างข้อสอบ (CRITICAL GENERATION RULES) ===
1. **ความถูกต้องตรงตามระดับความยากที่เลือก 100% (Strict Difficulty Adherence):**
   - ทั้ง ${count} ข้อในชุดนี้ ต้องถูกสร้างขึ้นให้มีระดับความลึกและขั้นตอนการคิดตรงตามข้อกำหนดของระดับ "${difficulty}" ข้างต้นอย่างแท้จริง
2. **ภายในชุดเดียวกัน ห้ามมีข้อสอบซ้ำกัน 100% (Strict Intra-Set Uniqueness):**
   - ทั้ง ${count} ข้อในชุดนี้ต้องมีโจทย์ วิธีคิด สถานการณ์ และตัวเลือกที่แตกต่างกันอย่างสิ้นเชิง ห้ามมีข้อใดซ้ำหรือคล้ายคลึงกันในชุดเดียว
3. **การกระจายข้อสอบและความหลากหลาย (Distribution & Multi-Paradigm Planning):**
   - กระจายทั้ง ${count} ข้อให้ครอบคลุมหัวข้อสำคัญของบทนั้นอย่างสมดุล ไม่กระจุกตัวอยู่หัวข้อเดียว
   - ให้เปลี่ยนอย่างมีศิลปะในแต่ละข้อ:
     * **วิธีคิด / สูตรที่ใช้:** เปลี่ยนแนวทางแก้ปัญหา (เช่น ข้อหนึ่งใช้สูตรตรง ข้อหนึ่งใช้กฎไซน์ ข้อหนึ่งแก้สมการ ข้อหนึ่งใช้รูปทรงเรขาคณิต)
     * **สถานการณ์ / บริบท:** เปลี่ยนบริบทโจทย์ (โจทย์ตัวเลขบริสุทธิ์, โจทย์ปัญหาประยุกต์ชีวิตจริง, โจทย์วิเคราะห์ความสัมพันธ์)
     * **เงื่อนไขและตัวแปร:** สลับตัวแปรที่โจทย์ให้และตัวแปรที่ต้องการหา (Given vs Target)
     * **จำนวนขั้นตอน:** อิงตามระดับความยาก "${difficulty}"
     * **รูปแบบคำถาม:** ถามหาค่าคำตอบ, ถามหาช่วงของคำตอบ, หรือถามเงื่อนไขที่ถูกต้อง
     * **ระดับการวิเคราะห์:** โจทย์คำนวณโดยตรง, โจทย์วิเคราะห์เงื่อนไข, โจทย์ตีความกราฟ/ตาราง
   - **กฎเหล็ก:** "ห้ามเปลี่ยนแค่ตัวเลขแล้วถือว่าเป็นโจทย์ใหม่" แต่ละข้อต้องมีเอกลักษณ์และวิธีคิดที่แตกต่าง
4. **การป้องกันการออกซ้ำข้ามรอบ (Multi-Round Anti-Repetition):**
   - ตรวจสอบประวัติข้อสอบด้านล่าง หลีกเลี่ยงข้อและแนวโจทย์ที่เพิ่งออกในรอบล่าสุด (Rank 1) อย่างเด็ดขาด
   - เลือกหัวข้อและแนวทางใหม่ที่ยังไม่เคยออกก่อนเสมอ

${subjectPromptRules}

${recentQuestionsContext}

=== กฎเหล็กการแสดงผลสัญลักษณ์และสมการคณิตศาสตร์ทั้งหมด (STRICT MATHEMATICAL NOTATION & LATEX RULES) ===
1. **แสดงผลทุกสัญลักษณ์ สูตร นิพจน์ ตัวแปร และสมการด้วย Mathematical Notation (LaTeX) ที่ Render เป็นสมการจริงเท่านั้น**:
   - $\\pi$ (ห้ามเขียน 'pi' หรือ 'Pi')
   - $\\sqrt{x}$, $\\sqrt[n]{x}$ (ห้ามเขียน 'sqrt(x)', 'sqrt39' หรือ '√x' ดิบ ให้เขียน '$\\sqrt{x}$', '$\\sqrt{39}$')
   - $x^2$, $x^3$, $x^n$, $10^{-3}$ (ห้ามเขียน 'x^2' หรือ 'x**2' ในรูปแบบโค้ด ให้เขียน '$x^2$')
   - $\\frac{a}{b}$, $\\frac{x+1}{x-1}$ (ห้ามเขียน 'a/b' หรือ '(x+1)/(x-1)' ในรูปแบบโค้ด ให้เขียน '$\\frac{a}{b}$')
   - $\\sin \\theta$, $\\cos \\theta$, $\\tan \\theta$, $\\sin x$, $\\arcsin x$, $\\arccos x$, $\\arctan x$, $\\csc \\theta$, $\\sec \\theta$, $\\cot \\theta$ (ห้ามเขียน 'sin(x)' หรือ 'sin(theta)' ให้เขียน '$\\sin x$', '$\\sin\\theta$')
   - $\\sum_{i=1}^n x_i$ (ผลรวม), $\\int_a^b f(x)\\,dx$ (อินทิกรัล)
   - $\\le$, $\\ge$, $\\ne$, $\\approx$ (ห้ามเขียน '<=', '>=', '!=', '~=')
   - $\\angle ABC$, $\\angle A$ (มุม - ห้ามเขียน 'angle ABC' หรือ 'มุม ABC')
   - $\\perp$ (ตั้งฉาก - ห้ามเขียน 'perp' หรือ 'perpendicular' หรือ '|_')
   - $\\parallel$ (ขนาน - ห้ามเขียน '||' หรือ 'parallel')
   - $90^\\circ$, $45^\\circ$ (องศา - ห้ามเขียน '90 deg' หรือ '90 C')
   - $\\pm$ (บวกลบ - ห้ามเขียน '+/-')
   - $\\times$, $\\cdot$ (คูณ - ห้ามเขียน '*')
   - $\\div$ (หาร - ห้ามเขียน '/')
   - $\\infty$ (อนันต์ - ห้ามเขียน 'infinity')
   - $\\Delta t$, $\\Sigma F$, $\\lambda$, $\\mu$, $\\alpha$, $\\beta$, $\\gamma$, $\\omega$
2. **ขอบเขตการบังคับใช้กฎนี้:**
   - **ข้อความโจทย์ (questionText):** ทุกโจทย์ต้องใช้ LaTeX ล้อมด้วย $ สำหรับ inline หรือ $$ สำหรับ display
   - **ตัวเลือกคำตอบทุกข้อ (options - ข้อ 1, 2, 3, 4):** ทุกตัวเลือกที่เป็นตัวเลข สูตร ตัวแปร เศษส่วน หรือนิพจน์ ต้องเขียนในรูปแบบ LaTeX เช่น "$\\frac{7}{25}$", "$\\sqrt{39}\\text{ หน่วย}$", "$7\\text{ หน่วย}$" เป็นต้น ห้ามใส่โค้ดดิบ
   - **เฉลยและวิธีทำ (explanation):** วิธีคิดทีละขั้นตอนทุกบรรทัดต้องแสดงสมการจริง ตัวแปร และสูตรอย่างสวยงามเหมือนหนังสือเรียน
3. **ห้ามแสดงในรูปแบบภาษาคอมพิวเตอร์หรือโค้ดเด็ดขาด** (No raw code, No backticks for math, No pseudo-syntax). ต้องแสดงผลเหมือนหนังสือเรียนและข้อสอบจริง 100%

=== กฎเหล็กตัวเลือกคำตอบปรนัย (STRICT 4-CHOICE MULTIPLE CHOICE RULES) ===
1. **ต้องมีตัวเลือกคำตอบครบ EXACTLY 4 ตัวเลือกเท่านั้น (A, B, C, D) โดยไม่มีข้อยกเว้น:**
   - รายการ \`options\` ในทุกข้อต้องมีสมาชิก **EXACTLY 4 ตัวเลือกเท่านั้น** (\`options.length === 4\`)
   - **ห้ามสร้างตัวเลือกเกิน 4 ตัวเลือกเด็ดขาด** (ห้ามมีตัวเลือกที่ 5, 6 หรือตัวเลือก E, F โดยเด็ดขาด)
   - **ห้ามสร้างตัวเลือกน้อยกว่า 4 ตัวเลือกเด็ดขาด** (ห้ามมี 2 หรือ 3 ตัวเลือก)
2. **การจัดวางและตัวแทนของตัวเลือกทั้ง 4:**
   - ตัวเลือก A (ดัชนี 0 / index 0)
   - ตัวเลือก B (ดัชนี 1 / index 1)
   - ตัวเลือก C (ดัชนี 2 / index 2)
   - ตัวเลือก D (ดัชนี 3 / index 3)
   - *หมายเหตุ:* ในข้อความของตัวเลือกแต่ละข้อ ไม่ต้องใส่คำนำหน้า "A.", "B.", "C.", "D." ซ้ำซ้อนลงในสตริง ให้ใส่เฉพาะเนื้อหาคำตอบ สูตร หรือสมการคณิตศาสตร์
3. **คำตอบที่ถูกต้อง 1 ข้อ และตัวลวงที่สมเหตุสมผล 3 ข้อ (1 Correct Answer & 3 Plausible Distractors):**
   - **ต้องมีคำตอบที่ถูกต้องเพียง 1 ตัวเลือกเท่านั้น**
   - อีก 3 ตัวเลือกที่เหลือ **ต้องเป็นคำตอบที่ผิดแต่สมเหตุสมผล (Plausible Distractors)** เช่น เกิดจากการคำนวณผิดพลาดทั่วไป (ลืมกลับเศษส่วน, คิดเครื่องหมายบวกลบสลับ, ลืมคูณสัมประสิทธิ์, หรือความเข้าใจคลาดเคลื่อนทั่วไป)
   - **ห้ามมีตัวเลือกซ้ำกันแม้แต่คู่เดียว (All 4 options must be mutually unique & distinct)**
4. **ดัชนีคำตอบที่ถูกต้อง (\`correctOptionIndex\`):**
   - ค่า \`correctOptionIndex\` ต้องเป็นจำนวนเต็ม \`0\` (ตรงกับ A), \`1\` (ตรงกับ B), \`2\` (ตรงกับ C), หรือ \`3\` (ตรงกับ D) เท่านั้น

=== กฎการตรวจสอบความถูกต้องของคำตอบและโจทย์คำนวณ (CALCULATION & ANSWER VERIFICATION) ===
1. **โจทย์คำนวณจริง (Authentic Calculations):** เมื่อหัวข้อเป็นคณิตศาสตร์หรือฟิสิกส์ ต้องสร้างโจทย์คำนวณที่มีตัวเลขจริง ตัวแปรจริง และคำนวณค่าได้จริง
2. **ความสอดคล้องกัน 100% (Strict Consistency):**
   - คำตอบสุดท้ายที่คำนวณได้ในเฉลยและวิธีทำ (explanation) เช่น $c = 7$ จะต้องมีอยู่ในรายการตัวเลือก (options) อย่างแน่นอน (เช่น "$7\\text{ หน่วย}$")
   - ค่า \`correctOptionIndex\` (0, 1, 2, หรือ 3) จะต้องชี้ตรงไปยังตัวเลือกที่เป็นคำตอบที่ถูกต้องอย่างแม่นยำ 100% (0=A, 1=B, 2=C, 3=D)
   - หากในวิธีทำสรุปว่า "เลือกตัวเลือกที่ 1" หรือ "เลือกตัวเลือก A" \`correctOptionIndex\` ต้องเป็น \`0\` เสมอ
   - หากในวิธีทำสรุปว่า "เลือกตัวเลือกที่ 2" หรือ "เลือกตัวเลือก B" \`correctOptionIndex\` ต้องเป็น \`1\` เสมอ
   - หากในวิธีทำสรุปว่า "เลือกตัวเลือกที่ 3" หรือ "เลือกตัวเลือก C" \`correctOptionIndex\` ต้องเป็น \`2\` เสมอ
   - หากในวิธีทำสรุปว่า "เลือกตัวเลือกที่ 4" หรือ "เลือกตัวเลือก D" \`correctOptionIndex\` ต้องเป็น \`3\` เสมอ
   - ห้ามสร้างตัวเลือกหรือเฉลยที่ขัดแย้งกับหลักการคำนวณเด็ดขาด

=== กฎการตรวจสอบก่อนส่งออก (PRE-RESPONSE VERIFICATION) ===
AI ต้องตรวจสอบข้อสอบทุกข้อก่อนส่งออกให้ผ่านเกณฑ์ทั้งหมด:
1. Grade Match = TRUE (ตรงระดับชั้น ${gradeLevel} ทั้งความลึกและหลักสูตร)
2. Subject & Nature Match = TRUE (ตรงวิชา ${subject} และตรงธรรมชาติของวิชา เช่น คณิต/ฟิสิกส์ต้องเป็นโจทย์คำนวณและแก้ปัญหา)
3. Lesson & Topic Match = TRUE (ทุกข้ออยู่ในบทเรียน ${lesson} และหัวข้อ ${topic || subtopic || lesson} 100%)
4. Intra-Set Uniqueness = TRUE (ไม่มีข้อสอบซ้ำกันในชุดเดียวกัน 100%)
5. Multi-Round Anti-Repetition = TRUE (หลีกเลี่ยงข้อที่เพิ่งออกในรอบล่าสุด Rank 1 และเลือกแนวโจทย์ใหม่)
6. Topic Distribution = TRUE (กระจายหัวข้อย่อยและมิติความรู้หลากหลาย ไม่กระจุกตัว)
7. Pattern Diversity = TRUE (ไม่ใช้รูปแบบโจทย์ซ้ำกันหลายข้อ ไม่ใช่การเปลี่ยนแค่ตัวเลข)
8. Mathematical Notation = TRUE (สมการ/นิพจน์ทั้งหมดใช้ LaTeX มาตรฐาน ไม่แสดงโค้ดดิบ)
9. Exactly 4 Distinct Options = TRUE (มีตัวเลือกครบ 4 ข้อ A, B, C, D ไม่ซ้ำกัน ไม่มีตัวเลือก E หรือ F และ correctOptionIndex เป็น 0, 1, 2, หรือ 3)
10. Detailed Step-by-Step Explanation = TRUE (มีวิธีทำละเอียดทีละขั้นตอน สรุปตัวเลือก A, B, C, D)
11. Cognitive Complexity & Difficulty Fidelity = TRUE (ระดับความยากของทุกข้อตรงตามนิยามความซับซ้อนของการคิด "${difficulty}" 100%)`;

    let rawText = "";
    for (const modelName of ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.7-flash"]) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "ชื่อชุดข้อสอบ เช่น ข้อสอบจำลอง ม.5 วิชาคณิตศาสตร์ (ฟังก์ชันตรีโกณมิติ)" },
                gradeLevel: { type: Type.STRING, description: `ระดับชั้น ต้องเป็น ${gradeLevel}` },
                subjectCategory: { type: Type.STRING, description: "ประเภทวิชา" },
                subject: { type: Type.STRING, description: "ชื่อวิชา" },
                lesson: { type: Type.STRING, description: "ชื่อบทเรียน" },
                topic: { type: Type.STRING, description: "ชื่อหัวข้อ" },
                subtopic: { type: Type.STRING, description: "ชื่อหัวข้อย่อย" },
                category: { type: Type.STRING, description: "ประเภทข้อสอบ เช่น TGAT, TPAT, A-Level, O-NET, School" },
                difficulty: { type: Type.STRING, description: "ระดับความยาก" },
                description: { type: Type.STRING, description: "คำอธิบายชุดข้อสอบและเกณฑ์การให้คะแนน" },
                timeLimitMinutes: { type: Type.INTEGER, description: "เวลาในการทำข้อสอบ (นาที)" },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING, description: "รหัสข้อ เช่น q1, q2" },
                      gradeLevel: { type: Type.STRING, description: `ระดับชั้น ต้องเป็น ${gradeLevel}` },
                      subjectCategory: { type: Type.STRING, description: "ประเภทวิชา" },
                      subject: { type: Type.STRING, description: "ชื่อวิชา" },
                      lesson: { type: Type.STRING, description: "ชื่อบทเรียน" },
                      topic: { type: Type.STRING, description: "ชื่อหัวข้อ" },
                      subtopic: { type: Type.STRING, description: "ชื่อหัวข้อย่อย" },
                      questionText: { type: Type.STRING, description: "เนื้อหาโจทย์ข้อสอบ (ถ้าเป็นคณิต/ฟิสิกส์ ต้องมีตัวเลข สมการ หรือสถานการณ์คำนวณ)" },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "รายการตัวเลือกคำตอบ EXACTLY 4 ตัวเลือกเท่านั้น (สำหรับ A, B, C, D) ห้ามมีตัวเลือกที่ 5 (E, F) และห้ามมีน้อยกว่า 4 ตัวเลือก ทุกตัวเลือกต้องไม่ซ้ำกัน",
                      },
                      correctOptionIndex: {
                        type: Type.INTEGER,
                        description: "index ของตัวเลือกที่ถูกต้อง (0 = A, 1 = B, 2 = C, 3 = D)",
                      },
                      explanation: {
                        type: Type.STRING,
                        description: "คำอธิบายเฉลยอย่างละเอียด แสดงวิธีทำทีละสเต็ป",
                      },
                      difficulty: { type: Type.STRING, description: "ง่าย / ปานกลาง / ยาก" },
                    },
                    required: ["id", "questionText", "options", "correctOptionIndex", "explanation"],
                  },
                },
              },
              required: ["title", "gradeLevel", "subjectCategory", "subject", "timeLimitMinutes", "questions"],
            },
          },
        });
        if (response.text) {
          rawText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`generate-exam attempt with ${modelName} failed:`, err.message || err);
      }
    }

    if (!rawText) {
      throw new Error("Unable to generate exam at this moment");
    }
    const examData = JSON.parse(rawText);

    // Strict validation & sanitization: Enforce GradeLevel, curriculum integrity, and math correctness
    examData.gradeLevel = gradeLevel;
    examData.subjectCategory = subjectCategory;
    examData.subject = subject || examData.subject;
    examData.lesson = lesson || examData.lesson || "ครอบคลุมเนื้อหาตามหลักสูตร";
    examData.topic = topic || examData.topic || "";
    examData.subtopic = subtopic || examData.subtopic || "";
    examData.category = category || examData.category;
    examData.id = examData.id || `exam-${Date.now()}`;
    examData.createdAt = new Date().toISOString();
    examData.timeLimitMinutes = examData.timeLimitMinutes || count * 2;

    if (Array.isArray(examData.questions)) {
      // Helper function to extract structural question skeleton (stripping numbers & math values)
      const getQuestionSkeleton = (text: string): string => {
        return (text || "")
          .replace(/\$[^$]+\$/g, " [MATH] ")
          .replace(/\d+(?:\.\d+)?/g, " [NUM] ")
          .replace(/[!@#$%^&*(),.?":{}|<>_]/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
      };

      // Helper function for Jaccard token similarity
      const calculateTokenSimilarity = (strA: string, strB: string): number => {
        const wordsA = new Set(strA.split(/\s+/).filter((w) => w.length > 1));
        const wordsB = new Set(strB.split(/\s+/).filter((w) => w.length > 1));
        if (wordsA.size === 0 || wordsB.size === 0) return 0;
        let intersection = 0;
        for (const w of wordsA) {
          if (wordsB.has(w)) intersection++;
        }
        const union = new Set([...wordsA, ...wordsB]).size;
        return intersection / union;
      };

      // 1. Intra-set Deduplication and Anti-Pattern Clustering Check
      const uniqueQuestions: any[] = [];
      const seenSkeletons: string[] = [];

      for (const q of examData.questions) {
        const rawText = (q.questionText || "").trim();
        if (!rawText || rawText.length < 5) continue;

        const skeleton = getQuestionSkeleton(rawText);

        // Check if this question is identical or has heavy pattern overlap (> 70% similarity) with an already accepted question in this set
        let isDuplicatePattern = false;
        for (const accepted of uniqueQuestions) {
          const acceptedText = (accepted.questionText || "").trim();
          const rawSim = calculateTokenSimilarity(rawText.toLowerCase(), acceptedText.toLowerCase());
          const acceptedSkel = getQuestionSkeleton(acceptedText);
          const skelSim = calculateTokenSimilarity(skeleton, acceptedSkel);

          if (rawSim > 0.70 || skelSim > 0.75 || (skeleton.length > 20 && skeleton === acceptedSkel)) {
            isDuplicatePattern = true;
            break;
          }
        }

        // Check against recent questions from immediate previous round (Rank 1)
        if (!isDuplicatePattern && Array.isArray(recentQuestions)) {
          for (const rq of recentQuestions) {
            const rqRank = typeof rq === 'object' ? rq.recencyRank : 1;
            if (rqRank === 1) {
              const rqText = typeof rq === 'string' ? rq : (rq.questionText || '');
              if (rqText) {
                const sim = calculateTokenSimilarity(rawText.toLowerCase(), rqText.toLowerCase());
                if (sim > 0.75) {
                  isDuplicatePattern = true;
                  break;
                }
              }
            }
          }
        }

        if (!isDuplicatePattern) {
          uniqueQuestions.push(q);
          seenSkeletons.push(skeleton);
        }
      }

      // If strict deduplication left fewer questions, keep the unique ones
      const finalQuestionsList = uniqueQuestions.length > 0 ? uniqueQuestions : examData.questions;

      // Clean and sanitize helper for options
      const cleanOptionString = (opt: any): string => {
        if (typeof opt !== 'string') return String(opt || '');
        let s = opt.trim();
        // Remove leading choice labels like "A.", "A)", "A -", "(A)", "1.", "ก." if present
        s = s.replace(/^(\(?[A-Da-dก-ง1-4]\)?[\.\:\)\s\-]+)/, '').trim();
        return s || opt.trim();
      };

      examData.questions = finalQuestionsList.map((q: any, idx: number) => {
        // 1. Clean and enforce exactly 4 options
        let rawOpts: string[] = Array.isArray(q.options)
          ? q.options.map(cleanOptionString).filter((t: string) => t.length > 0)
          : [];

        let correctIdx =
          typeof q.correctOptionIndex === 'number' &&
          q.correctOptionIndex >= 0 &&
          q.correctOptionIndex < 4
            ? q.correctOptionIndex
            : 0;

        const exp = q.explanation || "";
        // Verify if explanation explicitly mentions the chosen option
        const choiceMatch = exp.match(/เลือก(?:ตัวเลือกที่|ตัวเลือก|ข้อที่|ข้อ|ช้อยส์ที่|ช้อยส์)?\s*([1-4]|[กขคงA-D])/i);
        if (choiceMatch) {
          const matchedVal = choiceMatch[1].toUpperCase();
          const map: Record<string, number> = {
            '1': 0, '2': 1, '3': 2, '4': 3,
            'ก': 0, 'ข': 1, 'ค': 2, 'ง': 3,
            'A': 0, 'B': 1, 'C': 2, 'D': 3
          };
          if (typeof map[matchedVal] === 'number') {
            correctIdx = map[matchedVal];
          }
        }

        // 2. Ensure strictly 4 options with deduplication
        let finalOpts: string[] = [];
        const seen = new Set<string>();

        for (const opt of rawOpts) {
          const normalized = opt.toLowerCase().trim();
          if (!seen.has(normalized) && finalOpts.length < 4) {
            seen.add(normalized);
            finalOpts.push(opt);
          }
        }

        // If options were cut short or duplicates existed, pad with plausible distinct options
        const fallbackDistractors = [
          'ข้อมูลไม่เพียงพอในการสรุปผล',
          'สรุปผลคลาดเคลื่อนจากหลักวิชาการ',
          'ตัวแปรและเงื่อนไขไม่สอดคล้องกัน',
          'มีเงื่อนไขขัดแย้งกับหลักการพื้นฐาน',
        ];

        let padIdx = 0;
        while (finalOpts.length < 4) {
          const padCandidate = fallbackDistractors[padIdx % fallbackDistractors.length] + (padIdx >= 4 ? ` (${padIdx})` : '');
          if (!seen.has(padCandidate.toLowerCase())) {
            seen.add(padCandidate.toLowerCase());
            finalOpts.push(padCandidate);
          }
          padIdx++;
        }

        // Always truncate to exactly 4 options (no E, F, or more)
        if (finalOpts.length > 4) {
          finalOpts = finalOpts.slice(0, 4);
        }

        // Clamp correctOptionIndex to 0..3
        correctIdx = Math.max(0, Math.min(3, correctIdx));

        return {
          ...q,
          id: q.id || `q-${idx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          gradeLevel: gradeLevel,
          subjectCategory: subjectCategory,
          subject: subject || q.subject || examData.subject,
          lesson: lesson || q.lesson || examData.lesson || "",
          topic: topic || q.topic || examData.topic || "",
          subtopic: subtopic || q.subtopic || examData.subtopic || "",
          options: finalOpts,
          correctOptionIndex: correctIdx,
          difficulty: q.difficulty || difficulty,
        };
      });
    }

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

    let rawText = "";
    for (const modelName of ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.7-flash"]) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
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
        if (response.text) {
          rawText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`analyze-performance attempt with ${modelName} failed:`, err.message || err);
      }
    }

    if (!rawText) {
      throw new Error("Unable to analyze performance at this moment");
    }
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
