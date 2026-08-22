import { UserProfile, ExamHistoryItem, ExamData, ChatMessage, AnalysisReport } from '../types';
import { INITIAL_USER_PROFILE, SAMPLE_EXAMS } from '../data/examCatalog';

const KEYS = {
  USER_PROFILE: 'ai_exam_user_profile',
  EXAM_HISTORY: 'ai_exam_history',
  SAVED_EXAMS: 'ai_exam_saved_list',
  CHAT_MESSAGES: 'ai_exam_chat_messages',
  LATEST_ANALYSIS: 'ai_exam_latest_analysis',
  IS_LOGGED_IN: 'ai_exam_is_logged_in',
};

// Safe JSON parser
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const StorageService = {
  getProfile: (): UserProfile => {
    return safeGet<UserProfile>(KEYS.USER_PROFILE, INITIAL_USER_PROFILE);
  },

  saveProfile: (profile: UserProfile): void => {
    safeSet(KEYS.USER_PROFILE, profile);
  },

  isLoggedIn: (): boolean => {
    return safeGet<boolean>(KEYS.IS_LOGGED_IN, true);
  },

  setLoggedIn: (loggedIn: boolean): void => {
    safeSet(KEYS.IS_LOGGED_IN, loggedIn);
  },

  getExamHistory: (): ExamHistoryItem[] => {
    return safeGet<ExamHistoryItem[]>(KEYS.EXAM_HISTORY, [
      {
        id: 'hist-demo-1',
        examId: 'sample-tgat1-01',
        title: 'TGAT1 Mini Mock Test: Speaking & Situational English',
        category: 'TGAT',
        subject: 'TGAT1 การสื่อสารภาษาอังกฤษ',
        difficulty: 'ปานกลาง',
        score: 3,
        totalQuestions: 3,
        percentage: 100,
        timeSpentSeconds: 145,
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        questions: SAMPLE_EXAMS[0].questions,
      },
    ]);
  },

  saveExamAttempt: (item: ExamHistoryItem): void => {
    const history = StorageService.getExamHistory();
    const updated = [item, ...history];
    safeSet(KEYS.EXAM_HISTORY, updated);

    // Update streak if today
    const profile = StorageService.getProfile();
    profile.streakDays = (profile.streakDays || 0) + 1;
    StorageService.saveProfile(profile);
  },

  getSavedExams: (): ExamData[] => {
    return safeGet<ExamData[]>(KEYS.SAVED_EXAMS, SAMPLE_EXAMS);
  },

  saveExam: (exam: ExamData): void => {
    const list = StorageService.getSavedExams();
    // check if already exists
    const existingIndex = list.findIndex((e) => e.id === exam.id);
    if (existingIndex >= 0) {
      list[existingIndex] = exam;
    } else {
      list.unshift(exam);
    }
    safeSet(KEYS.SAVED_EXAMS, list);
  },

  deleteExam: (examId: string): void => {
    const list = StorageService.getSavedExams().filter((e) => e.id !== examId);
    safeSet(KEYS.SAVED_EXAMS, list);
  },

  getChatMessages: (): ChatMessage[] => {
    return safeGet<ChatMessage[]>(KEYS.CHAT_MESSAGES, [
      {
        id: 'msg-welcome',
        role: 'model',
        content: `สวัสดีครับ! ยินดีต้อนรับสู่ **AI Exam Coach** ติวเตอร์อัจฉริยะสำหรับเตรียมสอบ TGAT, TPAT, A-Level, O-NET และข้อสอบโรงเรียน 🎯

คุณสามารถ:
1. **ถามเจาะลึกเนื้อหาหรือสูตร**: เช่น *"ขอเทคนิคทำโจทย์อนุกรม TGAT2 แบบเร็ว"*, *"สรุปสูตรแคลคูลัส A-Level 61"*, *"วิเคราะห์ความแตกต่างระหว่าง TGAT3 แต่ละพาร์ท"*
2. **สร้างโจทย์ฝึกทำ**: ให้ AI ออกโจทย์เฉพาะเรื่องที่ยังไม่มั่นใจ
3. **ช่วยเฉลยข้อสอบ**: พิมพ์โจทย์มาให้ผมอธิบายวิธีคิดเป็นขั้นเป็นตอนได้เลยครับ!

วันนี้อยากเริ่มติววิชาไหนเป็นพิเศษดีครับ?`,
        timestamp: new Date().toISOString(),
        suggestedQuestions: [
          'สรุปโครงสร้างข้อสอบ TGAT 1, 2, 3 ปีล่าสุด',
          'ขอเทคนิคการทำข้อสอบ TPAT3 ความถนัดวิศวะ/วิทย์',
          'สรุปสูตรลัดฟิสิกส์ A-Level เรื่องการเคลื่อนที่',
          'วางแผนอ่านหนังสือสอบ TCAS ภายใน 3 เดือน',
        ],
      },
    ]);
  },

  saveChatMessages: (messages: ChatMessage[]): void => {
    safeSet(KEYS.CHAT_MESSAGES, messages);
  },

  getLatestAnalysis: (): AnalysisReport | null => {
    return safeGet<AnalysisReport | null>(KEYS.LATEST_ANALYSIS, null);
  },

  saveLatestAnalysis: (analysis: AnalysisReport): void => {
    safeSet(KEYS.LATEST_ANALYSIS, analysis);
  },

  clearAllData: (): void => {
    localStorage.removeItem(KEYS.EXAM_HISTORY);
    localStorage.removeItem(KEYS.CHAT_MESSAGES);
    localStorage.removeItem(KEYS.LATEST_ANALYSIS);
  },
};
