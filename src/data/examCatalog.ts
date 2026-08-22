import { ExamSubjectConfig, ExamData } from '../types';

export const EXAM_SUBJECTS: ExamSubjectConfig[] = [
  // TGAT
  {
    id: 'tgat1',
    name: 'TGAT1 การสื่อสารภาษาอังกฤษ (English Communication)',
    category: 'TGAT',
    code: '91',
    description: 'ทดสอบทักษะภาษาอังกฤษทั้งการพูดในชีวิตประจำวัน และการอ่านวิเคราะห์ (Speaking & Reading Skills)',
    defaultTopics: ['Question-Response', 'Short Conversations', 'Long Conversations', 'Text Completion', 'Reading Comprehension'],
    optionsCount: 4,
    iconName: 'Languages',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'tgat2',
    name: 'TGAT2 การคิดอย่างมีเหตุผล (Critical & Logical Thinking)',
    category: 'TGAT',
    code: '92',
    description: 'วัดความสามารถด้านตัวเลข มิติสัมพันธ์ เหตุผลเชิงตรรกะ และภาษาไทยเชิงวิเคราะห์',
    defaultTopics: ['ความสามารถทางตัวเลข (Number Ability)', 'มิติสัมพันธ์ (Spatial Ability)', 'การคิดเชิงเหตุผล (Logical Reasoning)', 'ความสามารถทางภาษา (Language Ability)'],
    optionsCount: 5,
    iconName: 'Brain',
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'tgat3',
    name: 'TGAT3 สมรรถนะการทำงานในอนาคต (Future Workforce Competencies)',
    category: 'TGAT',
    code: '93',
    description: 'การสร้างคุณค่าและนวัตกรรม, การแก้ไขปัญหาที่ซับซ้อน, การบริหารอารมณ์ และการเป็นพลเมืองที่มีส่วนร่วม',
    defaultTopics: ['การสร้างคุณค่าและนวัตกรรม', 'การแก้ไขปัญหาที่ซับซ้อน', 'การบริหารจัดการอารมณ์', 'การเป็นพลเมืองที่มีส่วนร่วมต่อสังคม'],
    optionsCount: 4,
    iconName: 'Briefcase',
    color: 'from-amber-500 to-orange-600',
  },

  // TPAT
  {
    id: 'tpat1',
    name: 'TPAT1 ความถนัดแพทย์ (กสพท)',
    category: 'TPAT',
    code: 'TPAT1',
    description: 'เชาวน์ปัญญา จริยธรรมทางการแพทย์ และทักษะการคิดเชื่อมโยงความเป็นเหตุเป็นผล',
    defaultTopics: ['เชาวน์ปัญญาและคณิตศาสตร์ประยุกต์', 'จริยธรรมทางการแพทย์', 'ความคิดเชื่อมโยง (จับประเด็นและตรรกะ)'],
    optionsCount: 5,
    iconName: 'Stethoscope',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'tpat3',
    name: 'TPAT3 ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
    category: 'TPAT',
    code: 'TPAT3',
    description: 'การทดสอบความถนัดเชิงกล ฟิสิกส์วิศวกรรม ความคิดเชิงคำนวณ และการอ่านแบบมิติสัมพันธ์',
    defaultTopics: ['การทดสอบความถนัดเชิงกล (Mechanical Aptitude)', 'ความคิดเชิงคำนวณและวิทยาศาสตร์ประยุกต์', 'มิติสัมพันธ์และการอ่านแบบ', 'ความรู้ด้านเทคโนโลยีและสิ่งแวดล้อม'],
    optionsCount: 5,
    iconName: 'Cog',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'tpat5',
    name: 'TPAT5 ความถนัดครุศาสตร์/ศึกษาศาสตร์ (วิชาชีพครู)',
    category: 'TPAT',
    code: 'TPAT5',
    description: 'วัดทัศนคติต่อวิชาชีพครู จิตวิทยาการเรียนรู้ ความรอบรู้ทั่วไป และการแก้ปัญหาในสถานการณ์การสอน',
    defaultTopics: ['จิตวิทยาความเป็นครูและการแนะแนว', 'จริยธรรมและจรรยาบรรณวิชาชีพครู', 'ความรู้รอบตัวทางการศึกษาและการเปลี่ยนแปลงของโลก', 'การคิดวิเคราะห์แก้ปัญหานักเรียน'],
    optionsCount: 5,
    iconName: 'GraduationCap',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'tpat2',
    name: 'TPAT2 ความถนัดทางศิลปกรรมศาสตร์',
    category: 'TPAT',
    code: 'TPAT2',
    description: 'ทัศนศิลป์ ดนตรีสากล/ดนตรีไทย และศิลปะการแสดง',
    defaultTopics: ['ทัศนศิลป์ (Visual Arts)', 'ดนตรีสากลและดนตรีไทย (Music)', 'ศิลปะการแสดงและนาฏศิลป์ (Performing Arts)'],
    optionsCount: 5,
    iconName: 'Palette',
    color: 'from-violet-500 to-fuchsia-600',
  },
  {
    id: 'tpat4',
    name: 'TPAT4 ความถนัดทางสถาปัตยกรรมศาสตร์',
    category: 'TPAT',
    code: 'TPAT4',
    description: 'การคิดเชิงพื้นที่ สถาปัตยกรรม การออกแบบ และความรู้พื้นฐานงานโครงสร้าง',
    defaultTopics: ['การมองภาพ 3 มิติและ Perspective', 'สุนทรียศาสตร์และการออกแบบพื้นที่', 'โครงสร้างและวัสดุพื้นฐาน'],
    optionsCount: 5,
    iconName: 'Layers',
    color: 'from-amber-600 to-yellow-600',
  },

  // A-Level
  {
    id: 'alevel-math1',
    name: 'A-Level 61 คณิตศาสตร์ประยุกต์ 1 (พื้นฐาน + เพิ่มเติม)',
    category: 'A-Level',
    code: 'Math 1',
    description: 'สำหรับสายวิทย์และสายศิลป์คำนวณ ครอบคลุม แคลคูลัส เวกเตอร์ ตรีโกณมิติ เมทริกซ์ สถิติ ลำดับและอนุกรม',
    defaultTopics: ['แคลคูลัส (Calculus)', 'สถิติและความน่าจะเป็น', 'ฟังก์ชันเอกซ์โพเนนเชียลและลอการิทึม', 'ตรีโกณมิติ', 'เรขาคณิตวิเคราะห์และภาคตัดกรวย', 'เมทริกซ์และเวกเตอร์'],
    optionsCount: 5,
    iconName: 'Calculator',
    color: 'from-indigo-600 to-blue-700',
  },
  {
    id: 'alevel-physics',
    name: 'A-Level 64 ฟิสิกส์ (Physics)',
    category: 'A-Level',
    code: 'Physics',
    description: 'กลศาสตร์ คลื่น แสง เสียง ไฟฟ้ากระแสตรง/สลับ แม่เหล็กไฟฟ้า ฟิสิกส์อะตอมและนิวเคลียร์',
    defaultTopics: ['กลศาสตร์ (การเคลื่อนที่, กฎของนิวตัน, งานและพลังงาน)', 'คลื่นกล เสียง และแสงเชิงฟิสิกส์', 'ไฟฟ้าสถิต ไฟฟ้ากระแส และแม่เหล็ก', 'ฟิสิกส์อะตอมและนิวเคลียร์'],
    optionsCount: 5,
    iconName: 'Atom',
    color: 'from-sky-500 to-indigo-600',
  },
  {
    id: 'alevel-chem',
    name: 'A-Level 65 เคมี (Chemistry)',
    category: 'A-Level',
    code: 'Chemistry',
    description: 'โครงสร้างอะตอม ตารางธาตุ พันธะเคมี ปริมาณสารสัมพันธ์ อัตราการเกิดปฏิกิริยา สมดุลเคมี กรด-เบส เคมีอินทรีย์',
    defaultTopics: ['ปริมาณสารสัมพันธ์และแก๊ส', 'สมดุลเคมีและอัตราการเกิดปฏิกิริยา', 'กรด-เบส และไฟฟ้าเคมี', 'เคมีอินทรีย์และพอลิเมอร์'],
    optionsCount: 5,
    iconName: 'FlaskConical',
    color: 'from-teal-500 to-emerald-700',
  },
  {
    id: 'alevel-bio',
    name: 'A-Level 66 ชีววิทยา (Biology)',
    category: 'A-Level',
    code: 'Biology',
    description: 'พันธุศาสตร์ วิวัฒนาการ สรีรวิทยาของพืชและสัตว์ ระบบนิเวศ และเซลล์วิทยา',
    defaultTopics: ['เซลล์และกระบวนการทางชีวเคมี', 'พันธุศาสตร์และวิวัฒนาการ', 'โครงสร้างและการทำงานของสัตว์/มนุษย์', 'พืชและระบบนิเวศ'],
    optionsCount: 5,
    iconName: 'Dna',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'alevel-thai',
    name: 'A-Level 81 ภาษาไทย (Thai Language)',
    category: 'A-Level',
    code: 'Thai',
    description: 'การอ่านวิเคราะห์ การใช้ภาษาเพื่อการสื่อสาร การเขียน และหลักภาษาไทย',
    defaultTopics: ['การอ่านจับใจความและวิเคราะห์สาร', 'การใช้คำและสำนวนไทย', 'การเรียงประโยคและการสะกดคำ', 'วรรณศิลป์และภาพพจน์'],
    optionsCount: 5,
    iconName: 'BookOpen',
    color: 'from-amber-500 to-red-500',
  },
  {
    id: 'alevel-soc',
    name: 'A-Level 70 สังคมศึกษา (Social Studies)',
    category: 'A-Level',
    code: 'Social',
    description: 'ศาสนา หน้าที่พลเมือง เศรษฐศาสตร์ ประวัติศาสตร์ และภูมิศาสตร์',
    defaultTopics: ['หน้าที่พลเมือง วัฒนธรรม และกฎหมาย', 'เศรษฐศาสตร์จุลภาค/มหภาค', 'ประวัติศาสตร์ไทยและสากล', 'ภูมิศาสตร์และภัยพิบัติ', 'ศาสนาและจริยธรรม'],
    optionsCount: 5,
    iconName: 'Globe',
    color: 'from-orange-500 to-amber-700',
  },
  {
    id: 'alevel-eng',
    name: 'A-Level 82 ภาษาอังกฤษ (English)',
    category: 'A-Level',
    code: 'English',
    description: 'Reading Comprehension, Cloze Test, Paragraph Organization, Error Identification',
    defaultTopics: ['Reading Comprehension (Passages & Articles)', 'Cloze Test & Vocabulary', 'Paragraph Completion / Organization', 'Conversation in Situations'],
    optionsCount: 4,
    iconName: 'MessageSquare',
    color: 'from-blue-600 to-purple-600',
  },

  // O-NET
  {
    id: 'onet-m6-math',
    name: 'O-NET คณิตศาสตร์ (ม.6)',
    category: 'O-NET',
    code: 'ONET-M6-Math',
    description: 'ข้อสอบมาตรฐานวัดผลสัมฤทธิ์ทางการศึกษา วิชาคณิตศาสตร์พื้นฐานระดับชั้น ม.6',
    defaultTopics: ['จำนวนและพีชคณิต', 'การวัดและเรขาคณิต', 'สถิติและความน่าจะเป็นเบื้องต้น', 'ลำดับและอนุกรมพื้นฐาน'],
    optionsCount: 5,
    iconName: 'Percent',
    color: 'from-rose-500 to-pink-700',
  },
  {
    id: 'onet-m6-sci',
    name: 'O-NET วิทยาศาสตร์ทั่วไป (ม.6)',
    category: 'O-NET',
    code: 'ONET-M6-Sci',
    description: 'วิทยาศาสตร์กายภาพ วิทยาศาสตร์ชีวภาพ และโลก ดาราศาสตร์ อวกาศ',
    defaultTopics: ['สิ่งมีชีวิตและสิ่งแวดล้อม', 'สารและสมบัติของสาร', 'แรงและการเคลื่อนที่', 'โลก ดาราศาสตร์ และอวกาศ'],
    optionsCount: 5,
    iconName: 'Sparkles',
    color: 'from-emerald-500 to-teal-700',
  },

  // School
  {
    id: 'school-midterm',
    name: 'ข้อสอบกลางภาค / ปลายภาค โรงเรียน (ม.4 - ม.6)',
    category: 'School',
    code: 'School Exam',
    description: 'ข้อสอบตามตัวชี้วัดหลักสูตรแกนกลาง สพฐ. สำหรับเตรียมสอบเก็บคะแนนในโรงเรียน',
    defaultTopics: ['ม.4 เทอม 1 & 2', 'ม.5 เทอม 1 & 2', 'ม.6 เทอม 1 & 2', 'ฟิสิกส์ เคมี ชีวะ เลข พื้นฐาน/เพิ่มเติม'],
    optionsCount: 4,
    iconName: 'School',
    color: 'from-slate-600 to-zinc-800',
  },
];

// Sample default pre-cached mock exams for instant practice without waiting
export const SAMPLE_EXAMS: ExamData[] = [
  {
    id: 'sample-tgat1-01',
    title: 'TGAT1 Mini Mock Test: Speaking & Situational English',
    category: 'TGAT',
    subject: 'TGAT1 การสื่อสารภาษาอังกฤษ',
    topic: 'Short Conversations & Situations',
    difficulty: 'ปานกลาง',
    description: 'ชุดข้อสอบจำลอง TGAT1 เน้นทักษะการสื่อสารในชีวิตประจำวันตามแนว Test Blueprint ทปอ.',
    timeLimitMinutes: 10,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'sq1',
        questionText: 'Situation: Pim is having lunch with a coworker who looks very stressed and has not eaten anything.\nPim: "You look overwhelmed today. Is everything okay?"\nCoworker: "I have a massive presentation at 2 PM, and my slides were accidentally deleted."\nPim: "______________. Let me help you reassemble them quickly."',
        options: [
          'A. Never mind, you will fail anyway',
          'B. Take a deep breath and don\'t panic',
          'C. You should have eaten lunch earlier',
          'D. It is none of my business'
        ],
        correctOptionIndex: 1,
        explanation: 'ตัวเลือก B ("Take a deep breath and don\'t panic" - หายใจเข้าลึกๆ และอย่าเพิ่งตระหนกไป) เป็นคำตอบที่แสดงความเห็นอกเห็นใจและให้กำลังใจที่เหมาะสมที่สุดกับบริบท ก่อนจะเสนอตัวช่วยเหลือ (Let me help you reassemble them quickly)',
        subtopic: 'Conversational English',
        difficulty: 'ปานกลาง'
      },
      {
        id: 'sq2',
        questionText: 'Which sentence contains a GRAMMATICAL ERROR?\n\n(1) Neither the teacher nor the students (2) was aware that the examination room (3) had been changed (4) to the third floor.',
        options: [
          '(1) Neither the teacher nor the students',
          '(2) was aware that',
          '(3) had been changed',
          '(4) to the third floor'
        ],
        correctOptionIndex: 1,
        explanation: 'ข้อผิดพลาดอยู่ที่ส่วนที่ (2) เพราะตามกฎ Subject-Verb Agreement สำหรับ "Neither... nor..." กริยาจะต้องผันตามประธานตัวหลัง คือ "the students" (พหูพจน์) ดังนั้นจึงต้องแก้จาก "was aware" เป็น "were aware"',
        subtopic: 'Grammar & Error Identification',
        difficulty: 'ปานกลาง'
      },
      {
        id: 'sq3',
        questionText: 'Reading Passage:\n"Artificial intelligence tools in education are designed to complement, not replace, human educators. By handling repetitive grading tasks and generating adaptive practice problems, AI allows teachers to devote more time to mentoring and fostering critical thinking."\n\nAccording to the passage, what is the primary benefit of AI in classrooms?',
        options: [
          'A. Replacing human teachers entirely to cut costs',
          'B. Eliminating all forms of homework and examinations',
          'C. Freeing up teacher time for personalized guidance and critical thinking',
          'D. Forcing students to study computer engineering'
        ],
        correctOptionIndex: 2,
        explanation: 'passage ระบุชัดเจนว่า AI ช่วยงานซ้ำซ้อนเพื่อให้ครูมีเวลาไปทำ "mentoring and fostering critical thinking" (การให้คำปรึกษาและส่งเสริมการคิดวิเคราะห์)',
        subtopic: 'Reading Comprehension',
        difficulty: 'ง่าย'
      }
    ]
  },
  {
    id: 'sample-tgat2-01',
    title: 'TGAT2 ชุดจำลอง: ตรรกะและอนุกรมตัวเลข',
    category: 'TGAT',
    subject: 'TGAT2 การคิดอย่างมีเหตุผล',
    topic: 'อนุกรมและการคิดเชิงตรรกะ',
    difficulty: 'ปานกลาง',
    description: 'ฝึกกระบวนการคิดวิเคราะห์เชิงตัวเลขและตรรกศาสตร์ สอดคล้องกับข้อสอบ 92',
    timeLimitMinutes: 10,
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'sq2_1',
        questionText: 'จงหาจำนวนถัดไปของอนุกรม: 3, 7, 15, 31, 63, ...',
        options: [
          'ก. 125',
          'ข. 127',
          'ค. 129',
          'ง. 131',
          'จ. 135'
        ],
        correctOptionIndex: 1,
        explanation: 'รูปแบบของอนุกรมคือ การคูณ 2 แล้วบวก 1 หรือ ผลต่างเพิ่มขึ้นเป็น 2 เท่า:\n3 (+4) -> 7 (+8) -> 15 (+16) -> 31 (+32) -> 63 (+64) = 127\nสูตรลัด: 2^(n+1) - 1 สำหรับพจน์ที่ 6 คือ 2^7 - 1 = 128 - 1 = 127',
        subtopic: 'อนุกรมตัวเลข',
        difficulty: 'ปานกลาง'
      },
      {
        id: 'sq2_2',
        questionText: 'กำหนดให้:\n1. นักเรียนทุกคนที่สอบผ่าน TGAT จะต้องอ่านหนังสืออย่างน้อยวันละ 2 ชั่วโมง\n2. ภัทรไม่อ่านหนังสือเลยในสัปดาห์นี้\nข้อสรุปใดต่อไปนี้ "สมเหตุสมผลตามหลักตรรกศาสตร์ที่สุด"?',
        options: [
          'ก. ภัทรจะสอบผ่าน TGAT ได้อย่างแน่นอน',
          'ข. ภัทรจะต้องสอบไม่ผ่าน TGAT ในสัปดาห์นี้',
          'ค. ภัทรเป็นคนฉลาดจึงไม่ต้องอ่านหนังสือ',
          'ง. คนที่อ่านหนังสือวันละ 2 ชั่วโมงทุกคนจะสอบผ่าน TGAT',
          'จ. สรุปไม่ได้เพราะยังไม่ได้สอบ'
        ],
        correctOptionIndex: 1,
        explanation: 'ตามตรรกศาสตร์: ถ้า P แล้ว Q (ถ้าสอบผ่าน TGAT -> ต้องอ่าน >= 2 ชม.)\nแย้งสลับที่ (Contrapositive): ถ้าไม่ใช่ Q (ไม่อ่าน) -> ย่อมไม่ใช่ P (สอบไม่ผ่าน TGAT)\nดังนั้น ภัทรไม่อ่านหนังสือ จึงสรุปได้ว่าภัทรจะสอบไม่ผ่าน TGAT',
        subtopic: 'การคิดเชิงเหตุผล (Logical Deduction)',
        difficulty: 'ปานกลาง'
      }
    ]
  }
];

export const INITIAL_USER_PROFILE = {
  id: 'user-tcas-1',
  name: 'นักเรียน TCAS69',
  email: 'pasitmorakanun12@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  gradeLevel: 'มัธยมศึกษาปีที่ 6',
  dreamFaculty: 'คณะแพทยศาสตร์ / วิศวกรรมศาสตร์',
  dreamUniversity: 'จุฬาลงกรณ์มหาวิทยาลัย',
  targetScoreTGAT: 85,
  targetScoreTPAT: 80,
  targetScoreALevel: 75,
  dailyGoalQuestions: 15,
  streakDays: 5,
  joinedDate: '2026-08-01',
};
