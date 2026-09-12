import React, { useState, useEffect } from 'react';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  LayoutDashboard,
  Check,
  Copy,
  Sparkles,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MathRenderer } from './MathRenderer';
import { QuestionImageRenderer } from './QuestionImageRenderer';
import { ExamData, ExamHistoryItem, Question } from '../types';
import { StorageService } from '../lib/storage';
import { FirestoreService } from '../lib/firestoreService';
import { formatHumanReadableText } from '../utils/examFormatter';
import { CompanionService } from '../lib/companionEvents';

interface ExamTakingModalProps {
  exam: ExamData;
  onClose: () => void;
  onAskAIAboutQuestion?: (questionText: string, explanation: string, userChoice: string, correctChoice: string) => void;
}

export const ExamTakingModal: React.FC<ExamTakingModalProps> = ({
  exam,
  onClose,
  onAskAIAboutQuestion,
}) => {
  const sanitizeQuestionChoices = (q: Question): Question => {
    // If official exam (such as TPAT3) or questions with images / diagrams, strictly preserve all choices & visual assets!
    const isOfficialOrVisual = Boolean(
      (q.optionImages && q.optionImages.length > 0) ||
      q.diagramSvg ||
      q.imageUrl ||
      q.id?.includes('tpat3') ||
      exam.category === 'TPAT' ||
      exam.examCode === 'TPAT3' ||
      exam.title?.includes('TPAT3')
    );

    const cleanText = (opt: any) => {
      if (typeof opt !== 'string') return String(opt || '');
      let s = opt.trim();
      s = s.replace(/^(\(?[A-Ea-eก-จ1-5]\)?[\.\:\)\s\-]+)/, '').trim();
      return s || opt.trim();
    };

    if (isOfficialOrVisual) {
      const rawOpts = Array.isArray(q.options) ? q.options.map(cleanText) : [];
      let correctIdx =
        typeof q.correctOptionIndex === 'number' &&
        q.correctOptionIndex >= 0 &&
        q.correctOptionIndex < rawOpts.length
          ? q.correctOptionIndex
          : 0;

      return {
        ...q,
        options: rawOpts,
        optionImages: q.optionImages ? [...q.optionImages] : undefined,
        diagramSvg: q.diagramSvg,
        imageUrl: q.imageUrl,
        correctOptionIndex: correctIdx,
        userSelectedIndex: undefined,
        isFlagged: false,
      };
    }

    const rawOpts = Array.isArray(q.options)
      ? q.options.map(cleanText).filter((t: string) => t.length > 0)
      : [];

    const distinct: string[] = [];
    const seen = new Set<string>();
    for (const o of rawOpts) {
      const norm = o.toLowerCase().trim();
      if (!seen.has(norm) && distinct.length < 4) {
        seen.add(norm);
        distinct.push(o);
      }
    }

    const fallbacks = [
      'ข้อมูลไม่เพียงพอในการสรุปผล',
      'สรุปผลคลาดเคลื่อนจากหลักวิชาการ',
      'ตัวแปรและเงื่อนไขไม่สอดคล้องกัน',
      'มีเงื่อนไขขัดแย้งกับหลักการพื้นฐาน',
    ];
    let p = 0;
    while (distinct.length < 4) {
      const c = fallbacks[p % fallbacks.length] + (p >= 4 ? ` (${p})` : '');
      if (!seen.has(c.toLowerCase())) {
        seen.add(c.toLowerCase());
        distinct.push(c);
      }
      p++;
    }

    const final4 = distinct.slice(0, 4);
    let correctIdx =
      typeof q.correctOptionIndex === 'number' &&
      q.correctOptionIndex >= 0 &&
      q.correctOptionIndex < 4
        ? q.correctOptionIndex
        : 0;

    return {
      ...q,
      options: final4,
      correctOptionIndex: correctIdx,
      userSelectedIndex: undefined,
      isFlagged: false,
    };
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(() =>
    exam.questions.map(sanitizeQuestionChoices)
  );
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [filterTab, setFilterTab] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Elapsed timer effect (counts up matching video: "0 นาที 1 วินาที")
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  const currentQ = questions[currentIndex];

  const renderOptionVisual = (optionImage?: string | null, optText?: string) => {
    if (optionImage) {
      if (optionImage.trim().startsWith('<svg')) {
        return (
          <div
            className="my-2 p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-center max-w-full overflow-hidden"
            dangerouslySetInnerHTML={{ __html: optionImage }}
          />
        );
      }
      return (
        <div className="my-2 p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-center">
          <img
            src={optionImage}
            alt="ตัวเลือกคำตอบ"
            className="max-h-28 w-auto object-contain rounded-lg"
          />
        </div>
      );
    }
    if (optText && optText.trim().startsWith('<svg')) {
      return (
        <div
          className="my-2 p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-center max-w-full overflow-hidden"
          dangerouslySetInnerHTML={{ __html: optText }}
        />
      );
    }
    return null;
  };

  const handleSelectOption = (optIndex: number) => {
    if (isFinished) return;
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === currentIndex ? { ...q, userSelectedIndex: optIndex } : q))
    );
  };

  const handleFinishExam = () => {
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    setTimeSpent(totalTime);
    setIsFinished(true);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      if (q.userSelectedIndex === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    // Save to history with guaranteed unique ID
    const historyItem: ExamHistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      examId: exam.id,
      title: exam.title,
      category: exam.category,
      subject: exam.subject,
      difficulty: exam.difficulty,
      score: correctCount,
      totalQuestions: questions.length,
      percentage,
      timeSpentSeconds: totalTime,
      completedAt: new Date().toISOString(),
      questions,
    };

    FirestoreService.saveExamAttempt(historyItem).catch((err) =>
      console.warn('Firestore sync attempt:', err)
    );

    // Confetti celebration if score >= 50%
    if (percentage >= 50) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.log('Confetti triggered');
      }
    }

    // Companion reaction based on test completion
    if (percentage >= 80) {
      CompanionService.triggerReaction('excited', `ยอดเยี่ยมมาก! ได้คะแนน ${percentage}% (${correctCount}/${questions.length}) เก่งมาก! 🏆`, 4500);
    } else if (percentage >= 50) {
      CompanionService.triggerReaction('happy', `เก่งมาก! ได้คะแนน ${percentage}% (${correctCount}/${questions.length}) พยายามต่อไปนะ ✨`, 4000);
    } else {
      CompanionService.triggerReaction('idle', `ทำข้อสอบชุดนี้เสร็จเรียบร้อยนะ! ไม่เป็นไร ค่อย ๆ เรียนรู้ทีละขั้น สู้ ๆ นะครับ 💖`, 4000);
    }
  };

  const formatElapsedThai = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} นาที ${s} วินาที`;
  };

  const formatDateTimeThai = () => {
    const now = new Date();
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    const day = now.getDate();
    const month = thaiMonths[now.getMonth()];
    const year = now.getFullYear() + 543;
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} เวลา ${hours}:${mins}`;
  };

  // Stats calculation
  const correctCount = questions.filter((q) => q.userSelectedIndex === q.correctOptionIndex).length;
  const answeredCount = questions.filter((q) => q.userSelectedIndex !== undefined).length;
  const percentage = Math.round((correctCount / questions.length) * 100);

  const getCategoryFullName = (cat?: string) => {
    if (!cat) return 'แบบทดสอบมาตรฐาน';
    if (cat === 'TGAT') return 'TGAT (การทดสอบความถนัดทั่วไป)';
    if (cat === 'TPAT') return 'TPAT (การทดสอบความถนัดวิชาชีพ)';
    if (cat === 'A-Level') return 'A-Level (การทดสอบความรู้เชิงวิชาการ)';
    if (cat === 'O-NET') return 'O-NET (การทดสอบทางการศึกษาระดับชาติ)';
    return `${cat} (${exam.subjectCategory || 'แบบฝึกหัดตามหลักสูตร'})`;
  };

  const getOptionLetter = (idx: number) => String.fromCharCode(65 + idx);

  // Copy explanation helper
  const handleCopyExplanation = (id: string, text: string) => {
    const readable = formatHumanReadableText(text);
    navigator.clipboard.writeText(readable);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter questions for result review
  const filteredQuestions = questions.map((q, originalIdx) => ({ ...q, originalIdx })).filter((q) => {
    const isCorrect = q.userSelectedIndex === q.correctOptionIndex;
    if (filterTab === 'correct') return isCorrect;
    if (filterTab === 'incorrect') return !isCorrect;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full min-h-screen overflow-hidden">
      <div
        id="exam-taking-container"
        className="w-full h-full flex flex-col justify-between overflow-y-auto bg-white"
      >
        {/* ================= 1. ACTIVE EXAM TAKING VIEW (FULL SCREEN) ================= */}
        {!isFinished ? (
          <div className="flex-1 flex flex-col justify-between min-h-full">
            {/* Header Area */}
            <header className="w-full border-b border-slate-100 bg-white/95 backdrop-blur-xs sticky top-0 z-20 px-4 sm:px-8 py-4">
              <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Badges Left */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-2xs">
                      {getCategoryFullName(exam.category)}
                    </span>
                    <span className="px-3.5 py-1 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200">
                      {exam.subject} {exam.gradeLevel ? `• ระดับชั้น ${exam.gradeLevel}` : ''}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium pt-0.5">
                    บทเรียน: {exam.lesson || `ครอบคลุมทุกบทเรียนในวิชา ${exam.subject}`}
                  </p>
                </div>

                {/* Status Right */}
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  {/* Timer */}
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-mono text-xs sm:text-sm font-bold shadow-2xs">
                    <Clock className="w-4 h-4" />
                    <span>{formatElapsedThai(elapsedSeconds)}</span>
                  </div>

                  {/* Answered Count */}
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-semibold">
                    ตอบแล้ว {answeredCount} / {questions.length} ข้อ
                  </div>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer active:scale-95"
                    title="ปิดแบบทดสอบ"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>

            {/* Question Body Area (Spacious & Full Width) */}
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
              {/* Question Subheader & Text */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">
                    ข้อที่ {currentIndex + 1} จากทั้งหมด {questions.length} ข้อ
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-xs sm:text-sm">
                    ระดับความยาก: {exam.difficulty || 'ปานกลาง'}
                  </span>
                </div>

                <div className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-relaxed pt-2">
                  <MathRenderer content={currentQ.questionText} />
                </div>
              </div>

              {/* Question Diagram or Technical Illustration */}
              {(currentQ.diagramSvg || currentQ.imageUrl) && (
                <QuestionImageRenderer
                  diagramSvg={currentQ.diagramSvg}
                  imageUrl={currentQ.imageUrl}
                  caption={`รูปภาพประกอบโจทย์ข้อที่ ${currentIndex + 1}${
                    currentQ.topic ? ` (${currentQ.topic})` : ''
                  }`}
                />
              )}

              {/* Options List (Supports diagram/image choices and responsive layout) */}
              <div
                className={
                  currentQ.optionImages?.some(Boolean)
                    ? 'grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2'
                    : 'space-y-3.5 pt-2'
                }
              >
                {currentQ.options.map((optText, optIdx) => {
                  const isSelected = currentQ.userSelectedIndex === optIdx;
                  const letter = getOptionLetter(optIdx);
                  const optImg = currentQ.optionImages?.[optIdx];
                  const hasVisual = Boolean(optImg || optText.trim().startsWith('<svg'));

                  return (
                    <div
                      key={optIdx}
                      id={`choice-${currentIndex}-${optIdx}`}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 select-none ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'bg-slate-100 border border-slate-200 text-slate-600'
                            }`}
                          >
                            {letter}
                          </div>
                          <span className="font-bold text-slate-900 select-none">
                            {letter}.
                          </span>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Option Diagram / Image if present */}
                      {hasVisual && (
                        <div className="w-full">
                          {renderOptionVisual(optImg, optText)}
                        </div>
                      )}

                      {/* Text label (hide if optText is raw SVG) */}
                      {!optText.trim().startsWith('<svg') && optText.trim().length > 0 && (
                        <div className="text-sm sm:text-base leading-normal flex-1">
                          <MathRenderer content={optText} inline />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </main>

            {/* Bottom Footer Navigation Bar (Sticky Bottom / Full Width) */}
            <footer className="w-full border-t border-slate-100 bg-white/95 backdrop-blur-xs py-4 sm:py-5 px-4 sm:px-8 mt-auto shrink-0">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="py-3 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>ข้อก่อนหน้า</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="py-3 px-7 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>ข้อถัดไป</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    id="btn-submit-exam"
                    onClick={handleFinishExam}
                    className="py-3 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ส่งข้อสอบ / ตรวจคำตอบ</span>
                  </button>
                )}
              </div>
            </footer>
          </div>
        ) : (
          /* ================= 2. EXAM RESULT REVIEW VIEW (FULL SCREEN) ================= */
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
              {/* Gradient Top Banner Matching Video */}
              <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Left Details */}
                <div className="space-y-3 max-w-xl">
                  <div className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-lg backdrop-blur-xs">
                    ผลการทดสอบ: {exam.category} • {exam.subject}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                    สรุปคะแนนของคุณ
                  </h1>

                  <p className="text-xs sm:text-sm text-blue-100 font-medium">
                    ทำเมื่อ {formatDateTimeThai()} (ใช้เวลา {formatElapsedThai(timeSpent)})
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>สร้างแบบทดสอบใหม่</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-xs flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>กลับไปยัง Dashboard</span>
                    </button>
                  </div>
                </div>

                {/* Right Score Box */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 text-center shadow-md min-w-[150px] self-stretch md:self-auto flex flex-col items-center justify-center">
                  <div className="text-4xl sm:text-5xl font-black text-slate-900">
                    {correctCount} / {questions.length}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-1">
                    คิดเป็น {percentage}%
                  </div>
                </div>
              </div>

              {/* Solutions & Explanation Section */}
              <div className="space-y-6">
                {/* Filter Tabs & Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    เฉลยข้อสอบและคำอธิบายอย่างละเอียด
                  </h3>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setFilterTab('all')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filterTab === 'all'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ทั้งหมด ({questions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('correct')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filterTab === 'correct'
                          ? 'bg-white text-emerald-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ข้อที่ถูก ({correctCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTab('incorrect')}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        filterTab === 'incorrect'
                          ? 'bg-white text-rose-700 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ข้อที่ผิด ({questions.length - correctCount})
                    </button>
                  </div>
                </div>

                {/* Question Review Cards */}
                <div className="space-y-6">
                  {filteredQuestions.map((q) => {
                    const isCorrect = q.userSelectedIndex === q.correctOptionIndex;
                    const correctLetter = getOptionLetter(q.correctOptionIndex);

                    return (
                      <div
                        key={q.id || q.originalIdx}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-5"
                      >
                        {/* Header: Question Text & Status Badge */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="font-bold text-base text-slate-900 leading-relaxed flex items-start gap-1.5 flex-1">
                            <span className="shrink-0">ข้อ {q.originalIdx + 1}.</span>
                            <div className="flex-1">
                              <MathRenderer content={q.questionText} />
                            </div>
                          </div>

                          <span
                            className={`shrink-0 text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
                              isCorrect
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>ถูกต้อง</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>ตอบผิด</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* Question Diagram in Review */}
                        {(q.diagramSvg || q.imageUrl) && (
                          <QuestionImageRenderer
                            diagramSvg={q.diagramSvg}
                            imageUrl={q.imageUrl}
                            caption={`รูปภาพประกอบโจทย์ข้อที่ ${q.originalIdx + 1}`}
                          />
                        )}

                        {/* Choices 2x2 or Stacked List */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((optText, optIdx) => {
                            const isThisCorrect = optIdx === q.correctOptionIndex;
                            const isThisUserSelected = optIdx === q.userSelectedIndex;
                            const letter = getOptionLetter(optIdx);
                            const optImg = q.optionImages?.[optIdx];
                            const hasVisual = Boolean(optImg || optText.trim().startsWith('<svg'));

                            let borderStyle = 'border-slate-200 bg-slate-50/50 text-slate-700';
                            if (isThisCorrect) {
                              borderStyle = 'border-2 border-emerald-400 bg-emerald-50/50 text-slate-900 font-semibold';
                            } else if (isThisUserSelected && !isThisCorrect) {
                              borderStyle = 'border-2 border-rose-300 bg-rose-50/50 text-slate-900 font-semibold';
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 text-xs sm:text-sm ${borderStyle}`}
                              >
                                <div className="flex items-center justify-between gap-2.5 w-full">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                                        isThisCorrect
                                          ? 'bg-emerald-600 text-white'
                                          : isThisUserSelected
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-white border border-slate-300 text-slate-600'
                                      }`}
                                    >
                                      {letter}
                                    </span>
                                    <span className="font-bold text-slate-800 select-none">{letter}.</span>
                                  </div>

                                  {isThisUserSelected && !isThisCorrect && (
                                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-bold shrink-0">
                                      คุณตอบข้อนี้
                                    </span>
                                  )}
                                  {isThisCorrect && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[11px] font-bold shrink-0">
                                      คำตอบที่ถูก
                                    </span>
                                  )}
                                </div>

                                {hasVisual && (
                                  <div className="w-full">
                                    {renderOptionVisual(optImg, optText)}
                                  </div>
                                )}

                                {!optText.trim().startsWith('<svg') && optText.trim().length > 0 && (
                                  <div className="flex-1">
                                    <MathRenderer content={optText} inline />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Step-by-Step Detailed Explanation Box */}
                        <div className="bg-sky-50/80 border border-sky-200/90 rounded-2xl p-5 space-y-3.5">
                          <div className="flex items-center justify-between gap-2 border-b border-sky-200/60 pb-2.5">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-950">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>วิธีคิดและเฉลยละเอียดทีละขั้นตอน:</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyExplanation(q.id || `q-${q.originalIdx}`, q.explanation)}
                              className="p-1 text-sky-700 hover:text-sky-900 rounded-md hover:bg-sky-100/60 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                              title="คัดลอกคำอธิบาย"
                            >
                              {copiedId === (q.id || `q-${q.originalIdx}`) ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 text-[11px]">คัดลอกแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">คัดลอก</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Formatted Explanation Content with KaTeX Math */}
                          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                            <MathRenderer content={q.explanation} />
                          </div>

                          {/* Conclusion Pill */}
                          <div className="pt-1 flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-2xs">
                              สรุปคำตอบ ตัวเลือก {correctLetter}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
