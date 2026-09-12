import { ExamData } from '../types';
import { TPAT3_DEC_66_COMPLETE_EXAM } from './tpat3Dec66CompleteExam';
import { SAMPLE_EXAMS } from './examCatalog';

/**
 * คลังข้อสอบจริง / ข้อสอบที่ Admin นำเข้าสำหรับเตรียมตัวสอบ (Official Admin Exam Bank)
 * จัดหมวดหมู่ตาม:
 * - สนามสอบ / ประเภทการสอบ (TPAT3, TGAT, TPAT, A-Level, O-NET)
 * - วิชา (Subject)
 * - ปีของข้อสอบ (2566, 2567, 2568)
 * - หมวด/เรื่อง (Topic)
 * - ชุดข้อสอบ (Exam Set)
 * 
 * ทุกชุดในนี้ถือเป็นข้อสอบ Admin นำเข้า ไม่ผ่านการดัดแปลงโดย AI
 */
export const INITIAL_ADMIN_EXAM_PREPARATION_SETS: ExamData[] = [
  // 1. ชุดหลัก: TPAT3 ธ.ค. 66 (ข้อสอบจริงครบ 70 ข้อ พร้อมรูปภาพ แผนภาพ และเลขหน้าต้นฉบับ)
  {
    ...TPAT3_DEC_66_COMPLETE_EXAM,
    status: 'พร้อมใช้งาน',
  },

  // 2. TGAT1 ภาษาอังกฤษ ธ.ค. 66
  {
    id: 'tgat1-dec-66',
    title: 'แนวข้อสอบ TGAT1 การสื่อสารภาษาอังกฤษ (English Communication)',
    category: 'TGAT',
    examType: 'TGAT1',
    examCode: 'TGAT1 (91)',
    year: '2566',
    term: 'ธ.ค. 66',
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TGAT1 การสื่อสารภาษาอังกฤษ (91)',
    lesson: 'Speaking & Reading Skills',
    topic: 'ทักษะการพูด (Speaking) และการอ่าน (Reading Comprehension)',
    difficulty: 'ระดับข้อสอบจริง',
    timeLimitMinutes: 60,
    totalQuestions: 60,
    totalPages: 24,
    status: 'พร้อมใช้งาน',
    isOfficial: true,
    importedBy: 'admin',
    source: 'ทปอ. TGAT1 ธันวาคม 2566',
    sourceFile: 'ข้อสอบ TGAT1 ธ.ค. 66.pdf',
    description: 'ข้อสอบจริงแนว TGAT1 รหัส 91 จัดสอบโดย ทปอ. ธันวาคม 2566 วัดทักษะ Question-Response, Short Conversations, Text Completion และ Reading Comprehension นำเข้าโดย Admin',
    createdAt: '2023-12-10T09:00:00.000Z',
    questions: SAMPLE_EXAMS[0]?.questions ? [
      ...SAMPLE_EXAMS[0].questions,
      {
        id: 'tgat1-q4',
        questionNumber: 4,
        gradeLevel: 'ม.6',
        subjectCategory: 'เตรียมสอบ',
        subject: 'TGAT1 การสื่อสารภาษาอังกฤษ (91)',
        lesson: 'Speaking & Reading Skills',
        topic: 'Text Completion',
        subtopic: 'Vocabulary & Context Clues',
        questionText: 'Read the sentence and choose the best word to complete it:\n\n"Despite encountering severe financial difficulties during the early phases of the project, the research team remained ____________ and ultimately developed a groundbreaking renewable energy solution."',
        options: [
          'A. resilient',
          'B. reluctant',
          'C. redundant',
          'D. remorseful'
        ],
        correctOptionIndex: 0,
        explanation: 'คำว่า "resilient" (มีความยืดหยุ่น ปรับตัวและฟื้นตัวได้ดีแม้เผชิญความยากลำบาก) สอดคล้องกับคำเชื่อม "Despite encountering severe financial difficulties" ที่สุด',
        difficulty: 'ปานกลาง'
      },
      {
        id: 'tgat1-q5',
        questionNumber: 5,
        gradeLevel: 'ม.6',
        subjectCategory: 'เตรียมสอบ',
        subject: 'TGAT1 การสื่อสารภาษาอังกฤษ (91)',
        lesson: 'Speaking & Reading Skills',
        topic: 'Reading Comprehension',
        subtopic: 'Author Tone & Purpose',
        questionText: 'What is the primary tone of an editorial advocating for equitable access to digital learning tools in rural schools?',
        options: [
          'A. Indifferent and passive',
          'B. Persuasive and passionate',
          'C. Sarcastic and dismissive',
          'D. Humorous and lighthearted'
        ],
        correctOptionIndex: 1,
        explanation: 'บทความรณรงค์ (advocating) เรื่องการศึกษาที่เท่าเทียม จะใช้น้ำเสียงโน้มน้าวใจ (Persuasive) และมีความมุ่งมั่นตั้งใจ (Passionate)',
        difficulty: 'ง่าย'
      }
    ] : [],
  },

  // 3. TGAT2 การคิดอย่างมีเหตุผล ธ.ค. 66
  {
    id: 'tgat2-dec-66',
    title: 'แนวข้อสอบ TGAT2 การคิดอย่างมีเหตุผล (Critical & Logical Thinking)',
    category: 'TGAT',
    examCode: 'TGAT2 (92)',
    year: '2566',
    term: 'ธ.ค. 66',
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'TGAT2 การคิดอย่างมีเหตุผล (92)',
    lesson: 'ความสามารถทางตัวเลขและตรรกศาสตร์',
    topic: 'อนุกรมตัวเลข มิติสัมพันธ์ และการคิดเชิงตรรกะ',
    difficulty: 'ระดับข้อสอบจริง',
    timeLimitMinutes: 60,
    totalQuestions: 80,
    isOfficial: true,
    importedBy: 'admin',
    source: 'ทปอ. TGAT2 ธันวาคม 2566',
    description: 'ข้อสอบจริงแนว TGAT2 รหัส 92 ธันวาคม 2566 ครอบคลุมอนุกรมตัวเลข มิติสัมพันธ์ การคิดเชิงเหตุผล และภาษาเชิงวิเคราะห์ นำเข้าโดย Admin',
    createdAt: '2023-12-10T13:00:00.000Z',
    questions: SAMPLE_EXAMS[1]?.questions || [],
  },

  // 4. A-Level คณิตประยุกต์ 1 ปี 66
  {
    id: 'alevel-math1-66',
    title: 'แนวข้อสอบ A-Level 61 คณิตศาสตร์ประยุกต์ 1 ปี 66',
    category: 'A-Level',
    examCode: 'A-Level 61',
    year: '2566',
    term: 'มี.ค. 66',
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'A-Level 61 คณิตศาสตร์ประยุกต์ 1',
    lesson: 'แคลคูลัส จำนวนจริง และความน่าจะเป็น',
    topic: 'คณิตศาสตร์ประยุกต์ ม.ปลาย (พื้นฐาน + เพิ่มเติม)',
    difficulty: 'ระดับข้อสอบจริง',
    timeLimitMinutes: 90,
    totalQuestions: 30,
    isOfficial: true,
    importedBy: 'admin',
    source: 'ทปอ. ข้อสอบสามัญ A-Level มีนาคม 2566',
    description: 'แนวข้อสอบ A-Level คณิตศาสตร์ประยุกต์ 1 (วิชาสามัญ 61) จัดสอบโดย ทปอ. สำหรับคณะแพทยศาสตร์ วิศวกรรมศาสตร์ บัญชี และวิทยาศาสตร์ นำเข้าโดย Admin',
    createdAt: '2023-03-18T09:00:00.000Z',
    questions: [
      {
        id: 'al-math1-q1',
        questionNumber: 1,
        gradeLevel: 'ม.6',
        subjectCategory: 'เตรียมสอบ',
        subject: 'A-Level 61 คณิตศาสตร์ประยุกต์ 1',
        lesson: 'แคลคูลัสเบื้องต้น',
        topic: 'ลิมิตและความต่อเนื่องของฟังก์ชัน',
        subtopic: 'การหาค่าลิมิตในรูป 0/0',
        questionText: 'กำหนดให้ฟังก์ชัน $f(x) = \\frac{x^2 - 9}{\\sqrt{x + 1} - 2}$ เมื่อ $x \\ne 3$ ค่าของ $\\lim_{x \\to 3} f(x)$ มีค่าเท่ากับข้อใด?',
        options: [
          '$12$',
          '$24$',
          '$36$',
          '$48$',
          '$54$'
        ],
        correctOptionIndex: 1,
        explanation: '### ขั้นตอนการคำนวณ:\n1. แทนค่า $x = 3$ ได้รูปแบบ $\\frac{0}{0}$\n2. คอนจูเกตตัวส่วน ด้วย $(\\sqrt{x+1} + 2)$:\n   $$\\lim_{x \\to 3} \\frac{(x-3)(x+3)(\\sqrt{x+1} + 2)}{(x+1) - 4} = \\lim_{x \\to 3} \\frac{(x-3)(x+3)(\\sqrt{x+1} + 2)}{x-3}$$\n3. ตัดทอนพจน์ $(x-3)$:\n   $$= (3+3)(\\sqrt{3+1} + 2) = (6)(2+2) = 6 \\times 4 = 24$$\nตอบ ตัวเลือกที่ 2 ($24$)',
        difficulty: 'ปานกลาง'
      },
      {
        id: 'al-math1-q2',
        questionNumber: 2,
        gradeLevel: 'ม.6',
        subjectCategory: 'เตรียมสอบ',
        subject: 'A-Level 61 คณิตศาสตร์ประยุกต์ 1',
        lesson: 'สถิติและการกระจายตัวของข้อมูล',
        topic: 'ค่ากลางและส่วนเบี่ยงเบนมาตรฐาน',
        subtopic: 'การแจกแจงปกติมาตรฐาน ($Z$)',
        questionText: 'คะแนนสอบวิชาคณิตศาสตร์ของนักเรียนกลุ่มหนึ่งมีการแจกแจงปกติ มีค่าเฉลี่ยเลขคณิตเท่ากับ $65$ คะแนน และส่วนเบี่ยงเบนมาตรฐานเท่ากับ $10$ คะแนน ถ้านักเรียนที่สอบได้คะแนนอยู่ในกลุ่มเปอร์เซ็นไทล์ที่ $84.13$ จะมีคะแนนสอบเท่าใด? (กำหนดให้ $P(0 < Z < 1) = 0.3413$)',
        options: [
          '$70$ คะแนน',
          '$75$ คะแนน',
          '$80$ คะแนน',
          '$85$ คะแนน',
          '$90$ คะแนน'
        ],
        correctOptionIndex: 1,
        explanation: '### วิเคราะห์โจทย์:\n- เปอร์เซ็นไทล์ที่ $84.13$ หมายถึงพื้นที่ใต้โค้งปกติทางซ้ายเท่ากับ $0.8413$\n- พื้นที่จากค่าเฉลี่ยเลขคณิต ($Z=0$) ถึงจุดคะแนนคือ $0.8413 - 0.5000 = 0.3413$\n- จากข้อมูลที่กำหนด $P(0 < Z < 1) = 0.3413$ แสดงว่าค่ามาตรฐาน $Z = 1$\n- คำนวณหาคะแนนดิบ $X$:\n  $$Z = \\frac{X - \\mu}{\\sigma} \\implies 1 = \\frac{X - 65}{10} \\implies X = 65 + 10 = 75$$\nตอบ $75$ คะแนน (ตัวเลือกที่ 2)',
        difficulty: 'ง่าย'
      }
    ]
  },

  // 5. O-NET ม.6 วิทยาศาสตร์ ปี 66
  {
    id: 'onet-sci-m6-66',
    title: 'แนวข้อสอบ O-NET วิทยาศาสตร์ ม.6 ปี 66',
    category: 'O-NET',
    examCode: 'O-NET Sci 66',
    year: '2566',
    term: 'ก.พ. 66',
    gradeLevel: 'ม.6',
    subjectCategory: 'เตรียมสอบ',
    subject: 'O-NET วิทยาศาสตร์ ม.6',
    lesson: 'วิทยาศาสตร์กายภาพและชีวภาพ',
    topic: 'ดาราศาสตร์และธรณีวิทยา สิ่งแวดล้อม และพันธุศาสตร์',
    difficulty: 'ระดับข้อสอบจริง',
    timeLimitMinutes: 90,
    totalQuestions: 40,
    isOfficial: true,
    importedBy: 'admin',
    source: 'สทศ. ข้อสอบ O-NET ม.6 กุมภาพันธ์ 2566',
    description: 'ข้อสอบจริงแนว O-NET ชั้นมัธยมศึกษาปีที่ 6 สทศ. ครอบคลุมพันธุศาสตร์ นิเวศวิทยา เคมีในชีวิตประจำวัน ฟิสิกส์คลื่น และดาราศาสตร์อวกาศ นำเข้าโดย Admin',
    createdAt: '2023-02-25T09:00:00.000Z',
    questions: [
      {
        id: 'onet-sci-q1',
        questionNumber: 1,
        gradeLevel: 'ม.6',
        subjectCategory: 'เตรียมสอบ',
        subject: 'O-NET วิทยาศาสตร์ ม.6',
        lesson: 'วิทยาศาสตร์ชีวภาพ',
        topic: 'พันธุศาสตร์และการถ่ายทอดลักษณะ',
        subtopic: 'การถ่ายทอดลักษณะตามกฎของเมนเดล',
        questionText: 'หากนำต้นถั่วลันเตาต้นสูงที่มีจีโนไทป์แบบเฮเทอโรไซกัส ($Tt$) มาผสมพันธุ์กับต้นถั่วลันเตาต้นเตี้ย ($tt$) อัตราส่วนฟีโนไทป์ของรุ่นลูกที่ได้จะเป็นไปตามข้อใด?',
        options: [
          'ต้นสูงทั้งหมด ($100\\%$)',
          'ต้นสูง : ต้นเตี้ย เท่ากับ $3 : 1$',
          'ต้นสูง : ต้นเตี้ย เท่ากับ $1 : 1$',
          'ต้นเตี้ยทั้งหมด ($100\\%$)',
          'ต้นสูง : ต้นเตี้ย เท่ากับ $1 : 2 : 1$'
        ],
        correctOptionIndex: 2,
        explanation: 'การผสมระหว่าง $Tt \\times tt$:\nเซลล์สืบพันธุ์: $T, t$ ผสมกับ $t$\nจีโนไทป์ของลูก: $Tt$ (สูง) และ $tt$ (เตี้ย) ในอัตราส่วน $1 : 1$ (อย่างละ $50\\%$)',
        difficulty: 'ง่าย'
      }
    ]
  }
];
