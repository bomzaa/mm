export type ExamCategory = 'TGAT' | 'TPAT' | 'A-Level' | 'O-NET' | 'School';

export interface ExamSubjectConfig {
  id: string;
  name: string;
  category: ExamCategory;
  code?: string;
  description: string;
  defaultTopics: string[];
  optionsCount: number;
  iconName: string;
  color: string;
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  subtopic?: string;
  difficulty?: string;
  userSelectedIndex?: number;
  isFlagged?: boolean;
}

export interface ExamData {
  id: string;
  title: string;
  category: ExamCategory;
  subject: string;
  topic?: string;
  difficulty: 'ง่าย' | 'ปานกลาง' | 'ยาก' | 'ระดับข้อสอบจริง';
  description?: string;
  timeLimitMinutes: number;
  questions: Question[];
  createdAt: string;
}

export interface ExamHistoryItem {
  id: string;
  examId: string;
  title: string;
  category: ExamCategory;
  subject: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  questions: Question[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  suggestedQuestions?: string[];
  category?: ExamCategory;
  subject?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  gradeLevel: string; // ม.4, ม.5, ม.6, เด็กซิ่ว, etc.
  dreamFaculty: string; // e.g. คณะแพทยศาสตร์, คณะวิศวกรรมศาสตร์
  dreamUniversity: string; // e.g. จุฬาลงกรณ์มหาวิทยาลัย, มหาวิทยาลัยเกษตรศาสตร์
  targetScoreTGAT: number; // e.g. 80
  targetScoreTPAT: number; // e.g. 75
  targetScoreALevel: number; // e.g. 70
  dailyGoalQuestions: number;
  streakDays: number;
  joinedDate: string;
}

export interface AnalysisReport {
  readinessScore: number;
  estimatedPercentile: string;
  overview: string;
  targetFacultyFeedback: string;
  strengths: { topic: string; detail: string }[];
  weaknesses: { topic: string; detail: string; priority: string }[];
  weeklyPlan: { day: string; focus: string; action: string }[];
  tips: string[];
  analyzedAt: string;
}
