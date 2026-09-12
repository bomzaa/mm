import { ExamData, Question } from '../types';
import { TPAT3_DEC_66_PART_1 } from './tpat3Dec66Part1';
import { TPAT3_DEC_66_PART_2 } from './tpat3Dec66Part2';

export const TPAT3_DEC_66_ALL_QUESTIONS: Question[] = [
  ...TPAT3_DEC_66_PART_1,
  ...TPAT3_DEC_66_PART_2,
];

export const TPAT3_DEC_66_COMPLETE_EXAM: ExamData = {
  id: 'tpat3-dec-66',
  title: 'แนวข้อสอบ TPAT3 ธ.ค. 66 (ฉบับจริงสมบูรณ์ 70 ข้อ)',
  category: 'TPAT',
  examType: 'TPAT3',
  examCode: 'TPAT3',
  term: 'ธ.ค. 66',
  year: '2566',
  gradeLevel: 'ม.6',
  subjectCategory: 'เตรียมสอบ',
  subject: 'TPAT 3: ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
  lesson: 'แนวข้อสอบ TPAT3 ธ.ค. 66',
  topic: 'การทดสอบความถนัดเชิงวิศวกรรม วิทยาศาสตร์ และเทคโนโลยี',
  subtopic: 'คลังข้อสอบจริงครบ 70 ข้อ พร้อมรูปภาพแผนภาพและเลขหน้าต้นฉบับ',
  difficulty: 'ระดับข้อสอบจริง',
  description: 'นำเข้าจากเอกสาร PDF "แนวข้อสอบ TPAT3 ธ.ค. 66.pdf" ครบทั้ง 45 หน้า รวม 70 ข้อ (ตอนที่ 1: ความถนัดด้านตัวเลข, มิติสัมพันธ์, เชิงกลและฟิสิกส์ 45 ข้อ และตอนที่ 2: ความคิดและความสนใจข่าวสารวิทยาศาสตร์ฯ 25 ข้อ) พร้อมแผนภาพทางวิศวกรรมและเลขหน้าอ้างอิงจากต้นฉบับอย่างสมบูรณ์',
  timeLimitMinutes: 180,
  questions: TPAT3_DEC_66_ALL_QUESTIONS,
  totalQuestions: 70,
  totalPages: 45,
  source: 'แนวข้อสอบ TPAT3 ธ.ค. 66 (ทปอ. Blueprint by Physics Blueprint)',
  sourceFile: 'แนวข้อสอบ TPAT3 ธ.ค. 66.pdf',
  isOfficial: true,
  importedBy: 'admin',
  isAiGenerated: false,
  status: 'พร้อมใช้งาน',
  reviewedBy: 'Admin (Verified with PDF)',
  createdAt: '2023-12-15T09:00:00.000Z',
  updatedAt: new Date().toISOString(),
  diagramsCount: TPAT3_DEC_66_ALL_QUESTIONS.filter((q) => q.hasDiagram || !!q.diagramSvg).length,
  needsReviewCount: TPAT3_DEC_66_ALL_QUESTIONS.filter((q) => q.needsReview).length,
};
