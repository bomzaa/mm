import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Trophy,
  MessageSquare,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ReactMarkdown from 'react-markdown';
import { ExamData, ExamHistoryItem, Question } from '../types';
import { StorageService } from '../lib/storage';
import { FirestoreService } from '../lib/firestoreService';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>(() =>
    exam.questions.map((q) => ({ ...q, userSelectedIndex: undefined, isFlagged: false }))
  );
  const [secondsRemaining, setSecondsRemaining] = useState(exam.timeLimitMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Timer effect
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (isFinished) return;
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === currentIndex ? { ...q, userSelectedIndex: optIndex } : q))
    );
  };

  const handleToggleFlag = () => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === currentIndex ? { ...q, isFlagged: !q.isFlagged } : q))
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

    // Save to history
    const historyItem: ExamHistoryItem = {
      id: `hist-${Date.now()}`,
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

    StorageService.saveExamAttempt(historyItem);
    FirestoreService.saveExamAttempt(historyItem).catch((err) =>
      console.warn('Firestore sync attempt:', err)
    );

    // Confetti celebration if score >= 60%
    if (percentage >= 50) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.log('Confetti triggered');
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stats calculation
  const correctCount = questions.filter((q) => q.userSelectedIndex === q.correctOptionIndex).length;
  const answeredCount = questions.filter((q) => q.userSelectedIndex !== undefined).length;
  const percentage = Math.round((correctCount / questions.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        id="exam-taking-container"
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase px-2.5 py-1 rounded-md bg-indigo-600 text-white">
              {exam.category}
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-[200px] sm:max-w-md">
                {exam.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isFinished ? 'ผลการสอบและการเฉลย' : `ข้อที่ ${currentIndex + 1} จากทั้งหมด ${questions.length} ข้อ`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isFinished && (
              <div
                id="exam-timer-display"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold ${
                  secondsRemaining < 60
                    ? 'bg-rose-500/20 text-rose-300 animate-pulse border border-rose-500/30'
                    : 'bg-slate-800 text-amber-400 border border-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            )}

            <button
              id="close-exam-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {!isFinished ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Question & Choices (scrollable) */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Question Text */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                    ข้อที่ {currentIndex + 1}
                  </span>
                  {currentQ.subtopic && (
                    <span className="text-xs text-slate-500 font-medium">
                      หัวข้อ: {currentQ.subtopic}
                    </span>
                  )}
                </div>

                <div className="text-base font-semibold text-slate-900 leading-relaxed whitespace-pre-wrap">
                  {currentQ.questionText}
                </div>
              </div>

              {/* Option Choices */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  เลือกคำตอบที่ถูกต้องที่สุด:
                </label>
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = currentQ.userSelectedIndex === optIdx;
                  return (
                    <div
                      key={optIdx}
                      id={`choice-${currentIndex}-${optIdx}`}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-300 text-slate-500 bg-white'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </div>
                      <span className="text-sm font-medium leading-normal">{optionText}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Question Navigation Palette (Sidebar) */}
            <div className="w-full md:w-72 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-4 flex flex-col justify-between shrink-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">ผังข้อสอบ (Question Map)</span>
                  <button
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      currentQ.isFlagged
                        ? 'bg-amber-100 border-amber-300 text-amber-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${currentQ.isFlagged ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>{currentQ.isFlagged ? 'ปักธงแล้ว' : 'ปักธงข้อนี้'}</span>
                  </button>
                </div>

                {/* Question Grid Numbers */}
                <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = q.userSelectedIndex !== undefined;
                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative h-9 rounded-lg font-bold text-xs flex items-center justify-center border transition-all cursor-pointer ${
                          isCurrent
                            ? 'ring-2 ring-indigo-600 ring-offset-1 border-indigo-600 text-indigo-700 bg-indigo-50 font-black'
                            : isAnswered
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {q.isFlagged && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>ทำแล้ว:</span>
                    <span className="font-bold text-slate-800">{answeredCount}/{questions.length} ข้อ</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ปักธงทบทวน:</span>
                    <span className="font-bold text-amber-600">
                      {questions.filter((q) => q.isFlagged).length} ข้อ
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Controls */}
              <div className="pt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>ก่อนหน้า</span>
                  </button>

                  <button
                    disabled={currentIndex === questions.length - 1}
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>ถัดไป</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  id="submit-exam-btn"
                  onClick={() => {
                    const unanswered = questions.length - answeredCount;
                    const confirmMsg =
                      unanswered > 0
                        ? `คุณยังไม่ได้ตอบอีก ${unanswered} ข้อ คุณแน่ใจหรือไม่ว่าต้องการส่งข้อสอบ?`
                        : 'คุณต้องการส่งข้อสอบและตรวจคำตอบทันทีหรือไม่?';
                    if (confirm(confirmMsg)) {
                      handleFinishExam();
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ส่งคำตอบและตรวจผล</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Result & Explanation Review View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-50/50">
            {/* Score Hero Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {percentage >= 70 ? '🎉 ยอดเยี่ยมมาก!' : percentage >= 50 ? '👍 ผ่านเกณฑ์ระดับดี' : '💪 ฝึกฝนเพิ่มอีกนิด'}
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                  {correctCount} / {questions.length}
                </h3>
                <p className="text-sm text-slate-500 font-semibold mt-1">
                  คะแนนที่ได้ {percentage}% • ใช้เวลาไป {formatTime(timeSpent)}
                </p>
              </div>

              {/* Stat Pills */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <div className="text-emerald-700 font-black text-lg">{correctCount}</div>
                  <div className="text-[11px] font-bold text-emerald-600">ตอบถูก</div>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
                  <div className="text-rose-700 font-black text-lg">{questions.length - correctCount}</div>
                  <div className="text-[11px] font-bold text-rose-600">ตอบผิด/ไม่ตอบ</div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                  <div className="text-indigo-700 font-black text-lg">{Math.round(timeSpent / questions.length)}s</div>
                  <div className="text-[11px] font-bold text-indigo-600">เฉลี่ยต่อข้อ</div>
                </div>
              </div>
            </div>

            {/* Detailed Question Review List */}
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-800 text-lg">เฉลยและวิธีคิดอย่างละเอียด</h4>
                <span className="text-xs text-slate-500">คลิก "ถาม AI" เพื่อติวเฉพาะข้อนั้น</span>
              </div>

              {questions.map((q, qIndex) => {
                const isCorrect = q.userSelectedIndex === q.correctOptionIndex;
                return (
                  <div
                    key={q.id || qIndex}
                    className={`bg-white rounded-2xl p-5 sm:p-6 border-2 shadow-2xs space-y-4 ${
                      isCorrect ? 'border-emerald-200' : 'border-rose-200'
                    }`}
                  >
                    {/* Header: Question Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {qIndex + 1}
                        </span>
                        <span className="font-bold text-sm text-slate-800">
                          {isCorrect ? 'ถูกต้อง (+1 คะแนน)' : 'ตอบผิด หรือไม่ได้ตอบ'}
                        </span>
                      </div>

                      {onAskAIAboutQuestion && (
                        <button
                          onClick={() => {
                            const userChoiceText =
                              q.userSelectedIndex !== undefined
                                ? q.options[q.userSelectedIndex]
                                : 'ไม่ได้ตอบ';
                            const correctChoiceText = q.options[q.correctOptionIndex];
                            onAskAIAboutQuestion(q.questionText, q.explanation, userChoiceText, correctChoiceText);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          <span>ถาม AI ติวเตอร์ข้อนี้</span>
                        </button>
                      )}
                    </div>

                    {/* Question Text */}
                    <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">
                      {q.questionText}
                    </p>

                    {/* Options Breakdown */}
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isThisCorrect = optIdx === q.correctOptionIndex;
                        const isThisUserSelected = optIdx === q.userSelectedIndex;

                        let style = 'bg-slate-50 border-slate-200 text-slate-700';
                        if (isThisCorrect) {
                          style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                        } else if (isThisUserSelected && !isThisCorrect) {
                          style = 'bg-rose-50 border-rose-400 text-rose-900 line-through';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center bg-white border border-slate-300 text-slate-600">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>

                            {isThisCorrect && (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>คำตอบที่ถูกต้อง</span>
                              </span>
                            )}
                            {isThisUserSelected && !isThisCorrect && (
                              <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>คำตอบของคุณ</span>
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Box */}
                    <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>คำอธิบายเฉลยและวิธีคิดเชิงลึก:</span>
                      </div>
                      <div className="markdown-body text-xs sm:text-sm text-slate-800 leading-relaxed">
                        <ReactMarkdown>{q.explanation}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Back / Action */}
            <div className="text-center pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                เสร็จสิ้นและกลับสู่หน้าหลัก
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
