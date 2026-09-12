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
    const rawList = safeGet<ExamHistoryItem[]>(KEYS.EXAM_HISTORY, [
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

    // Deduplicate by ID
    const seenIds = new Set<string>();
    const deduplicated: ExamHistoryItem[] = [];
    for (const item of rawList) {
      if (item && item.id && !seenIds.has(item.id)) {
        seenIds.add(item.id);
        deduplicated.push(item);
      }
    }
    return deduplicated;
  },

  saveExamAttempt: (item: ExamHistoryItem): void => {
    const history = StorageService.getExamHistory();
    // Filter out any existing item with the same id to prevent duplicate keys
    const filtered = history.filter((h) => h.id !== item.id);
    const updated = [item, ...filtered];
    safeSet(KEYS.EXAM_HISTORY, updated);

    // Update streak if today
    const profile = StorageService.getProfile();
    profile.streakDays = (profile.streakDays || 0) + 1;
    StorageService.saveProfile(profile);
  },

  deleteExamAttempt: (id: string): void => {
    const history = StorageService.getExamHistory().filter((item) => item.id !== id);
    safeSet(KEYS.EXAM_HISTORY, history);
  },

  clearExamHistory: (): void => {
    safeSet(KEYS.EXAM_HISTORY, []);
  },

  getSavedExams: (): ExamData[] => {
    return safeGet<ExamData[]>(KEYS.SAVED_EXAMS, SAMPLE_EXAMS);
  },

  getAllExams: (): ExamData[] => {
    return StorageService.getSavedExams();
  },

  getExam: (examId: string): ExamData | null => {
    const list = StorageService.getSavedExams();
    return list.find((e) => e.id === examId) || null;
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

  saveCustomExam: (exam: ExamData): void => {
    StorageService.saveExam(exam);
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
        content: `สวัสดีครับ! ยินดีต้อนรับสู่ AI Study Buddy Smart Learning Station 🚀 ผมเป็นผู้ช่วยเรียนรู้ AI ของคุณ สามารถถามเนื้อหาบทเรียน เฉลยข้อสอบ ให้ช่วยอธิบายโจทย์ หรือวิเคราะห์จุดแข็งจุดอ่อนได้เลยครับ!`,
        timestamp: new Date().toISOString(),
        suggestedQuestions: [
          'อธิบายเรื่องฟังก์ชันคณิตศาสตร์',
          'เฉลยโจทย์ภาษาอังกฤษ Grammar',
          'วิเคราะห์จุดแข็งจุดอ่อนการเรียน',
          'สร้างโจทย์ฝึกหัดเพิ่มอีก 3 ข้อ',
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
