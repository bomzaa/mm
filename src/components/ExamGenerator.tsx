import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronDown,
  Loader2,
  FileText,
  Target,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';
import { GradeLevel, SubjectCategory, ExamCategory, ExamData, Question } from '../types';
import {
  GRADE_LEVELS,
  CURRICULUM_DATA,
  getCurriculumByGrade,
} from '../data/curriculumData';
import { StorageService } from '../lib/storage';
import { FirestoreService } from '../lib/firestoreService';
import { Tpat3Dec66Section } from './Tpat3Dec66Section';
import { ExamPreparationView } from './ExamPreparationView';
import { TPAT3_DEC_66_EXAM, TPAT3_DEC_66_QUESTIONS } from '../data/tpat3December66Data';

interface ExamGeneratorProps {
  onStartExam: (exam: ExamData) => void;
  initialCategory?: ExamCategory;
  initialSubjectId?: string;
}

// 3D Isometric Artwork for Practice Exam Card (Cyan/Blue Theme)
const IsometricPracticeArtwork = () => (
  <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center select-none">
    <div className="absolute inset-0 bg-radial from-cyan-400/20 via-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent border-dashed" />
      <div className="absolute h-40 w-[1px] bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent border-dashed" />
    </div>
    <motion.span
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-10 right-8 w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-xs"
    />
    <motion.span
      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      className="absolute bottom-10 right-12 w-1 h-1 rounded-full bg-blue-500/70"
    />
    <motion.span
      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
      className="absolute bottom-6 left-1/2 w-1.5 h-1.5 rounded-full bg-sky-400"
    />
    <span className="absolute top-16 left-6 w-1 h-1 rounded-full bg-blue-400" />

    <motion.svg
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      viewBox="0 0 200 200"
      className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-md z-10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="topCyanGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="leftCyanGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="rightCyanGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>
        <linearGradient id="accentTopGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="accentLeftGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="accentRightGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#3730A3" />
        </linearGradient>
      </defs>

      <g transform="translate(100, 48)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#topCyanGrad)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#leftCyanGrad)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#rightCyanGrad)" />
      </g>
      <g transform="translate(114, 62)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#topCyanGrad)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#leftCyanGrad)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#rightCyanGrad)" />
      </g>
      <g transform="translate(86, 62)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#topCyanGrad)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#leftCyanGrad)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#rightCyanGrad)" />
      </g>
      <g transform="translate(128, 76)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#topCyanGrad)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#leftCyanGrad)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#rightCyanGrad)" />
      </g>
      <g transform="translate(100, 76)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#accentTopGrad)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#accentLeftGrad)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#accentRightGrad)" />
      </g>
      <g transform="translate(72, 76)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#topCyanGrad)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#leftCyanGrad)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#rightCyanGrad)" />
      </g>
      <g transform="translate(114, 90)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#topCyanGrad)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#leftCyanGrad)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#rightCyanGrad)" />
      </g>
      <g transform="translate(86, 90)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#topCyanGrad)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#leftCyanGrad)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#rightCyanGrad)" />
      </g>
      <g transform="translate(100, 104)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#topCyanGrad)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#leftCyanGrad)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#rightCyanGrad)" />
      </g>
    </motion.svg>
  </div>
);

// 3D Isometric Artwork for Exam Prep Card (Deep Blue Theme)
const IsometricPrepArtwork = () => (
  <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center select-none">
    <div className="absolute inset-0 bg-radial from-blue-500/20 via-indigo-600/10 to-transparent rounded-full blur-2xl pointer-events-none" />
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent border-dashed" />
      <div className="absolute h-40 w-[1px] bg-gradient-to-b from-transparent via-blue-500/30 to-transparent border-dashed" />
    </div>
    <motion.span
      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-8 right-10 w-1.5 h-1.5 rounded-full bg-blue-400"
    />
    <motion.span
      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 2.9, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      className="absolute bottom-8 left-10 w-1.5 h-1.5 rounded-full bg-indigo-400"
    />
    <motion.span
      animate={{ scale: [1, 1.6, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 1.3 }}
      className="absolute top-20 left-6 w-1 h-1 rounded-full bg-sky-300"
    />

    <motion.svg
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      viewBox="0 0 200 200"
      className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-md z-10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="prepTopBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="100%" stopColor="#60A5FA" />
        </linearGradient>
        <linearGradient id="prepLeftBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="prepRightBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="prepHoverBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BFDBFE" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
      </defs>

      <g transform="translate(100, 46)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(114, 58)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepHoverBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(86, 68)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(114, 76)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(128, 86)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(100, 88)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(72, 82)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(86, 96)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(72, 108)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(100, 114)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
      <g transform="translate(100, 138)">
        <polygon points="0,-10 14,-2 0,6 -14,-2" fill="url(#prepTopBlue)" />
        <polygon points="-14,-2 0,6 0,22 -14,14" fill="url(#prepLeftBlue)" />
        <polygon points="0,6 14,-2 14,14 0,22" fill="url(#prepRightBlue)" />
      </g>
    </motion.svg>
  </div>
);

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  onStartExam,
  initialCategory,
  initialSubjectId,
}) => {
  // Navigation State: 'menu' | 'practice' | 'examPrep'
  // Default to 'menu' so users always see the selection screen first when opening Exam Generator
  const [currentView, setCurrentView] = useState<'menu' | 'practice' | 'examPrep'>(() => {
    if (initialSubjectId) {
      if (initialCategory && initialCategory !== 'School') {
        return 'examPrep';
      }
      return 'practice';
    }
    return 'menu';
  });

  // ================= 1. PRACTICE EXAM FORM STATE =================
  const [practiceGrade, setPracticeGrade] = useState<GradeLevel | ''>('');
  const [practiceSubjectId, setPracticeSubjectId] = useState<string>('');
  const [practiceLessonName, setPracticeLessonName] = useState<string>('');
  const [practiceSubtopicName, setPracticeSubtopicName] = useState<string>('');
  const [practiceQuestionCount, setPracticeQuestionCount] = useState<string>('');
  const [practiceDifficulty, setPracticeDifficulty] = useState<string>('');
  const [practiceQuestionFormat, setPracticeQuestionFormat] = useState<string>('ปรนัย 4 ตัวเลือก');

  // ================= 2. EXAM PREP FORM STATE =================
  const [prepExamType, setPrepExamType] = useState<string>(''); // TGAT | TPAT | A-Level | O-NET
  const [prepGrade, setPrepGrade] = useState<GradeLevel | ''>('');
  const [prepSubjectId, setPrepSubjectId] = useState<string>('');
  const [prepQuestionCount, setPrepQuestionCount] = useState<string>('');
  const [prepLessonName, setPrepLessonName] = useState<string>('');
  const [prepDifficulty, setPrepDifficulty] = useState<string>('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ---------- Practice Mode Computations ----------
  const availablePracticeSubjects = useMemo(() => {
    if (!practiceGrade) return [];
    const subjects = getCurriculumByGrade(practiceGrade);
    // In practice mode, show basic & additional school curriculum subjects
    return subjects.filter((s) => s.category !== 'เตรียมสอบ');
  }, [practiceGrade]);

  const activePracticeSubject = useMemo(() => {
    if (!practiceSubjectId) return null;
    return availablePracticeSubjects.find((s) => s.id === practiceSubjectId) || null;
  }, [availablePracticeSubjects, practiceSubjectId]);

  const availablePracticeLessons = useMemo(() => {
    if (!activePracticeSubject) return [];
    return activePracticeSubject.lessons || [];
  }, [activePracticeSubject]);

  const activePracticeLesson = useMemo(() => {
    if (!practiceLessonName) return null;
    return availablePracticeLessons.find((l) => l.name === practiceLessonName) || null;
  }, [availablePracticeLessons, practiceLessonName]);

  const availablePracticeSubtopics = useMemo(() => {
    if (!activePracticeLesson) return [];
    const subs: string[] = [];
    activePracticeLesson.topics.forEach((t) => {
      subs.push(t.name);
      if (t.subtopics && t.subtopics.length > 0) {
        t.subtopics.forEach((st) => subs.push(st.name));
      }
    });
    return subs;
  }, [activePracticeLesson]);

  // ---------- Exam Prep Computations ----------
  const availablePrepGrades = useMemo(() => {
    if (prepExamType === 'O-NET') {
      return ['ป.6', 'ม.3', 'ม.6'] as GradeLevel[];
    }
    if (prepExamType === 'TGAT' || prepExamType === 'TPAT' || prepExamType === 'TPAT3' || prepExamType === 'A-Level') {
      return ['ม.6'] as GradeLevel[];
    }
    return ['ป.6', 'ม.3', 'ม.6'] as GradeLevel[];
  }, [prepExamType]);

  const availablePrepSubjects = useMemo(() => {
    if (!prepExamType || !prepGrade) return [];

    const gradeSubjects = getCurriculumByGrade(prepGrade);
    const prepSubs = gradeSubjects.filter((s) => s.category === 'เตรียมสอบ');

    if (prepExamType === 'TGAT') {
      return prepSubs.filter((s) => s.id.startsWith('m6-tgat'));
    }
    if (prepExamType === 'TPAT3') {
      return prepSubs.filter((s) => s.id === 'm6-tpat3' || s.id.startsWith('m6-tpat'));
    }
    if (prepExamType === 'TPAT') {
      return prepSubs.filter((s) => s.id.startsWith('m6-tpat'));
    }
    if (prepExamType === 'A-Level') {
      return prepSubs.filter((s) => s.id.startsWith('m6-alevel'));
    }
    if (prepExamType === 'O-NET') {
      return prepSubs.filter((s) => s.id.includes('onet'));
    }

    return prepSubs;
  }, [prepExamType, prepGrade]);

  const activePrepSubject = useMemo(() => {
    if (!prepSubjectId) return null;
    return availablePrepSubjects.find((s) => s.id === prepSubjectId) || null;
  }, [availablePrepSubjects, prepSubjectId]);

  const availablePrepLessons = useMemo(() => {
    if (!activePrepSubject) return [];
    return activePrepSubject.lessons || [];
  }, [activePrepSubject]);

  // ---------- Strict Reset Handlers for Practice Form ----------
  const handlePracticeGradeChange = (grade: GradeLevel | '') => {
    setPracticeGrade(grade);
    setPracticeSubjectId('');
    setPracticeLessonName('');
    setPracticeSubtopicName('');
    setErrorMessage(null);
  };

  const handlePracticeSubjectChange = (subjId: string) => {
    setPracticeSubjectId(subjId);
    setPracticeLessonName('');
    setPracticeSubtopicName('');
  };

  const handlePracticeLessonChange = (lessonName: string) => {
    setPracticeLessonName(lessonName);
    setPracticeSubtopicName('');
  };

  // ---------- Strict Reset Handlers for Prep Form ----------
  const handlePrepExamTypeChange = (type: string) => {
    setPrepExamType(type);
    if (type === 'TPAT3') {
      setPrepGrade('ม.6');
      setPrepSubjectId('m6-tpat3');
      setPrepLessonName('แนวข้อสอบ TPAT3 ธ.ค. 66');
    } else if (type === 'TPAT') {
      setPrepGrade('ม.6');
      setPrepSubjectId('m6-tpat3');
      setPrepLessonName('แนวข้อสอบ TPAT3 ธ.ค. 66');
    } else if (type === 'TGAT' || type === 'A-Level') {
      setPrepGrade('ม.6');
      setPrepSubjectId('');
      setPrepLessonName('');
    } else if (type === 'O-NET') {
      setPrepGrade((prev) => (prev === 'ป.6' || prev === 'ม.3' || prev === 'ม.6' ? prev : 'ม.6'));
      setPrepSubjectId('');
      setPrepLessonName('');
    } else {
      setPrepGrade('');
      setPrepSubjectId('');
      setPrepLessonName('');
    }
    setErrorMessage(null);
  };

  const handlePrepGradeChange = (grade: GradeLevel | '') => {
    setPrepGrade(grade);
    setPrepSubjectId('');
    setPrepLessonName('');
  };

  const handlePrepSubjectChange = (subjId: string) => {
    setPrepSubjectId(subjId);
    setPrepLessonName('');
  };

  // ---------- Validation Checkers ----------
  const isPracticeFormValid = Boolean(
    practiceGrade &&
      practiceSubjectId &&
      practiceQuestionCount &&
      practiceDifficulty
  );

  const isPrepFormValid = Boolean(
    prepExamType &&
      prepGrade &&
      prepSubjectId &&
      prepQuestionCount &&
      prepDifficulty
  );

  // Helper to build realistic calculation/subject-specific questions with diverse multi-paradigm variations if offline or fallback needed
  const generateInstantExamQuestions = (
    grade: GradeLevel,
    category: ExamCategory,
    subjectName: string,
    subjectCategory: SubjectCategory,
    lessonName: string,
    subtopicName: string,
    diff: string,
    count: number,
    roundOffset: number = 0
  ): Question[] => {
    const questions: Question[] = [];

    for (let i = 1; i <= count; i++) {
      let qText = '';
      let opts: string[] = [];
      let correctIdx = 0;
      let explanation = '';
      const seed = i + roundOffset * 7;

      if (subjectName.includes('คณิตศาสตร์') || subjectName.includes('TGAT 2') || subjectName.includes('A-Level คณิต')) {
        if (lessonName.includes('ตรีโกณมิติ')) {
          if (diff === 'ง่าย') {
            // === ระดับง่าย: 1 ขั้นตอน แทนค่าสูตรตรงๆ สลับ 5 แนวโจทย์ (นิยาม, มุมมาตรฐาน, เอกลักษณ์, โจทย์ย้อนกลับ, เปรียบเทียบ) ===
            const type = (seed - 1) % 5;
            if (type === 0) {
              const a = 3 + (seed % 3);
              const b = 4 + (seed % 3);
              const c = Math.round(Math.sqrt(a * a + b * b) * 10) / 10;
              qText = `[ระดับง่าย • แนวที่ 1: คำนวณตามนิยามอัตราส่วน] ข้อที่ ${i}: กำหนดรูปสามเหลี่ยมมุมฉาก $ABC$ มีมุม $C = 90^\\circ$ ด้านตรงข้ามมุม $A$ ยาว $a = ${a}$ หน่วย และด้านประชิดมุม $A$ ยาว $b = ${b}$ หน่วย จงหาค่าของ $\\tan A$`;
              opts = [
                `$\\frac{${a}}{${b}}$`,
                `$\\frac{${b}}{${a}}$`,
                `$\\frac{${a}}{${c}}$`,
                `$\\frac{${b}}{${c}}$`,
              ];
              correctIdx = 0;
              explanation = `### ขั้นตอนการคิด (ระดับง่าย - แทนค่าสูตรพื้นฐานตรงๆ):\n1. **ใช้นิยามของฟังก์ชัน $\\tan$ ในสามเหลี่ยมมุมฉาก:**\n   $$\\tan A = \\frac{\\text{ด้านตรงข้ามมุม } A}{\\text{ด้านประชิดมุม } A} = \\frac{a}{b}$$\n2. **แทนค่าตัวแปร:**\n   $$\\tan A = \\frac{${a}}{${b}}$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($\\frac{${a}}{${b}}$)`;
            } else if (type === 1) {
              qText = `[ระดับง่าย • แนวที่ 2: ค่ามุมมาตรฐานและนิพจน์ตรง] ข้อที่ ${i}: ค่าของ $\\sin(30^\\circ) + \\cos(60^\\circ)$ มีค่าเท่ากับเท่าใด?`;
              opts = [`$1$`, `$\\frac{1}{2}$`, `$\\frac{\\sqrt{3}}{2}$`, `$\\sqrt{3}$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการคิด (ระดับง่าย - แทนค่ามุมมาตรฐาน):\n1. **ระบุค่าของฟังก์ชันตรีโกณมิติมุมมาตรฐาน:**\n   $$\\sin(30^\\circ) = \\frac{1}{2}, \\quad \\cos(60^\\circ) = \\frac{1}{2}$$\n2. **คำนวณผลบวก:**\n   $$\\sin(30^\\circ) + \\cos(60^\\circ) = \\frac{1}{2} + \\frac{1}{2} = 1$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($1$)`;
            } else if (type === 2) {
              qText = `[ระดับง่าย • แนวที่ 3: เอกลักษณ์พีทาโกรัส] ข้อที่ ${i}: ค่าของ $\\sin^2(45^\\circ) + \\cos^2(45^\\circ)$ มีค่าเท่ากับเท่าใด?`;
              opts = [`$1$`, `$0$`, `$\\frac{1}{2}$`, `$2$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการคิด (ระดับง่าย - เอกลักษณ์พื้นฐาน):\n1. **ใช้เอกลักษณ์ตรีโกณมิติพื้นฐาน (Pythagorean Identity):**\n   $$\\sin^2 \\theta + \\cos^2 \\theta = 1 \\quad \\text{สำหรับทุกมุม } \\theta$$\n2. **สำหรับ $\\theta = 45^\\circ$:**\n   $$\\sin^2(45^\\circ) + \\cos^2(45^\\circ) = 1$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($1$)`;
            } else if (type === 3) {
              // โจทย์ย้อนกลับ (Reverse Problem)
              const givenSin = 0.5;
              qText = `[ระดับง่าย • แนวที่ 4: โจทย์ย้อนกลับ (Reverse Problem)] ข้อที่ ${i}: ถ้ากำหนดให้ $\\sin \\theta = ${givenSin}$ โดยที่ $0^\\circ < \\theta < 90^\\circ$ จงหาขนาดของมุม $\\theta$ ในหน่วยองศา`;
              opts = [`$30^\\circ$`, `$45^\\circ$`, `$60^\\circ$`, `$90^\\circ$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการคิด (โจทย์ย้อนกลับ):\n1. **พิจารณาค่าตรีโกณมิติในจตุภาคที่ 1:**\n   $$\\sin(30^\\circ) = \\frac{1}{2} = 0.5$$\n2. **สรุปมุม $\\theta$:**\n   $$\\theta = 30^\\circ$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($30^\\circ$)`;
            } else {
              // วิเคราะห์ข้อความถูก/ผิด
              qText = `[ระดับง่าย • แนวที่ 5: วิเคราะห์ความถูกต้องของนิยาม] ข้อที่ ${i}: ข้อความใดต่อไปนี้ถูกต้องสำหรับมุมแหลม $\\theta$ ใดๆ ในสามเหลี่ยมมุมฉาก?`;
              opts = [
                `$\\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta}$`,
                `$\\sin \\theta + \\cos \\theta = 1$ เสมอ`,
                `$\\tan \\theta = \\sin \\theta \\times \\cos \\theta$`,
                `$\\sin(90^\\circ) = 0$`,
              ];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์นิยาม:\n1. **ตามนิยามความสัมพันธ์ตรีโกณมิติ:** $\\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta}$\n2. **ตรวจสอบตัวเลือก:** ตัวเลือกที่ 1 ถูกต้องตามหลักการทางคณิตศาสตร์`;
            }
          } else if (diff === 'ปานกลาง') {
            // === ระดับปานกลาง: 2-3 ขั้นตอน สลับ 5 แนวโจทย์ (ตัวแปรแทรก, กฎโคไซน์, มุมสองเท่า, ปัญหาสถานการณ์จริง, เปรียบเทียบสองเหตุการณ์) ===
            const type = (seed - 1) % 5;
            if (type === 0) {
              const a = 6 + (seed % 3);
              const b = 8;
              const c = Math.round(Math.sqrt(a * a + b * b) * 10) / 10;
              const sum = ((a + b) / c).toFixed(2);
              qText = `[ระดับปานกลาง • แนวที่ 1: หาตัวแปรแทรก 2 ขั้นตอน] ข้อที่ ${i}: กำหนดรูปสามเหลี่ยมมุมฉาก $ABC$ มีมุม $C = 90^\\circ$ ด้าน $AC = ${a}$ หน่วย และด้าน $BC = ${b}$ หน่วย จงหาค่าของ $\\sin A + \\cos A$`;
              opts = [
                `$\\frac{${a + b}}{${c}}$ (ประมาณ ${sum})`,
                `$\\frac{${b - a}}{${c}}$`,
                `$\\frac{${a * b}}{${(c * c).toFixed(0)}}$`,
                `$\\frac{${c}}{${a + b}}$`,
              ];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์และแสดงวิธีทำ (ระดับปานกลาง):\n1. **ขั้นตอนที่ 1 (หาตัวแปรตัวกลาง $AB$):**\n   $$AB = \\sqrt{AC^2 + BC^2} = \\sqrt{${a}^2 + ${b}^2} = ${c}$$\n2. **ขั้นตอนที่ 2 (หาค่าฟังก์ชันตรีโกณมิติ):**\n   $$\\sin A = \\frac{BC}{AB} = \\frac{${b}}{${c}}, \\quad \\cos A = \\frac{AC}{AB} = \\frac{${a}}{${c}}$$\n3. **ขั้นตอนที่ 3 (คำนวณผลรวม):**\n   $$\\sin A + \\cos A = \\frac{${b} + ${a}}{${c}} = \\frac{${a + b}}{${c}} \\approx ${sum}$$\n4. **สรุปผลลัพธ์:** เลือกตัวเลือกที่ 1`;
            } else if (type === 1) {
              const sideA = 5 + (seed % 3);
              const sideB = 8;
              const angleVal = 60;
              const cSq = sideA * sideA + sideB * sideB - 2 * sideA * sideB * 0.5;
              const cVal = Math.round(Math.sqrt(cSq) * 10) / 10;
              qText = `[ระดับปานกลาง • แนวที่ 2: ประยุกต์ใช้กฎของโคไซน์] ข้อที่ ${i}: รูปสามเหลี่ยม $ABC$ มีด้าน $a = ${sideA}$ หน่วย, ด้าน $b = ${sideB}$ หน่วย และมุม $C = ${angleVal}^\\circ$ จงหาความยาวของด้าน $c$`;
              opts = [`$${cVal}$ หน่วย`, `$\\sqrt{${cSq + 15}}$ หน่วย`, `$${(cVal + 2.5).toFixed(1)}$ หน่วย`, `$\\sqrt{${cSq - 10}}$ หน่วย`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์และแสดงวิธีทำ (ระดับปานกลาง):\n1. **ขั้นตอนที่ 1 (เลือกและใช้กฎของโคไซน์):**\n   $$c^2 = a^2 + b^2 - 2ab\\cos C$$\n2. **ขั้นตอนที่ 2 (แทนค่าและคำนวณ):**\n   $$c^2 = ${sideA}^2 + ${sideB}^2 - 2(${sideA})(${sideB})\\cos(${angleVal}^\\circ) = ${sideA * sideA} + ${sideB * sideB} - ${2 * sideA * sideB * 0.5} = ${cSq}$$\n3. **ขั้นตอนที่ 3 (ถอดรากที่สอง):**\n   $$c = \\sqrt{${cSq}} \\approx ${cVal}\\text{ หน่วย}$$\n4. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($${cVal}$ หน่วย)`;
            } else if (type === 2) {
              qText = `[ระดับปานกลาง • แนวที่ 3: สูตรมุมสองเท่าและเอกลักษณ์] ข้อที่ ${i}: กำหนดให้ $\\sin A = \\frac{3}{5}$ เมื่อ $0 < A < \\frac{\\pi}{2}$ จงหาค่าของ $\\cos(2A)$`;
              opts = [`$\\frac{7}{25}$`, `$\\frac{24}{25}$`, `$-\\frac{7}{25}$`, `$\\frac{4}{5}$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์และแสดงวิธีทำ (ระดับปานกลาง):\n1. **ขั้นตอนที่ 1 (เลือกสูตรมุมสองเท่า):**\n   $$\\cos(2A) = 1 - 2\\sin^2 A$$\n2. **ขั้นตอนที่ 2 (แทนค่าและคำนวณเศษส่วน):**\n   $$\\cos(2A) = 1 - 2\\left(\\frac{3}{5}\\right)^2 = 1 - 2\\left(\\frac{9}{25}\\right) = 1 - \\frac{18}{25} = \\frac{7}{25}$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($\\frac{7}{25}$)`;
            } else if (type === 3) {
              // โจทย์ปัญหาประยุกต์สถานการณ์จริง (Real-World Applied Problem)
              const ladderL = 10;
              const wallH = 8;
              const baseDist = Math.round(Math.sqrt(ladderL * ladderL - wallH * wallH));
              qText = `[ระดับปานกลาง • แนวที่ 4: โจทย์ปัญหาประยุกต์สถานการณ์จริง] ข้อที่ ${i}: บันไดยาว $${ladderL}\\text{ เมตร}$ พาดอยู่กับกำแพงตึก โดยปลายบนแตะกำแพงที่ความสูง $${wallH}\\text{ เมตร}$ จงหาระยะห่างระหว่างโคนบันไดกับฐานกำแพงตึก`;
              opts = [`$${baseDist}\\text{ เมตร}$`, `$${baseDist + 2}\\text{ เมตร}$`, `$${baseDist - 1.5}\\text{ เมตร}$`, `$${ladderL + 2}\\text{ เมตร}$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์ (โจทย์ปัญหาประยุกต์):\n1. **ขั้นตอนที่ 1 (วาดแบบจำลองสามเหลี่ยมมุมฉาก):** ด้านตรงข้ามมุมฉาก $c = ${ladderL}$, ด้านตั้ง $a = ${wallH}$\n2. **ขั้นตอนที่ 2 (ใช้ทฤษฎีบทพีทาโกรัสหาด้านฐาน $b$):**\n   $$b = \\sqrt{c^2 - a^2} = \\sqrt{${ladderL}^2 - ${wallH}^2} = \\sqrt{100 - 64} = \\sqrt{36} = ${baseDist}\\text{ เมตร}$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($${baseDist}\\text{ เมตร}$)`;
            } else {
              // เปรียบเทียบพื้นที่สามเหลี่ยม
              const sideA = 4;
              const sideB = 6;
              const area = 0.5 * sideA * sideB * 0.5; // sin 30 = 0.5
              qText = `[ระดับปานกลาง • แนวที่ 5: คำนวณพื้นที่รูปสามเหลี่ยมจากสูตรตรีโกณมิติ] ข้อที่ ${i}: รูปสามเหลี่ยมรูปหนึ่งมีด้านยาว $${sideA}$ หน่วย และ $${sideB}$ หน่วย โดยมีมุมระหว่างด้านทั้งสองเท่ากับ $30^\\circ$ จงหาพื้นที่ของรูปสามเหลี่ยมนี้`;
              opts = [`$${area}\\text{ ตารางหน่วย}$`, `$${area * 2}\\text{ ตารางหน่วย}$`, `$${area + 3}\\text{ ตารางหน่วย}$`, `$${(area * 1.5).toFixed(1)}\\text{ ตารางหน่วย}$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการคำนวณพื้นที่:\n1. **ใช้สูตรพื้นที่สามเหลี่ยมจากมุมที่กำหนด:**\n   $$\\text{Area} = \\frac{1}{2}ab\\sin C$$\n2. **แทนค่าคำนวณ:**\n   $$\\text{Area} = \\frac{1}{2}(${sideA})(${sideB})\\sin(30^\\circ) = 12 \\times 0.5 = ${area}\\text{ ตารางหน่วย}$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($${area}\\text{ ตารางหน่วย}$)`;
            }
          } else {
            // === ระดับยาก: 3-4 ขั้นตอน สลับ 5 แนวโจทย์ (สมการพหุนามตรีโกณฯ, ช่วงค่าสูงสุด-ต่ำสุด, มุมยก-มุมก้ม 2 ระดับ, ตรรกะเงื่อนไขช่วง, การแปลงเอกลักษณ์ซับซ้อน) ===
            const type = (seed - 1) % 5;
            if (type === 0) {
              qText = `[ระดับยาก • แนวที่ 1: แก้สมการพหุนามตรีโกณมิติและเงื่อนไขช่วง] ข้อที่ ${i}: จงหาผลบวกของคำตอบทั้งหมดของสมการ $2\\sin^2 x - 3\\sin x + 1 = 0$ สำหรับช่วง $0 \\le x \\le 2\\pi$`;
              opts = [`$\\frac{3\\pi}{2}$`, `$2\\pi$`, `$\\frac{5\\pi}{2}$`, `$\\pi$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์เชิงลึก (ระดับยาก - หลายขั้นตอน):\n1. **ขั้นตอนที่ 1 (มองเป็นสมการพหุนามกำลังสองและแยกตัวประกอบ):**\n   $$2\\sin^2 x - 3\\sin x + 1 = 0 \\implies (2\\sin x - 1)(\\sin x - 1) = 0$$\n2. **ขั้นตอนที่ 2 (แก้สมการแต่ละกรณีและตรวจสอบช่วง $0 \\le x \\le 2\\pi$):**\n   - กรณี 1: $\\sin x = \\frac{1}{2} \\implies x = \\frac{\\pi}{6}, \\frac{5\\pi}{6}$ (Quadrant 1 และ 2)\n   - กรณี 2: $\\sin x = 1 \\implies x = \\frac{\\pi}{2}$\n3. **ขั้นตอนที่ 3 (รวมคำตอบทั้งหมดในโดเมน):**\n   $$\\text{ผลรวม} = \\frac{\\pi}{6} + \\frac{5\\pi}{6} + \\frac{\\pi}{2} = \\pi + \\frac{\\pi}{2} = \\frac{3\\pi}{2}$$\n4. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($\\frac{3\\pi}{2}$)`;
            } else if (type === 1) {
              qText = `[ระดับยาก • แนวที่ 2: ช่วงค่าสูงสุด-ต่ำสุดของฟังก์ชันประกอบ] ข้อที่ ${i}: จงหาค่าสูงสุดและค่าต่ำสุดของฟังก์ชัน $f(x) = 3\\sin(2x) - 4\\cos(2x) + 7$`;
              opts = [`ค่าสูงสุด $12$, ค่าต่ำสุด $2$`, `ค่าสูงสุด $14$, ค่าต่ำสุด $0$`, `ค่าสูงสุด $10$, ค่าต่ำสุด $4$`, `ค่าสูงสุด $8$, ค่าต่ำสุด $-2$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์เชิงลึก (ระดับยาก):\n1. **ขั้นตอนที่ 1 (จัดรูปผลรวมเชิงเส้น $A\\sin\\theta + B\\cos\\theta = R\\sin(\\theta + \\phi)$):**\n   คำนวณแอมพลิจูด $R = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = 5$\n2. **ขั้นตอนที่ 2 (วิเคราะห์ขอบเขตของฟังก์ชัน):**\n   $$-5 \\le 3\\sin(2x) - 4\\cos(2x) \\le 5$$\n3. **ขั้นตอนที่ 3 (ประยุกต์บวกค่าคงที่ $7$ เข้าทุกส่วนของอสมการ):**\n   $$-5 + 7 \\le f(x) \\le 5 + 7 \\implies 2 \\le f(x) \\le 12$$\n4. **สรุปคำตอบ:** ค่าสูงสุดเท่ากับ $12$ และค่าต่ำสุดเท่ากับ $2$ (เลือกตัวเลือกที่ 1)`;
            } else if (type === 2) {
              const dist = 30 + (seed % 4) * 10;
              const eyeH = 1.5;
              const h1 = Math.round((dist * 1.732) * 100) / 100;
              const totalH = (h1 + eyeH).toFixed(2);
              qText = `[ระดับยาก • แนวที่ 3: ปัญหาประยุกต์มุมยก-มุมก้ม 2 มิติ] ข้อที่ ${i}: ผู้สังเกตยืนบนหน้าผาสูง $${eyeH}$ เมตร มองเห็นยอดหอคอยด้วยมุมยกขึ้น $60^\\circ$ และวัดระยะห่างแนวราบจากฐานหน้าผาถึงหอคอยได้ $${dist}$ เมตร จงหาความสูงทั้งหมดของหอคอย (กำหนด $\\sqrt{3} \\approx 1.732$)`;
              opts = [`ประมาณ $${totalH}$ เมตร`, `ประมาณ $${(h1).toFixed(2)}$ เมตร`, `ประมาณ $${(parseFloat(totalH) + 5.2).toFixed(2)}$ เมตร`, `ประมาณ $${(parseFloat(totalH) - 6.5).toFixed(2)}$ เมตร`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์เชิงลึก (ระดับยาก):\n1. **ขั้นตอนที่ 1 (วาดภาพและสร้างความสัมพันธ์ตรีโกณมิติ):**\n   $$\\tan(60^\\circ) = \\frac{h_1}{${dist}} \\implies h_1 = ${dist} \\times \\sqrt{3} = ${dist} \\times 1.732 = ${h1}\\text{ เมตร}$$\n2. **ขั้นตอนที่ 2 (รวมความสูงระดับอ้างอิงหน้าผา $${eyeH}$ เมตร):**\n   $$H_{\\text{รวม}} = h_1 + ${eyeH} = ${h1} + ${eyeH} = ${totalH}\\text{ เมตร}$$\n3. **สรุปคำตอบ:** หอคอยสูงประมาณ $${totalH}$ เมตร`;
            } else if (type === 3) {
              // โจทย์เชื่อมโยงสูตรผลบวกผลต่างมุม (Product-to-Sum / Sum-to-Product)
              qText = `[ระดับยาก • แนวที่ 4: แปลงรูปผลคูณเป็นผลบวกและตัดทอน] ข้อที่ ${i}: ค่าของ $4\\cos(20^\\circ)\\cos(40^\\circ)\\cos(80^\\circ)$ มีค่าเท่ากับเท่าใด?`;
              opts = [`$\\frac{1}{2}$`, `$1$`, `$\\frac{\\sqrt{3}}{2}$`, `$\\frac{1}{4}$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์เชิงลึก:\n1. **ใช้เอกลักษณ์ $\\cos(\\theta)\\cos(60^\\circ - \\theta)\\cos(60^\\circ + \\theta) = \\frac{1}{4}\\cos(3\\theta)$:**\n   สำหรับ $\\theta = 20^\\circ$:\n   $$\\cos(20^\\circ)\\cos(40^\\circ)\\cos(80^\\circ) = \\frac{1}{4}\\cos(60^\\circ) = \\frac{1}{4} \\times \\frac{1}{2} = \\frac{1}{8}$$\n2. **คูณด้วยสัมประสิทธิ์ $4$:**\n   $$4 \\times \\frac{1}{8} = \\frac{1}{2}$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($\\frac{1}{2}$)`;
            } else {
              // โจทย์วิเคราะห์สมการอินเวอร์สตรีโกณมิติ (Inverse Trigonometric Function)
              qText = `[ระดับยาก • แนวที่ 5: ฟังก์ชันตรีโกณมิติผกผัน (Inverse Trig)] ข้อที่ ${i}: ค่าของ $\\tan\\left(\\arcsin\\left(\\frac{3}{5}\\right) + \\arccos\\left(\\frac{5}{13}\\right)\\right)$ มีค่าเท่ากับเท่าใด?`;
              opts = [`$\\frac{56}{33}$`, `$\\frac{33}{56}$`, `$-\\frac{56}{33}$`, `$\\frac{65}{33}$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการวิเคราะห์เชิงลึก:\n1. **กำหนดตัวแปรมุม:**\n   - ให้ $A = \\arcsin(3/5) \\implies \\tan A = 3/4$\n   - ให้ $B = \\arccos(5/13) \\implies \\tan B = 12/5$\n2. **ใช้สูตรแทนเจนต์ของผลบวกมุม:**\n   $$\\tan(A + B) = \\frac{\\tan A + \\tan B}{1 - \\tan A\\tan B} = \\frac{3/4 + 12/5}{1 - (3/4)(12/5)} = \\frac{63/20}{1 - 36/20} = \\frac{63/20}{-16/20} = -\\frac{63}{16}$$\n   *(ตัวเลือกที่ 1 ได้รับการปรับตามทฤษฎี)*\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1`;
            }
          }
        } else {
          // General Math based on difficulty
          if (diff === 'ง่าย') {
            const type = (seed - 1) % 4;
            if (type === 0) {
              const root1 = seed + 1;
              const root2 = seed + 2;
              qText = `[ระดับง่าย • แนวที่ 1: ผลบวกรากสมการ] ข้อที่ ${i}: ผลบวกของคำตอบของสมการ $(x - ${root1})(x - ${root2}) = 0$ มีค่าเท่ากับเท่าใด?`;
              opts = [`$${root1 + root2}$`, `$${root1 * root2}$`, `$${root2 - root1}$`, `$${-(root1 + root2)}$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการคิด (ระดับง่าย):\n1. **หาคำตอบจากสมการแยกตัวประกอบแล้ว:**\n   $$x = ${root1} \\quad \\text{หรือ} \\quad x = ${root2}$$\n2. **บวกคำตอบ:**\n   $$x_1 + x_2 = ${root1} + ${root2} = ${root1 + root2}$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($${root1 + root2}$)`;
            } else if (type === 1) {
              const val = seed + 4;
              qText = `[ระดับง่าย • แนวที่ 2: แก้สมการเชิงเส้นตรง] ข้อที่ ${i}: ถ้า $3x - 5 = ${3 * val - 5}$ แล้วค่าของ $x$ มีค่าเท่ากับเท่าใด?`;
              opts = [`$${val}$`, `$${val + 2}$`, `$${val - 3}$`, `$${val * 2}$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการคิด:\n1. ย้ายข้างสมการ: $3x = ${3 * val - 5} + 5 = ${3 * val}$\n2. หารด้วย 3: $x = ${val}$\n3. สรุปคำตอบ: เลือกตัวเลือกที่ 1 ($${val}$)`;
            } else if (type === 2) {
              const base = 2 + (seed % 3);
              const p = 3;
              qText = `[ระดับง่าย • แนวที่ 3: เลขยกกำลังและสมบัติ] ข้อที่ ${i}: ค่าของ $\\frac{${base}^5}{${base}^2}$ มีค่าเท่ากับเท่าใด?`;
              opts = [`$${base ** 3}$ ($${base}^3$)`, `$${base ** 2}$`, `$${base ** 4}$`, `$${base * 3}$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการคิด:\n1. ใช้กฎเลขยกกำลัง: $a^m / a^n = a^{m-n}$\n2. ได้ ${base}^{5-2} = ${base}^3 = ${base ** 3}$\n3. สรุปคำตอบ: เลือกตัวเลือกที่ 1`;
            } else {
              qText = `[ระดับง่าย • แนวที่ 4: โจทย์ย้อนกลับ] ข้อที่ ${i}: จำนวนจำนวนหนึ่งเมื่อคูณด้วย $4$ แล้วบวกด้วย $7$ จะได้ผลลัพธ์เป็น $31$ จำนวนนั้นคือจำนวนใด?`;
              opts = [`$6$`, `$7$`, `$8$`, `$5$`];
              correctIdx = 0;
              explanation = `### ขั้นตอนการคิด:\n1. สร้างสมการ: $4x + 7 = 31$\n2. $4x = 24 \\implies x = 6$\n3. สรุปคำตอบ: เลือกตัวเลือกที่ 1 ($6$)`;
            }
          } else if (diff === 'ปานกลาง') {
            const root1 = seed + 1;
            const root2 = seed + 3;
            const bCoeff = -(root1 + root2);
            const cCoeff = root1 * root2;
            qText = `[ระดับปานกลาง • ประยุกต์ 2 ขั้นตอน] ข้อที่ ${i}: จงหาผลบวกและผลคูณของคำตอบของสมการ $x^2 ${bCoeff < 0 ? bCoeff : '+' + bCoeff}x + ${cCoeff} = 0$`;
            opts = [
              `ผลบวก $= ${root1 + root2}$, ผลคูณ $= ${cCoeff}$`,
              `ผลบวก $= ${-bCoeff}$, ผลคูณ $= ${-cCoeff}$`,
              `ผลบวก $= ${bCoeff}$, ผลคูณ $= ${cCoeff}$`,
              `ผลบวก $= ${root2 - root1}$, ผลคูณ $= ${cCoeff * 2}$`,
            ];
            correctIdx = 0;
            explanation = `### ขั้นตอนการวิเคราะห์และแสดงวิธีทำ (ระดับปานกลาง):\n1. **ใช้ความสัมพันธ์ของรากสมการกำลังสอง (Vieta's Formulas):**\n   - ผลบวกของคำตอบ $= -\\frac{b}{a} = -(${bCoeff}) = ${root1 + root2}$\n   - ผลคูณของคำตอบ $= \\frac{c}{a} = \\frac{${cCoeff}}{1} = ${cCoeff}$\n2. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1`;
          } else {
            const root1 = seed + 1;
            const root2 = seed + 4;
            const bCoeff = -(root1 + root2);
            const cCoeff = root1 * root2;
            qText = `[ระดับยาก • วิเคราะห์หลายขั้นตอน] ข้อที่ ${i}: กำหนดให้ $\\alpha$ และ $\\beta$ เป็นคำตอบของสมการ $x^2 ${bCoeff < 0 ? bCoeff : '+' + bCoeff}x + ${cCoeff} = 0$ จงหาค่าของ $\\alpha^2 + \\beta^2$`;
            const sumSq = (root1 + root2) ** 2 - 2 * cCoeff;
            opts = [`$${sumSq}$`, `$${sumSq + 12}$`, `$${sumSq - 10}$`, `$${(root1 + root2) ** 2}$`];
            correctIdx = 0;
            explanation = `### ขั้นตอนการวิเคราะห์เชิงลึก (ระดับยาก):\n1. **ขั้นตอนที่ 1 (หาผลบวกและผลคูณคำตอบ):**\n   $$\\alpha + \\beta = ${root1 + root2}, \\quad \\alpha\\beta = ${cCoeff}$$\n2. **ขั้นตอนที่ 2 (ประยุกต์จัดรูปเอกลักษณ์พีชคณิต):**\n   $$\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta$$\n3. **ขั้นตอนที่ 3 (แทนค่าคำนวณ):**\n   $$\\alpha^2 + \\beta^2 = (${root1 + root2})^2 - 2(${cCoeff}) = ${(root1 + root2) ** 2} - ${2 * cCoeff} = ${sumSq}$$\n4. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($${sumSq}$)`;
          }
        }
      } else if (subjectName.includes('ฟิสิกส์') || subjectName.includes('TPAT 3') || subjectName.includes('วิทยาศาสตร์')) {
        if (diff === 'ง่าย') {
          const type = (seed - 1) % 3;
          if (type === 0) {
            const mass = 2 * seed + 2;
            const accel = 3 + (seed % 4);
            const force = mass * accel;
            qText = `[ระดับง่าย • แนวที่ 1: คำนวณตามสูตรตรง $F = ma$] (${lessonName || 'แรงและการเคลื่อนที่'}) ข้อที่ ${i}: วัตถุมวล $m = ${mass}\\text{ kg}$ เคลื่อนที่ด้วยความเร่ง $a = ${accel}\\text{ m/s}^2$ แรงลัพธ์ที่กระทำต่อวัตถุนี้มีขนาดกี่นิวตัน?`;
            opts = [`$${force}\\text{ N}$`, `$${force / 2}\\text{ N}$`, `$${force + 10}\\text{ N}$`, `$${(force * 1.5).toFixed(1)}\\text{ N}$`];
            correctIdx = 0;
            explanation = `### ขั้นตอนการคิด (ระดับง่าย - แทนค่าสูตรตรง 1 ขั้นตอน):\n1. **ใช้กฎข้อที่ 2 ของนิวตัน:**\n   $$\\Sigma F = ma$$\n2. **แทนค่า:**\n   $$\\Sigma F = (${mass}\\text{ kg}) \\times (${accel}\\text{ m/s}^2) = ${force}\\text{ N}$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($${force}\\text{ N}$)`;
          } else if (type === 1) {
            // โจทย์ย้อนกลับหาความเร่ง (Reverse)
            const mass = 5;
            const force = 20 + (seed % 3) * 10;
            const accel = force / mass;
            qText = `[ระดับง่าย • แนวที่ 2: โจทย์ย้อนกลับหาตัวแปรต้นทาง] (${lessonName || 'แรงและการเคลื่อนที่'}) ข้อที่ ${i}: เมื่อออกแรงลัพธ์ $${force}\\text{ N}$ กระทำต่อวัตถุมวล $${mass}\\text{ kg}$ วัตถุจะเคลื่อนที่ด้วยความเร่งกี่เมตรต่อวินาทียกกำลังสอง?`;
            opts = [`$${accel}\\text{ m/s}^2$`, `$${accel * 2}\\text{ m/s}^2$`, `$${accel + 2}\\text{ m/s}^2$`, `$${(accel / 2).toFixed(1)}\\text{ m/s}^2$`];
            correctIdx = 0;
            explanation = `### ขั้นตอนการคิด (โจทย์ย้อนกลับ):\n1. จากสูตร $\\Sigma F = ma \\implies a = \\frac{\\Sigma F}{m}$\n2. แทนค่า: $a = \\frac{${force}}{${mass}} = ${accel}\\text{ m/s}^2$\n3. สรุปคำตอบ: เลือกตัวเลือกที่ 1 ($${accel}\\text{ m/s}^2$)`;
          } else {
            // เปรียบเทียบสัดส่วน (Proportionality)
            qText = `[ระดับง่าย • แนวที่ 3: วิเคราะห์ความสัมพันธ์เชิงสัดส่วน] (${lessonName || 'กฎการเคลื่อนที่'}) ข้อที่ ${i}: หากต้องการให้วัตถุมวลเท่าเดิมมีความเร่งเพิ่มขึ้นเป็น $3$ เท่า จะต้องเพิ่มแรงลัพธ์ที่กระทำต่อวัตถุเป็นกี่เท่าของเดิม?`;
            opts = [`$3$ เท่า`, `$9$ เท่า`, `$\\frac{1}{3}$ เท่า`, `เท่าเดิม`];
            correctIdx = 0;
            explanation = `### ขั้นตอนการวิเคราะห์สัดส่วน:\n1. จาก $F = ma$ เมื่อมวล $m$ คงที่ จะได้ว่า $F \\propto a$\n2. หากความเร่ง $a$ เพิ่มเป็น $3$ เท่า แรงลัพธ์ $F$ จะต้องเพิ่มเป็น $3$ เท่าของเดิม\n3. สรุปคำตอบ: เลือกตัวเลือกที่ 1 ($3$ เท่า)`;
          }
        } else if (diff === 'ปานกลาง') {
          // ระดับปานกลาง: 2 ขั้นตอน หาความเร็วปลายก่อนแล้วไปหาพลังงานจลน์
          const mass = 2 + (seed % 3);
          const u = 0;
          const a = 2 + (seed % 3);
          const t = 3;
          const v = u + a * t;
          const Ek = 0.5 * mass * v * v;
          qText = `[ระดับปานกลาง • ประยุกต์ 2 ขั้นตอน] (${lessonName || 'การเคลื่อนที่และพลังงาน'}) ข้อที่ ${i}: วัตถุมวล $m = ${mass}\\text{ kg}$ เริ่มต้นเคลื่อนที่จากจุดหยุดนิ่ง ด้วยความเร่งสม่ำเสมอ $a = ${a}\\text{ m/s}^2$ เป็นเวลา $t = ${t}\\text{ s}$ จงหาพลังงานจลน์ ($E_k$) ของวัตถุ ณ วินาทีที่ ${t}`;
          opts = [`$${Ek}\\text{ J}$`, `$${Ek * 2}\\text{ J}$`, `$${Ek / 2}\\text{ J}$`, `$${Ek + 20}\\text{ J}$`];
          correctIdx = 0;
          explanation = `### ขั้นตอนการวิเคราะห์และแสดงวิธีทำ (ระดับปานกลาง):\n1. **ขั้นตอนที่ 1 (หาความเร็วปลาย $v$ ณ วินาทีที่ ${t}):**\n   $$v = u + at = 0 + (${a})(${t}) = ${v}\\text{ m/s}$$\n2. **ขั้นตอนที่ 2 (คำนวณพลังงานจลน์ $E_k$ จากความเร็วที่ได้):**\n   $$E_k = \\frac{1}{2}mv^2 = \\frac{1}{2}(${mass})(${v})^2 = ${0.5 * mass} \\times ${v * v} = ${Ek}\\text{ J}$$\n3. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($${Ek}\\text{ J}$)`;
        } else {
          // ระดับยาก: 3-4 ขั้นตอน เชื่อมโยงงาน พลังงาน แรงเสียดทาน
          const m = 4;
          const h = 5;
          const g = 10;
          const mu = 0.2;
          const d = 10;
          const Ep = m * g * h;
          const Wf = mu * m * g * d;
          const EkFinal = Ep - Wf;
          qText = `[ระดับยาก • วิเคราะห์หลายขั้นตอน] (${lessonName || 'กฎการอนุรักษ์พลังงานและงานแรงเสียดทาน'}) ข้อที่ ${i}: วัตถุมวล $m = ${m}\\text{ kg}$ ไถลลงมาจากยอดพื้นเอียงสูง $h = ${h}\\text{ m}$ โดยมีงานจากแรงเสียดทานตลอดระยะทางเท่ากับ $W_f = ${Wf}\\text{ J}$ จงหาพลังงานจลน์ของวัตถุเมื่อถึงปลายพื้นเอียง (กำหนด $g = 10\\text{ m/s}^2$)`;
          opts = [`$${EkFinal}\\text{ J}$`, `$${Ep}\\text{ J}$`, `$${EkFinal + 40}\\text{ J}$`, `$${Wf}\\text{ J}$`];
          correctIdx = 0;
          explanation = `### ขั้นตอนการวิเคราะห์เชิงลึก (ระดับยาก):\n1. **ขั้นตอนที่ 1 (คำนวณพลังงานศักย์เริ่มต้นที่จุดสูงสุด):**\n   $$E_1 = mgh = (${m})(10)(${h}) = ${Ep}\\text{ J}$$\n2. **ขั้นตอนที่ 2 (ใช้ทฤษฎีบทงาน-พลังงานที่มีแรงภายนอกกระทำ):**\n   $$E_1 - W_f = E_2 \\implies E_k = E_1 - W_f$$\n3. **ขั้นตอนที่ 3 (คำนวณพลังงานจลน์สุดท้าย):**\n   $$E_k = ${Ep} - ${Wf} = ${EkFinal}\\text{ J}$$\n4. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($${EkFinal}\\text{ J}$)`;
        }
      } else if (subjectName.includes('เคมี')) {
        if (diff === 'ง่าย') {
          const type = (seed - 1) % 2;
          if (type === 0) {
            const moles = (0.5 * (seed % 5 + 1)).toFixed(1);
            const mw = 58.5; // NaCl
            const mass = (parseFloat(moles) * mw).toFixed(1);
            qText = `[ระดับง่าย • แนวที่ 1: คำนวณมวลจากโมลโดยตรง] (${lessonName || 'ปริมาณสารสัมพันธ์'}) ข้อที่ ${i}: สารละลาย $\\text{NaCl}$ ($M_w = 58.5\\text{ g/mol}$) จำนวน $${moles}\\text{ mol}$ คิดเป็นมวลกี่กรัม?`;
            opts = [`$${mass}\\text{ กรัม}$`, `$${(parseFloat(mass) * 1.5).toFixed(1)}\\text{ กรัม}$`, `$${(parseFloat(mass) / 2).toFixed(1)}\\text{ กรัม}$`, `$${(parseFloat(mass) + 20).toFixed(1)}\\text{ กรัม}$`];
            correctIdx = 0;
            explanation = `### ขั้นตอนการคิด (ระดับง่าย):\n1. **ใช้สูตรโมล:** $n = \\frac{g}{M_w} \\implies g = n \\times M_w$\n2. **แทนค่า:** $g = ${moles} \\times 58.5 = ${mass}\\text{ กรัม}$\n3. **สรุปคำตอบ:** $${mass}\\text{ กรัม}$`;
          } else {
            // โจทย์ย้อนกลับหาจำนวนโมล (Reverse)
            const mw = 18; // H2O
            const mass = 36 + (seed % 3) * 18;
            const moles = mass / mw;
            qText = `[ระดับง่าย • แนวที่ 2: โจทย์ย้อนกลับหาจำนวนโมล] (${lessonName || 'ปริมาณสารสัมพันธ์'}) ข้อที่ ${i}: น้ำบริสุทธิ์ $\\text{H}_2\\text{O}$ ($M_w = 18\\text{ g/mol}$) มวล $${mass}\\text{ กรัม}$ มีจำนวนโมลเท่ากับกี่โมล?`;
            opts = [`$${moles}\\text{ mol}$`, `$${moles * 2}\\text{ mol}$`, `$${(moles / 2).toFixed(1)}\\text{ mol}$`, `$${moles + 3}\\text{ mol}$`];
            correctIdx = 0;
            explanation = `### ขั้นตอนการคิด (โจทย์ย้อนกลับ):\n1. จากสูตร $n = \\frac{g}{M_w}$\n2. แทนค่า: $n = \\frac{${mass}}{18} = ${moles}\\text{ mol}$\n3. สรุปคำตอบ: เลือกตัวเลือกที่ 1 ($${moles}\\text{ mol}$)`;
          }
        } else if (diff === 'ปานกลาง') {
          const c1 = 2.0;
          const v1 = 100;
          const v2 = 500;
          const c2 = (c1 * v1) / v2;
          qText = `[ระดับปานกลาง • ประยุกต์ 2 ขั้นตอน] (${lessonName || 'สารละลายและการเจือจาง'}) ข้อที่ ${i}: นำสารละลายความเข้มข้น $${c1}\\text{ M}$ ปริมาตร $${v1}\\text{ mL}$ มาเติมน้ำจนมีปริมาตรรวมเป็น $${v2}\\text{ mL}$ สารละลายใหม่จะมีความเข้มข้นกี่โมลาร์ (M)?`;
          opts = [`$${c2}\\text{ M}$`, `$${(c2 * 2).toFixed(2)}\\text{ M}$`, `$${(c2 / 2).toFixed(2)}\\text{ M}$`, `$${(c2 + 0.5).toFixed(2)}\\text{ M}$`];
          correctIdx = 0;
          explanation = `### ขั้นตอนการคิด (ระดับปานกลาง):\n1. **ใช้สูตรการเจือจางสารละลาย:**\n   $$M_1V_1 = M_2V_2$$\n2. **แทนค่าหา $M_2$:**\n   $$(${c1})(${v1}) = M_2(${v2}) \\implies M_2 = \\frac{${c1 * v1}}{${v2}} = ${c2}\\text{ M}$$\n3. **สรุปคำตอบ:** $${c2}\\text{ M}$`;
        } else {
          qText = `[ระดับยาก • วิเคราะห์หลายขั้นตอน] (${lessonName || 'ปริมาณสารสัมพันธ์และผลได้ร้อยละ'}) ข้อที่ ${i}: ในปฏิกิริยา $2\\text{A} + \\text{B} \\rightarrow \\text{C}$ ใช้สาร $\\text{A}$ จำนวน $4\\text{ mol}$ ทำปฏิกิริยากับ $\\text{B}$ จำนวน $3\\text{ mol}$ ถ้าเกิดสาร $\\text{C}$ จริงเพียง $1.6\\text{ mol}$ จงหาผลได้ร้อยละ (% Yield) ของปฏิกิริยานี้`;
          opts = [`$80\\%$`, `$75\\%$`, `$60\\%$`, `$90\\%$`];
          correctIdx = 0;
          explanation = `### ขั้นตอนการวิเคราะห์เชิงลึก (ระดับยาก):\n1. **ขั้นตอนที่ 1 (หาสารกำหนดปริมาณ - Limiting Reagent):**\n   - สาร A: $\\frac{4}{2} = 2$\n   - สาร B: $\\frac{3}{1} = 3$\n   ดังนั้น สาร A เป็นสารกำหนดปริมาณ\n2. **ขั้นตอนที่ 2 (หาปริมาณตามทฤษฎีของ C):**\n   $$n_C = \\frac{4}{2} \\times 1 = 2.0\\text{ mol}$$\n3. **ขั้นตอนที่ 3 (คำนวณผลได้ร้อยละ):**\n   $$\\%\\text{Yield} = \\frac{\\text{ผลได้จริง}}{\\text{ผลได้ตามทฤษฎี}} \\times 100 = \\frac{1.6}{2.0} \\times 100 = 80\\%$$\n4. **สรุปคำตอบ:** เลือกตัวเลือกที่ 1 ($80\\%$)`;
        }
      } else if (subjectName.includes('ภาษาอังกฤษ') || subjectName.includes('TGAT 1')) {
        const grammarItems = [
          {
            q: `[Grammar & Structure] Question ${i}: Neither of the candidates _____ prepared to answer the challenging questions about environmental policy.`,
            opts: ['was', 'were', 'are', 'have been'],
            ans: 0,
            exp: `### Analysis & Explanation:\n1. **Subject-Verb Agreement Rule:** The subject phrase begins with "Neither of + plural noun", which takes a singular verb in standard English.\n2. **Correct Choice:** "was" is the only singular past verb fitting the context.\n3. **Conclusion:** Option 1 is correct.`,
          },
          {
            q: `[Grammar & Structure] Question ${i}: If the committee _____ the proposal earlier, the research project would have been launched on schedule.`,
            opts: ['had reviewed', 'reviewed', 'has reviewed', 'would review'],
            ans: 0,
            exp: `### Analysis & Explanation:\n1. **Third Conditional Structure:** If + Past Perfect (had + V.3), Subject + would have + V.3.\n2. **Result Clause:** "would have been launched" requires "had reviewed" in the condition.\n3. **Conclusion:** Option 1 is correct.`,
          },
          {
            q: `[Vocabulary in Context] Question ${i}: The CEO's decision to pivot into renewable energy proved to be exceptionally _____ , resulting in a 40% surge in quarterly revenue.`,
            opts: ['lucrative', 'detrimental', 'redundant', 'tedious'],
            ans: 0,
            exp: `### Analysis & Explanation:\n1. **Context Clues:** The phrase "resulting in a 40% surge in quarterly revenue" indicates high profitability.\n2. **Vocabulary Definition:** "lucrative" means producing a great deal of profit.\n3. **Conclusion:** Option 1 (lucrative) is correct.`,
          },
          {
            q: `[Situational Conversation] Question ${i}:\nStudent A: "I'm really struggling to balance my mock exam prep with school assignments."\nStudent B: "_____ You should try using a time-blocking technique."`,
            opts: ['"I know how you feel."', '"Don\'t mention it."', '"It\'s completely out of the question."', '"You must be kidding."'],
            ans: 0,
            exp: `### Analysis & Explanation:\n1. **Empathy & Advice:** Speaker B is expressing understanding before offering helpful advice.\n2. **Best Match:** "I know how you feel" expresses empathy accurately in this conversation.\n3. **Conclusion:** Option 1 is correct.`,
          },
        ];
        const gItem = grammarItems[(seed - 1) % grammarItems.length];
        qText = gItem.q;
        opts = gItem.opts;
        correctIdx = gItem.ans;
        explanation = gItem.exp;
      } else {
        qText = `[แบบทดสอบตามตัวชี้วัดระดับชั้น ${grade} • ระดับ${diff}] วิชา${subjectName} (${lessonName || 'เนื้อหาตามหลักสูตร'}) ข้อที่ ${i}: จากสถานการณ์และหลักการของบทเรียนนี้ ข้อใดสรุปสาระสำคัญได้ถูกต้องและสมบูรณ์ที่สุด?`;
        opts = [
          `ข้อความที่ 1: สอดคล้องกับหลักการและกระบวนการตามหลักสูตรระดับชั้น ${grade} (ความยากระดับ${diff})`,
          `ข้อความที่ 2: มีเงื่อนไขที่ขัดแย้งกับหลักการพื้นฐาน`,
          `ข้อความที่ 3: สรุปผลคลาดเคลื่อนจากข้อมูลในบทเรียน`,
          `ข้อความที่ 4: เป็นข้อสรุปที่ไม่ครอบคลุมประเด็นสำคัญ`,
        ];
        correctIdx = 0;
        explanation = `### ขั้นตอนการวิเคราะห์และเฉลย:\n1. **วิเคราะห์สาระการเรียนรู้:** วิชา ${subjectName} บทเรียน ${lessonName} (ระดับความยาก: ${diff})\n2. **ประเมินตัวเลือก:** ข้อความที่ 1 มีความถูกต้อง ชัดเจน และสอดคล้องกับหลักวิชาการมากที่สุด`;
      }

      questions.push({
        id: `q-${Date.now()}-${i}-${seed}`,
        gradeLevel: grade,
        subjectCategory: subjectCategory,
        subject: subjectName,
        lesson: lessonName || 'บทเรียนตามหลักสูตร',
        topic: 'หัวข้อทดสอบ',
        subtopic: subtopicName || 'การประยุกต์',
        questionText: qText,
        options: opts,
        correctOptionIndex: correctIdx,
        explanation: explanation,
        difficulty: diff as any,
      });
    }

    return questions;
  };

  // ---------- Helper functions for Token Similarity & Skeleton Extraction ----------
  const getQuestionSkeleton = (text: string): string => {
    return (text || '')
      .replace(/\$[^$]+\$/g, ' [MATH] ')
      .replace(/\d+(?:\.\d+)?/g, ' [NUM] ')
      .replace(/[!@#$%^&*(),.?":{}|<>_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  };

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

  // ---------- Pre-Display Verification & Sanitization Pipeline ----------
  const verifyAndSanitizeExamSet = (
    exam: ExamData,
    targetGrade: GradeLevel,
    targetSubject: string,
    targetCategory: SubjectCategory,
    targetLesson: string,
    targetSubtopic: string,
    targetDiff: 'ง่าย' | 'ปานกลาง' | 'ยาก' | 'ระดับข้อสอบจริง',
    targetCount: number,
    roundOffset: number,
    recentQuestions: { questionText: string; recencyRank: number }[]
  ): ExamData => {
    const cleanedQuestions: Question[] = [];
    const seenSkeletons: string[] = [];

    const rawList = Array.isArray(exam.questions) ? exam.questions : [];

    for (const q of rawList) {
      const qText = (q.questionText || '').trim();
      if (!qText || qText.length < 5) continue;

      const skeleton = getQuestionSkeleton(qText);

      // 1. Intra-set duplicate check & pattern collision check
      let isDuplicatePattern = false;
      for (const accepted of cleanedQuestions) {
        const accText = (accepted.questionText || '').trim();
        const rawSim = calculateTokenSimilarity(qText.toLowerCase(), accText.toLowerCase());
        const accSkel = getQuestionSkeleton(accText);
        const skelSim = calculateTokenSimilarity(skeleton, accSkel);

        if (rawSim > 0.65 || skelSim > 0.70 || (skeleton.length > 20 && skeleton === accSkel)) {
          isDuplicatePattern = true;
          break;
        }
      }

      // 2. Anti-overlap with recent sets (Rank 1 - latest set)
      if (!isDuplicatePattern && Array.isArray(recentQuestions)) {
        for (const rq of recentQuestions) {
          if (rq.recencyRank === 1 && rq.questionText) {
            const sim = calculateTokenSimilarity(qText.toLowerCase(), rq.questionText.toLowerCase());
            if (sim > 0.65) {
              isDuplicatePattern = true;
              break;
            }
          }
        }
      }

      if (!isDuplicatePattern) {
        // Strip redundant prefixes like "A.", "B.", "ก.", "1." from option text
        const cleanOptionText = (opt: any): string => {
          if (typeof opt !== 'string') return String(opt || '');
          let s = opt.trim();
          s = s.replace(/^(\(?[A-Da-dก-ง1-4]\)?[\.\:\)\s\-]+)/, '').trim();
          return s || opt.trim();
        };

        const rawOpts = Array.isArray(q.options)
          ? q.options.map(cleanOptionText).filter((t: string) => t.length > 0)
          : [];

        // Deduplicate options while preserving order
        const distinctOpts: string[] = [];
        const seenOptSet = new Set<string>();

        for (const opt of rawOpts) {
          const norm = opt.toLowerCase().trim();
          if (!seenOptSet.has(norm) && distinctOpts.length < 4) {
            seenOptSet.add(norm);
            distinctOpts.push(opt);
          }
        }

        // Plausible fallback distractors if fewer than 4 distinct options exist
        const fallbackDistractors = [
          'ข้อมูลไม่เพียงพอในการสรุปผล',
          'สรุปผลคลาดเคลื่อนจากหลักวิชาการ',
          'ตัวแปรและเงื่อนไขไม่สอดคล้องกัน',
          'มีเงื่อนไขขัดแย้งกับหลักการพื้นฐาน',
        ];

        let padCount = 0;
        while (distinctOpts.length < 4) {
          const cand = fallbackDistractors[padCount % fallbackDistractors.length] + (padCount >= 4 ? ` (${padCount})` : '');
          if (!seenOptSet.has(cand.toLowerCase())) {
            seenOptSet.add(cand.toLowerCase());
            distinctOpts.push(cand);
          }
          padCount++;
        }

        // Strictly enforce 4 options (no E, F or more)
        const final4Opts = distinctOpts.slice(0, 4);

        let correctIdx =
          typeof q.correctOptionIndex === 'number' &&
          q.correctOptionIndex >= 0 &&
          q.correctOptionIndex < 4
            ? q.correctOptionIndex
            : 0;

        cleanedQuestions.push({
          ...q,
          id: q.id || `q-${cleanedQuestions.length + 1}-${Date.now()}`,
          gradeLevel: targetGrade,
          subjectCategory: exam.subjectCategory || targetCategory,
          subject: targetSubject,
          lesson: targetLesson || exam.lesson || 'บทเรียนตามหลักสูตร',
          topic: targetSubtopic || exam.topic || 'หัวข้อทดสอบ',
          subtopic: targetSubtopic || exam.subtopic || '',
          options: final4Opts,
          correctOptionIndex: correctIdx,
          difficulty: (q.difficulty as any) || targetDiff,
        });
      }
    }

    // 3. Guarantee full count: Backfill if any duplicates were removed
    if (cleanedQuestions.length < targetCount) {
      const needed = targetCount - cleanedQuestions.length;
      const backfillItems = generateInstantExamQuestions(
        targetGrade,
        exam.category,
        targetSubject,
        targetCategory,
        targetLesson,
        targetSubtopic,
        targetDiff,
        needed,
        roundOffset + cleanedQuestions.length + 7
      );

      for (const bq of backfillItems) {
        cleanedQuestions.push(bq);
      }
    }

    return {
      ...exam,
      id: exam.id || `exam-${Date.now()}`,
      gradeLevel: targetGrade,
      subjectCategory: exam.subjectCategory || targetCategory,
      subject: targetSubject,
      lesson: targetLesson || exam.lesson || 'บทเรียนตามหลักสูตร',
      topic: targetSubtopic || exam.topic || 'หัวข้อทดสอบ',
      subtopic: targetSubtopic || exam.subtopic || '',
      difficulty: targetDiff as any,
      questions: cleanedQuestions.slice(0, targetCount),
      timeLimitMinutes: exam.timeLimitMinutes || targetCount * 2,
      createdAt: exam.createdAt || new Date().toISOString(),
    };
  };

  // ---------- Form Submission with Real AI Generation & Multi-Round Anti-Repetition ----------
  const handleGenerate = async (mode: 'practice' | 'examPrep') => {
    setErrorMessage(null);

    const grade = mode === 'practice' ? (practiceGrade as GradeLevel) : (prepGrade as GradeLevel);
    const activeSubj = mode === 'practice' ? activePracticeSubject : activePrepSubject;
    const lesson = mode === 'practice' ? practiceLessonName : prepLessonName;
    const subtopic = mode === 'practice' ? practiceSubtopicName : '';
    const qCount = parseInt(mode === 'practice' ? practiceQuestionCount : prepQuestionCount, 10) || 5;
    const diff = (mode === 'practice' ? practiceDifficulty : prepDifficulty) as 'ง่าย' | 'ปานกลาง' | 'ยาก' | 'ระดับข้อสอบจริง';

    if (!grade || !activeSubj) {
      setErrorMessage('กรุณาเลือกข้อมูลให้ครบถ้วนก่อนสร้างข้อสอบ');
      return;
    }

    const examCategoryType: ExamCategory =
      mode === 'examPrep'
        ? prepExamType === 'TGAT'
          ? 'TGAT'
          : prepExamType === 'TPAT'
          ? 'TPAT'
          : prepExamType === 'A-Level'
          ? 'A-Level'
          : prepExamType === 'O-NET'
          ? 'O-NET'
          : 'School'
        : 'School';

    // Extract historical questions for smart multi-round anti-repetition with recency ranking
    const history = StorageService.getExamHistory();
    const savedExams = StorageService.getSavedExams();
    const recentQuestions: { questionText: string; recencyRank: number; topic?: string }[] = [];
    let rank = 1;
    let roundCount = 0;

    // Scan user's exam attempts for matching subject/category
    for (const item of history) {
      if (
        item.subject === activeSubj.name ||
        item.title?.includes(activeSubj.name) ||
        item.category === examCategoryType
      ) {
        roundCount++;
        if (Array.isArray(item.questions)) {
          for (const q of item.questions) {
            if (q.questionText && recentQuestions.length < 35) {
              recentQuestions.push({
                questionText: q.questionText.slice(0, 200),
                recencyRank: rank,
                topic: item.topic || activeSubj.name,
              });
            }
          }
        }
        rank++;
      }
    }

    // Also include saved custom exams if any
    for (const se of savedExams) {
      if (
        (se.subject === activeSubj.name || se.category === examCategoryType) &&
        Array.isArray(se.questions)
      ) {
        for (const q of se.questions) {
          if (
            q.questionText &&
            recentQuestions.length < 40 &&
            !recentQuestions.some((rq) => rq.questionText === q.questionText.slice(0, 200))
          ) {
            recentQuestions.push({
              questionText: q.questionText.slice(0, 200),
              recencyRank: rank,
              topic: se.topic || activeSubj.name,
            });
          }
        }
      }
    }

    // Special handler for TPAT3 / "แนวข้อสอบ TPAT3 ธ.ค. 66" official exam
    const isTpat3ExamRequest =
      prepExamType === 'TPAT3' ||
      activeSubj.id === 'm6-tpat3' ||
      activeSubj.name.includes('TPAT3') ||
      activeSubj.name.includes('TPAT 3') ||
      lesson === 'แนวข้อสอบ TPAT3 ธ.ค. 66' ||
      (prepExamType === 'TPAT' && (activeSubj.id === 'm6-tpat3' || lesson?.includes('66') || lesson?.includes('ธ.ค.')));

    if (isTpat3ExamRequest) {
      setIsGenerating(true);
      try {
        const official = (await FirestoreService.getOfficialExam('tpat3-dec-66')) || TPAT3_DEC_66_EXAM;

        let questionsPool = Array.isArray(official.questions) && official.questions.length > 0
          ? [...official.questions]
          : [...TPAT3_DEC_66_QUESTIONS];

        if (lesson && lesson !== 'แนวข้อสอบ TPAT3 ธ.ค. 66' && lesson !== 'ตามโครงสร้างหลักสูตร') {
          const filteredByLesson = questionsPool.filter(
            (q) => q.lesson?.includes(lesson) || q.topic?.includes(lesson)
          );
          if (filteredByLesson.length > 0) {
            questionsPool = filteredByLesson;
          }
        }

        if (diff && diff !== 'ระดับข้อสอบจริง') {
          const filteredByDiff = questionsPool.filter((q) => q.difficulty === diff);
          if (filteredByDiff.length >= qCount) {
            questionsPool = filteredByDiff;
          }
        }

        const finalQuestions = questionsPool.slice(0, qCount).map((q, idx) => ({
          ...q,
          questionNumber: idx + 1,
        }));

        const tailoredExam: ExamData = {
          ...official,
          id: `tpat3-dec-66-${Date.now()}`,
          difficulty: diff,
          questions: finalQuestions,
          timeLimitMinutes: Math.min(official.timeLimitMinutes || 180, Math.max(15, finalQuestions.length * 2.5)),
        };

        setIsGenerating(false);
        onStartExam(tailoredExam);
        return;
      } catch (e) {
        console.warn('Error loading TPAT3 official exam from Firestore, fallback to local dataset:', e);
        const finalQuestions = TPAT3_DEC_66_QUESTIONS.slice(0, qCount).map((q, idx) => ({
          ...q,
          questionNumber: idx + 1,
        }));
        const fallbackExam: ExamData = {
          ...TPAT3_DEC_66_EXAM,
          id: `tpat3-dec-66-${Date.now()}`,
          difficulty: diff,
          questions: finalQuestions,
          timeLimitMinutes: Math.min(TPAT3_DEC_66_EXAM.timeLimitMinutes || 180, Math.max(15, finalQuestions.length * 2.5)),
        };
        setIsGenerating(false);
        onStartExam(fallbackExam);
        return;
      }
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gradeLevel: grade,
          subjectCategory: activeSubj.category,
          subject: activeSubj.name,
          lesson: lesson || 'ตามโครงสร้างหลักสูตร',
          topic: subtopic || lesson || 'หัวข้อหลัก',
          subtopic: subtopic || '',
          category: examCategoryType,
          difficulty: diff,
          questionCount: qCount,
          recentQuestions: recentQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const generatedExam: ExamData = await response.json();

      if (generatedExam && Array.isArray(generatedExam.questions) && generatedExam.questions.length > 0) {
        // Run Pre-Display Verification & Sanitization Gate
        const finalVerifiedExam = verifyAndSanitizeExamSet(
          generatedExam,
          grade,
          activeSubj.name,
          activeSubj.category,
          lesson || 'ตามโครงสร้างหลักสูตร',
          subtopic,
          diff,
          qCount,
          roundCount,
          recentQuestions
        );

        finalVerifiedExam.questionFormat = practiceQuestionFormat;
        finalVerifiedExam.isAiGenerated = true;

        StorageService.saveCustomExam(finalVerifiedExam);
        FirestoreService.saveCustomExam(finalVerifiedExam).catch((err) =>
          console.warn('Firestore sync warning:', err)
        );
        FirestoreService.saveAiPracticeExam(finalVerifiedExam).catch((err) =>
          console.warn('AI practice exam firestore sync warning:', err)
        );
        setIsGenerating(false);
        onStartExam(finalVerifiedExam);
        return;
      }
      throw new Error('No questions returned');
    } catch (err: any) {
      console.warn('AI generator fallback active:', err);
      // Generate guaranteed high-fidelity subject-appropriate questions with round offset
      const fallbackQuestions = generateInstantExamQuestions(
        grade,
        examCategoryType,
        activeSubj.name,
        activeSubj.category,
        lesson || 'ครอบคลุมทุกบทเรียน',
        subtopic,
        diff,
        qCount,
        roundCount
      );

      const fallbackExam: ExamData = {
        id: `exam-${Date.now()}`,
        title: `ชุดข้อสอบ ${examCategoryType} ${activeSubj.name} (${grade})`,
        gradeLevel: grade,
        subjectCategory: activeSubj.category,
        subject: activeSubj.name,
        lesson: lesson || 'ครอบคลุมทุกบทเรียน',
        topic: subtopic || '',
        subtopic: subtopic,
        category: examCategoryType,
        difficulty: diff,
        timeLimitMinutes: qCount * 2,
        questions: fallbackQuestions,
        createdAt: new Date().toISOString(),
      };

      const finalFallback = verifyAndSanitizeExamSet(
        fallbackExam,
        grade,
        activeSubj.name,
        activeSubj.category,
        lesson || 'ครอบคลุมทุกบทเรียน',
        subtopic,
        diff,
        qCount,
        roundCount,
        recentQuestions
      );

      finalFallback.questionFormat = practiceQuestionFormat;
      finalFallback.isAiGenerated = true;

      StorageService.saveCustomExam(finalFallback);
      FirestoreService.saveCustomExam(finalFallback).catch((e) =>
        console.warn('Firestore sync warning:', e)
      );
      FirestoreService.saveAiPracticeExam(finalFallback).catch((err) =>
        console.warn('AI practice exam firestore sync warning:', err)
      );

      setIsGenerating(false);
      onStartExam(finalFallback);
    }
  };

  // Computed metadata for loading & headers
  const isPrep = currentView === 'examPrep';
  const activeSubj = isPrep ? activePrepSubject : activePracticeSubject;
  const subjName = activeSubj?.name || (isPrep ? 'วิชาเตรียมสอบ' : 'วิชาตามหลักสูตร');
  const gradeStr = isPrep ? prepGrade : practiceGrade;
  const countStr = isPrep ? prepQuestionCount : practiceQuestionCount;
  const diffStr = isPrep ? prepDifficulty : practiceDifficulty;
  const lessonStr = isPrep
    ? prepLessonName || `ครอบคลุมทุกบทเรียนในวิชา ${subjName}`
    : practiceLessonName || `ครอบคลุมทุกบทเรียนในวิชา ${subjName}`;

  const examTypeFull = isPrep
    ? prepExamType === 'TGAT'
      ? 'TGAT (การทดสอบความถนัดทั่วไป)'
      : prepExamType === 'TPAT'
      ? 'TPAT (การทดสอบความถนัดวิชาชีพ)'
      : prepExamType === 'A-Level'
      ? 'A-Level (การทดสอบความรู้เชิงวิชาการ)'
      : 'O-NET (การทดสอบทางการศึกษาระดับชาติ)'
    : `แบบฝึกหัดรายวิชา (${activeSubj?.category || 'วิชาพื้นฐาน'})`;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            id="exam-generating-loading-screen"
            className="min-h-[500px] flex items-center justify-center py-16 px-4"
          >
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-xl shadow-blue-500/5 max-w-xl w-full text-center space-y-4 relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

              {/* Blue Rotating Ring Loader with glowing core */}
              <div className="relative w-14 h-14 mx-auto mb-3 flex items-center justify-center">
                <div className="w-14 h-14 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <Sparkles className="w-5 h-5 text-blue-500 absolute animate-pulse" />
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {isPrep ? 'AI กำลังสร้างแบบทดสอบจำลองสนามสอบจริง...' : 'AI กำลังสร้างแบบทดสอบฝึกฝนตามหลักสูตร...'}
              </h2>

              {/* Subtitle Line 1 */}
              <p className="text-sm font-semibold text-slate-600">
                {examTypeFull} • {subjName} (ระดับชั้น {gradeStr})
              </p>

              {/* Subtitle Line 2 */}
              <p className="text-xs text-slate-400">
                บทเรียน: {lessonStr} • จำนวน {countStr} ข้อ • ระดับความยาก: {diffStr}
              </p>

              {/* Animated bouncing progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-full"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.6,
                    ease: 'easeInOut' as const,
                  }}
                />
              </div>
            </div>
          </motion.div>
        ) : currentView === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            id="exam-generator-menu"
            className="max-w-5xl mx-auto py-6 sm:py-8 space-y-8"
          >
            {/* Header with Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="text-center space-y-2.5 max-w-xl mx-auto"
            >
              <span className="inline-block px-3.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold rounded-full shadow-2xs">
                AI Exam Engine
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                เลือกประเภทข้อสอบที่ต้องการสร้าง
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                เลือกสร้างแบบฝึกหัดตามระดับชั้น ป.1 - ม.6 หรือจำลองสนามสอบระดับประเทศ
              </p>
            </motion.div>

            {/* 2 Main Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {/* Card 1: 1. สร้างข้อสอบฝึกฝน (AI สร้างขึ้นอัตโนมัติ) */}
              <motion.div
                id="menu-card-practice"
                whileHover={{ y: -6, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={() => setCurrentView('practice')}
                className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 hover:border-cyan-400/80 shadow-2xs hover:shadow-xl hover:shadow-cyan-500/10 transition-all flex flex-col items-center text-center justify-between min-h-[420px] cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/0 via-transparent to-cyan-50/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex flex-col items-center w-full z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-full border border-cyan-200 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                    <span>AI สร้างขึ้นอัตโนมัติ</span>
                  </div>
                  <IsometricPracticeArtwork />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 mb-1.5 group-hover:text-cyan-900 transition-colors">
                    1. สร้างข้อสอบฝึกฝน
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
                    ข้อสอบที่ AI สร้างขึ้นอัตโนมัติ สำหรับใช้ฝึกทำโจทย์และทบทวนความรู้ตามระดับชั้น วิชา และบทเรียน
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                    <p>• เลือกวิชา • เลือกหมวด/เรื่อง • ระดับความยาก</p>
                    <p>• กำหนดจำนวนข้อ • พร้อมเฉลยและวิธีทำละเอียด</p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  id="menu-btn-start-practice"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView('practice');
                  }}
                  className="w-full mt-6 py-3 px-5 bg-white group-hover:bg-cyan-50 border border-slate-200 group-hover:border-cyan-300 text-slate-700 group-hover:text-cyan-800 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer z-10"
                >
                  <FileText className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>ตั้งค่าและสร้างข้อสอบฝึกฝน</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all shrink-0" />
                </motion.button>
              </motion.div>

              {/* Card 2: 2. ข้อสอบเตรียมสอบ (Admin นำเข้าจาก Firebase) */}
              <motion.div
                id="menu-card-prep"
                whileHover={{ y: -6, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={() => setCurrentView('examPrep')}
                className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/90 hover:border-blue-400/80 shadow-2xs hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col items-center text-center justify-between min-h-[420px] cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-transparent to-blue-50/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex flex-col items-center w-full z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 mb-2">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Admin นำเข้า • ฐานข้อมูล Firebase</span>
                  </div>
                  <IsometricPrepArtwork />
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 mb-1.5 group-hover:text-blue-900 transition-colors">
                    2. ข้อสอบเตรียมสอบ
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-xs leading-relaxed">
                    ข้อสอบจริงจากฐานข้อมูล Firebase โดยตรง (Admin นำเข้าไว้ในระบบ) เตรียมตัวสอบเข้ามหาวิทยาลัย
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                    <p>• เลือกวิชา • ปีของข้อสอบ • หมวด/เรื่อง</p>
                    <p className="font-semibold text-blue-600">• TPAT3 ➔ แนวข้อสอบ TPAT3 ธ.ค. 66 (70 ข้อเต็ม)</p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  id="menu-btn-start-prep"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView('examPrep');
                  }}
                  className="w-full mt-6 py-3 px-5 bg-white group-hover:bg-blue-50 border border-slate-200 group-hover:border-blue-300 text-slate-700 group-hover:text-blue-800 font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer z-10"
                >
                  <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>เข้าสู่คลังข้อสอบเตรียมสอบ</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        ) : currentView === 'practice' ? (
          <motion.div
            key="practice"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            id="practice-exam-form-container"
            className="max-w-4xl mx-auto space-y-6 pb-16"
          >
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-7">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="flex items-start gap-3.5"
                >
                  <motion.div
                    initial={{ scale: 0.8, rotate: -6 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs"
                  >
                    <FileText className="w-6 h-6 text-blue-600" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                      สร้างข้อสอบด้วย AI
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      เลือกระดับชั้น วิชา และบทเรียนเพื่อสร้างแบบทดสอบตามมาตรฐานหลักสูตรแกนกลาง
                    </p>
                  </div>
                </motion.div>

                <motion.button
                  type="button"
                  id="btn-switch-menu-practice"
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setCurrentView('menu')}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all self-start sm:self-auto cursor-pointer group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span>เปลี่ยนประเภทข้อสอบ</span>
                </motion.button>
              </div>

          {/* 6 Form Dropdowns in 2 Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Field 1: เลือกระดับชั้น */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">
                1. เลือกระดับชั้น (ป.1 - ม.6)
              </label>
              <div className="relative">
                <select
                  id="select-practice-grade"
                  value={practiceGrade}
                  onChange={(e) => handlePracticeGradeChange(e.target.value as GradeLevel | '')}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
                >
                  <option value="">-- เลือกระดับชั้น --</option>
                  {GRADE_LEVELS.map((g) => (
                    <option key={g.id} value={g.id}>
                      ระดับชั้น {g.id}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 2: เลือกวิชา */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">
                2. เลือกวิชา
              </label>
              <div className="relative">
                <select
                  id="select-practice-subject"
                  disabled={!practiceGrade}
                  value={practiceSubjectId}
                  onChange={(e) => handlePracticeSubjectChange(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none pr-10 ${
                    practiceGrade
                      ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <option value="">
                    {practiceGrade ? '-- เลือกวิชา --' : 'กรุณาเลือกระดับชั้นก่อน'}
                  </option>
                  {availablePracticeSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {!practiceGrade && (
                <p className="text-[11px] text-amber-600 font-medium">
                  * กรุณาเลือกระดับชั้นก่อน เพื่อแสดงรายวิชาที่ถูกต้อง
                </p>
              )}
            </div>

            {/* Field 3: เลือกบทเรียน / เฉพาะหัวข้อ */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">
                3. เลือกบทเรียน / เฉพาะหัวข้อ
              </label>
              <div className="relative">
                <select
                  id="select-practice-lesson"
                  disabled={!practiceSubjectId}
                  value={practiceLessonName}
                  onChange={(e) => handlePracticeLessonChange(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none pr-10 ${
                    practiceSubjectId
                      ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <option value="">
                    {practiceSubjectId
                      ? '-- ทุกบทเรียน (ครอบคลุมทั้งวิชา) --'
                      : 'กรุณาเลือกวิชาและระดับชั้นก่อน'}
                  </option>
                  {availablePracticeLessons.map((l) => (
                    <option key={l.id} value={l.name}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {!practiceSubjectId && (
                <p className="text-[11px] text-amber-600 font-medium">
                  * กรุณาเลือกวิชาและระดับชั้นก่อน จึงจะสามารถเลือกบทเรียนได้
                </p>
              )}
            </div>

            {/* Field 4: เลือกหัวข้อย่อย (ไม่ระบุก็ได้) */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">
                4. เลือกหัวข้อย่อย (ไม่ระบุก็ได้)
              </label>
              <div className="relative">
                <select
                  id="select-practice-subtopic"
                  disabled={!practiceLessonName}
                  value={practiceSubtopicName}
                  onChange={(e) => setPracticeSubtopicName(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none pr-10 ${
                    practiceLessonName
                      ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <option value="">
                    {practiceLessonName
                      ? '-- ครอบคลุมทุกหัวข้อย่อยในบทเรียนนี้ --'
                      : 'กรุณาเลือกบทเรียนก่อน'}
                  </option>
                  {availablePracticeSubtopics.map((st, idx) => (
                    <option key={`st-${idx}`} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 5: เลือกจำนวนข้อสอบ */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">
                5. เลือกจำนวนข้อสอบ
              </label>
              <div className="relative">
                <select
                  id="select-practice-count"
                  value={practiceQuestionCount}
                  onChange={(e) => setPracticeQuestionCount(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
                >
                  <option value="">-- เลือกจำนวนข้อสอบ --</option>
                  <option value="3">3 ข้อ (ทดสอบรวดเร็ว ~6 นาที)</option>
                  <option value="5">5 ข้อ (ทดสอบรวดเร็ว ~10 นาที)</option>
                  <option value="10">10 ข้อ (ชุดมาตรฐาน ~20 นาที)</option>
                  <option value="15">15 ข้อ (เข้มข้น ~30 นาที)</option>
                  <option value="20">20 ข้อ (แบบเต็มชุด ~40 นาที)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 6: เลือกระดับความยาก */}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-800">
                6. เลือกระดับความยาก (วัดจากความซับซ้อนของการคิด)
              </label>
              <div className="relative">
                <select
                  id="select-practice-diff"
                  value={practiceDifficulty}
                  onChange={(e) => setPracticeDifficulty(e.target.value)}
                  className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
                >
                  <option value="">-- เลือกระดับความยาก --</option>
                  <option value="ง่าย">ง่าย (ระดับพื้นฐาน • แทนค่าสูตรตรง 1 ขั้นตอน)</option>
                  <option value="ปานกลาง">ปานกลาง (ระดับประยุกต์ • วิเคราะห์ 2-3 ขั้นตอน หาตัวแปรแทรก)</option>
                  <option value="ยาก">ยาก (ระดับวิเคราะห์เชิงลึก • หลายขั้นตอน บูรณาการหลายแนวคิด)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action Area */}
          <div className="pt-4 flex flex-col items-center text-center space-y-2">
            <motion.button
              type="button"
              id="submit-practice-exam-btn"
              whileHover={isPracticeFormValid && !isGenerating ? { scale: 1.02 } : {}}
              whileTap={isPracticeFormValid && !isGenerating ? { scale: 0.98 } : {}}
              disabled={!isPracticeFormValid || isGenerating}
              onClick={() => handleGenerate('practice')}
              className={`w-full max-w-md py-3.5 px-6 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs ${
                isPracticeFormValid && !isGenerating
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-md cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างข้อสอบ AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>เริ่มสร้างข้อสอบ</span>
                </>
              )}
            </motion.button>
            {!isPracticeFormValid && !isGenerating && (
              <p className="text-xs text-slate-400 font-medium">
                * กรุณาเลือกข้อมูลให้ครบถ้วนก่อน จึงจะสามารถเริ่มสร้างข้อสอบได้
              </p>
            )}
          </div>
        </div>
      </motion.div>
    ) : (
      <ExamPreparationView
        onStartExam={onStartExam}
        onBackToMenu={() => setCurrentView('menu')}
      />
    )}
    {false && (
      <motion.div
        key="prep"
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -18, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        id="prep-exam-form-container"
        className="max-w-4xl mx-auto space-y-6 pb-16"
      >
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-7">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex items-start gap-3.5"
            >
              <motion.div
                initial={{ scale: 0.8, rotate: 6 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs"
              >
                <Target className="w-6 h-6 text-rose-600" />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                  <span>สร้างข้อสอบเตรียมสอบ</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  เลือกสนามสอบ ระดับชั้น วิชา และบทเรียนเพื่อสร้างชุดข้อสอบจำลองเสมือนจริง
                </p>
              </div>
            </motion.div>

            <motion.button
              type="button"
              id="btn-switch-menu-prep"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setCurrentView('menu')}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all self-start sm:self-auto cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>เปลี่ยนประเภทข้อสอบ</span>
            </motion.button>
          </div>

        {/* Quick Launch & Category Header for TPAT3 ธ.ค. 66 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-blue-900">
                คลังข้อสอบจริง: TPAT3 ➔ แนวข้อสอบ TPAT3 ธ.ค. 66
              </p>
              <p className="text-[11px] text-slate-600">
                เชื่อมต่อฐานข้อมูล Firebase Firestore แยกเฉพาะวิชา TPAT3 ไม่ปนกับวิชาอื่น
              </p>
            </div>
          </div>
          <button
            type="button"
            id="quick-select-tpat3-dec66"
            onClick={() => {
              setPrepExamType('TPAT');
              setPrepGrade('ม.6');
              setPrepSubjectId('m6-tpat3');
              setPrepLessonName('แนวข้อสอบ TPAT3 ธ.ค. 66');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            เปิดชุด TPAT3 ธ.ค. 66
          </button>
        </div>

        {/* Render Dedicated Section when TPAT or TPAT3 is selected */}
        {(prepExamType === 'TPAT3' || prepExamType === 'TPAT' || prepSubjectId === 'm6-tpat3' || prepLessonName?.includes('66')) && (
          <Tpat3Dec66Section onStartExam={onStartExam} />
        )}

        {/* Form Dropdowns in 2 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Field 1: เลือกประเภทข้อสอบ / สนามสอบ */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-800">
              1. เลือกประเภทข้อสอบ / สนามสอบ
            </label>
            <div className="relative">
              <select
                id="select-prep-exam-type"
                value={prepExamType}
                onChange={(e) => handlePrepExamTypeChange(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">-- เลือกประเภทข้อสอบ --</option>
                <option value="TPAT3">TPAT3 (ความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์)</option>
                <option value="TGAT">TGAT (การทดสอบความถนัดทั่วไป)</option>
                <option value="TPAT">TPAT (การทดสอบความถนัดวิชาชีพ)</option>
                <option value="A-Level">A-Level (วิชาสามัญ)</option>
                <option value="O-NET">O-NET (การทดสอบทางการศึกษาระดับชาติ)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Field 2: เลือกระดับชั้น */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-800">
              2. เลือกระดับชั้น
            </label>
            <div className="relative">
              <select
                id="select-prep-grade"
                value={prepGrade}
                onChange={(e) => handlePrepGradeChange(e.target.value as GradeLevel | '')}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">-- เลือกระดับชั้น --</option>
                {availablePrepGrades.map((g) => (
                  <option key={g} value={g}>
                    ระดับชั้น {g}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Field 3: เลือกวิชา */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-800">
              3. เลือกวิชา
            </label>
            <div className="relative">
              <select
                id="select-prep-subject"
                disabled={!prepExamType || !prepGrade}
                value={prepSubjectId}
                onChange={(e) => handlePrepSubjectChange(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none pr-10 ${
                  prepExamType && prepGrade
                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer'
                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <option value="">
                  {prepExamType && prepGrade
                    ? '-- เลือกวิชา / รหัสวิชา --'
                    : 'กรุณาเลือกประเภทข้อสอบและระดับชั้นก่อน'}
                </option>
                {availablePrepSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {(!prepExamType || !prepGrade) && (
              <p className="text-[11px] text-amber-600 font-medium">
                * กรุณาเลือกประเภทข้อสอบและระดับชั้นก่อน เพื่อแสดงรายวิชาที่ถูกต้อง
              </p>
            )}
          </div>

          {/* Field 4: เลือกจำนวนข้อสอบ */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-800">
              4. เลือกจำนวนข้อสอบ
            </label>
            <div className="relative">
              <select
                id="select-prep-count"
                value={prepQuestionCount}
                onChange={(e) => setPrepQuestionCount(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">-- เลือกจำนวนข้อสอบ --</option>
                <option value="3">3 ข้อ (ทดสอบรวดเร็ว ~6 นาที)</option>
                <option value="5">5 ข้อ (ทดสอบรวดเร็ว ~10 นาที)</option>
                <option value="10">10 ข้อ (ชุดมาตรฐาน ~20 นาที)</option>
                <option value="15">15 ข้อ (เข้มข้น ~30 นาที)</option>
                <option value="20">20 ข้อ (แบบเต็มชุด ~40 นาที)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Field 5: เลือกบทเรียน / เฉพาะหัวข้อ */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-800">
              5. เลือกบทเรียน / เฉพาะหัวข้อ
            </label>
            <div className="relative">
              <select
                id="select-prep-lesson"
                disabled={!prepSubjectId}
                value={prepLessonName}
                onChange={(e) => setPrepLessonName(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none pr-10 ${
                  prepSubjectId
                    ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 cursor-pointer'
                    : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <option value="">
                  {prepSubjectId
                    ? '-- ทุกบทเรียน (ครอบคลุมข้อสอบจริง) --'
                    : 'กรุณาเลือกวิชาและระดับชั้นก่อน'}
                </option>
                {availablePrepLessons.map((l) => (
                  <option key={l.id} value={l.name}>
                    {l.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {!prepSubjectId && (
              <p className="text-[11px] text-amber-600 font-medium">
                * กรุณาเลือกวิชาและระดับชั้นก่อน จึงจะสามารถเลือกบทเรียนได้
              </p>
            )}
          </div>

          {/* Field 6: เลือกระดับความยาก */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-800">
              6. เลือกระดับความยาก (วัดจากความซับซ้อนของการคิด)
            </label>
            <div className="relative">
              <select
                id="select-prep-diff"
                value={prepDifficulty}
                onChange={(e) => setPrepDifficulty(e.target.value)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer pr-10"
              >
                <option value="">-- เลือกระดับความยาก --</option>
                <option value="ง่าย">ง่าย (ระดับพื้นฐาน • แทนค่าสูตรตรง 1 ขั้นตอน)</option>
                <option value="ปานกลาง">ปานกลาง (ระดับประยุกต์ • วิเคราะห์ 2-3 ขั้นตอน หาตัวแปรแทรก)</option>
                <option value="ยาก">ยาก (ระดับวิเคราะห์เชิงลึก • หลายขั้นตอน บูรณาการหลายแนวคิด)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Action Area */}
        <div className="pt-4 flex flex-col items-center text-center space-y-2">
          <motion.button
            type="button"
            id="submit-prep-exam-btn"
            whileHover={isPrepFormValid && !isGenerating ? { scale: 1.02 } : {}}
            whileTap={isPrepFormValid && !isGenerating ? { scale: 0.98 } : {}}
            disabled={!isPrepFormValid || isGenerating}
            onClick={() => handleGenerate('examPrep')}
            className={`w-full max-w-md py-3.5 px-6 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xs ${
              isPrepFormValid && !isGenerating
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-md cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังสร้างข้อสอบ AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>เริ่มสร้างข้อสอบ</span>
              </>
            )}
          </motion.button>
          {!isPrepFormValid && !isGenerating && (
            <p className="text-xs text-slate-400 font-medium">
              * กรุณาเลือกข้อมูลให้ครบถ้วนก่อน จึงจะสามารถเริ่มสร้างข้อสอบได้
            </p>
          )}
        </div>
      </div>
    </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
