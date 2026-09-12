export type GradeLevel =
  | 'ป.1'
  | 'ป.2'
  | 'ป.3'
  | 'ป.4'
  | 'ป.5'
  | 'ป.6'
  | 'ม.1'
  | 'ม.2'
  | 'ม.3'
  | 'ม.4'
  | 'ม.5'
  | 'ม.6';

export type SubjectCategory = 'วิชาพื้นฐาน' | 'วิชาเพิ่มเติม' | 'เตรียมสอบ';

export type ExamCategory = 'TGAT' | 'TPAT' | 'A-Level' | 'O-NET' | 'School';

export interface SubtopicItem {
  id: string;
  name: string;
}

export interface TopicItem {
  id: string;
  name: string;
  subtopics: SubtopicItem[];
}

export interface LessonItem {
  id: string;
  name: string;
  topics: TopicItem[];
}

export interface SubjectItem {
  id: string;
  name: string;
  category: SubjectCategory;
  gradeLevel: GradeLevel;
  code?: string;
  description?: string;
  iconName?: string;
  color?: string;
  lessons: LessonItem[];
}

export interface CurriculumGrade {
  gradeLevel: GradeLevel;
  label: string;
  categories: SubjectCategory[];
  subjects: SubjectItem[];
}

export interface ExamSubjectConfig {
  id: string;
  name: string;
  category: ExamCategory;
  gradeLevel?: GradeLevel;
  code?: string;
  description: string;
  defaultTopics: string[];
  optionsCount: number;
  iconName: string;
  color: string;
}

export type ExamStatus = 'กำลังประมวลผล' | 'ตรวจสอบแล้ว' | 'พร้อมใช้งาน' | 'มีข้อผิดพลาด';

export interface Question {
  id: string;
  questionNumber?: number;
  gradeLevel: GradeLevel;
  subjectCategory: SubjectCategory;
  subject: string;
  lesson: string;
  topic: string;
  subtopic: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number | null; // null if no answer key in PDF
  explanation: string;
  difficulty?: string;
  imageUrl?: string;
  images?: string[];
  diagramSvg?: string;
  diagramUrl?: string;
  tableMarkdown?: string;
  optionImages?: (string | null | undefined)[];
  userSelectedIndex?: number;
  isFlagged?: boolean;
  sourcePage?: number;
  sourcePages?: number[];
  needsReview?: boolean;
  reviewNote?: string;
  rawOcrText?: string;
  hasDiagram?: boolean;
}

export interface ExamData {
  id: string;
  title: string;
  gradeLevel: GradeLevel;
  subjectCategory: SubjectCategory;
  subject: string;
  lesson?: string;
  topic?: string;
  subtopic?: string;
  category: ExamCategory;
  examType?: string;
  difficulty: 'ง่าย' | 'ปานกลาง' | 'ยาก' | 'ระดับข้อสอบจริง';
  description?: string;
  timeLimitMinutes: number;
  questions: Question[];
  createdAt: string;
  updatedAt?: string;
  examCode?: string;
  term?: string;
  year?: string;
  isOfficial?: boolean;
  importedBy?: 'admin' | 'official' | string;
  isAiGenerated?: boolean;
  questionFormat?: string;
  totalQuestions?: number;
  totalPages?: number;
  source?: string;
  sourceFile?: string;
  status?: ExamStatus;
  reviewedBy?: string;
  needsReviewCount?: number;
  diagramsCount?: number;
}

export interface ExamHistoryItem {
  id: string;
  examId: string;
  title: string;
  gradeLevel?: GradeLevel;
  subjectCategory?: SubjectCategory;
  subject: string;
  lesson?: string;
  topic?: string;
  subtopic?: string;
  category: ExamCategory;
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
  gradeLevel?: GradeLevel;
  subject?: string;
  isError?: boolean;
  retryPrompt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  school?: string; // e.g. โรงเรียนเตรียมอุดมศึกษา
  targetExam?: string; // e.g. TGAT, TPAT1, A-Level
  gradeLevel: GradeLevel | string; // ป.1 - ม.6
  dreamFaculty: string; // e.g. คณะแพทยศาสตร์, คณะวิศวกรรมศาสตร์
  dreamMajor?: string; // e.g. สาขาวิศวกรรมคอมพิวเตอร์
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
