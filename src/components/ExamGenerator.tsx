import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
  Play,
  Trash2,
  Layers,
  ChevronRight,
  Brain,
  Zap,
  Sliders,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { ExamCategory, ExamData, Question } from '../types';
import { EXAM_SUBJECTS, SAMPLE_EXAMS } from '../data/examCatalog';
import { StorageService } from '../lib/storage';
import { FirestoreService } from '../lib/firestoreService';

interface ExamGeneratorProps {
  onStartExam: (exam: ExamData) => void;
  initialCategory?: ExamCategory;
  initialSubjectId?: string;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({
  onStartExam,
  initialCategory = 'TGAT',
  initialSubjectId = 'tgat1',
}) => {
  const [category, setCategory] = useState<ExamCategory>(initialCategory);
  const [subjectId, setSubjectId] = useState<string>(initialSubjectId);
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'ง่าย' | 'ปานกลาง' | 'ยาก' | 'ระดับข้อสอบจริง'>('ปานกลาง');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [savedExams, setSavedExams] = useState<ExamData[]>(() => StorageService.getSavedExams());

  const currentSubjectObj = EXAM_SUBJECTS.find((s) => s.id === subjectId) || EXAM_SUBJECTS[0];
  const filteredSubjects = EXAM_SUBJECTS.filter((s) => s.category === category);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject: currentSubjectObj.name,
          topic: topic.trim() || undefined,
          difficulty,
          questionCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`สร้างข้อสอบไม่สำเร็จ: ${response.status}`);
      }

      const generatedData = await response.json();

      const newExam: ExamData = {
        id: `exam-${Date.now()}`,
        title: generatedData.title || `ชุดข้อสอบ ${currentSubjectObj.name} (${difficulty})`,
        category,
        subject: currentSubjectObj.name,
        topic: topic || 'ตาม Test Blueprint',
        difficulty,
        description: generatedData.description || `ชุดข้อสอบจำลอง ${questionCount} ข้อ พร้อมเฉลยละเอียด`,
        timeLimitMinutes: generatedData.timeLimitMinutes || questionCount * 2,
        questions: (generatedData.questions || []).map((q: any, i: number) => ({
          id: q.id || `q-${i + 1}`,
          questionText: q.questionText,
          options: q.options || [],
          correctOptionIndex: Number(q.correctOptionIndex) || 0,
          explanation: q.explanation || '',
          subtopic: q.subtopic || topic,
          difficulty: q.difficulty || difficulty,
        })),
        createdAt: new Date().toISOString(),
      };

      if (!newExam.questions || newExam.questions.length === 0) {
        throw new Error('ไม่พบข้อมูลข้อสอบที่สร้าง กรุณาลองใหม่อีกครั้ง');
      }

      StorageService.saveExam(newExam);
      setSavedExams(StorageService.getSavedExams());
      FirestoreService.saveCustomExam(newExam).catch((err) =>
        console.warn('Custom exam firestore save notice:', err)
      );

      // Prompt to start immediately
      onStartExam(newExam);
    } catch (err: any) {
      console.error('Generation failed:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการสร้างข้อสอบ');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('คุณต้องการลบชุดข้อสอบนี้หรือไม่?')) {
      StorageService.deleteExam(id);
      setSavedExams(StorageService.getSavedExams());
      FirestoreService.deleteCustomExam(id).catch((err) =>
        console.warn('Custom exam firestore delete notice:', err)
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="bg-linear-to-r from-indigo-700 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Brain className="w-80 h-80" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 text-xs font-bold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mock Exam Engine 2026</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            สร้างข้อสอบจำลองด้วย AI ตาม Test Blueprint
          </h2>
          <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
            เลือกประเภทข้อสอบ TGAT, TPAT, A-Level, O-NET หรือข้อสอบประจำโรงเรียน กำหนดระดับความยาก และจำนวนข้อ เพื่อฝึกทำข้อสอบเหมือนสอบจริงบนคอมพิวเตอร์ (CBT)
          </p>
        </div>
      </div>

      {/* Main Grid: Form + Saved Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Exam Generator Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">ตั้งค่าชุดข้อสอบใหม่</h3>
              <p className="text-xs text-slate-500">ปรับแต่งตามวิชาและเรื่องที่คุณต้องการเน้นย้ำ</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. เลือกประเภทการสอบ
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(['TGAT', 'TPAT', 'A-Level', 'O-NET', 'School'] as ExamCategory[]).map((cat) => (
                  <button
                    key={cat}
                    id={`gen-cat-${cat}`}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      const firstSub = EXAM_SUBJECTS.find((s) => s.category === cat);
                      if (firstSub) setSubjectId(firstSub.id);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
                      category === cat
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cat === 'School' ? 'ข้อสอบ ร.ร.' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. เลือกรายวิชา / พาร์ท
              </label>
              <select
                id="gen-subject-select"
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setTopic('');
                }}
                className="w-full p-3 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {filteredSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Quick Pills or Custom Topic */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. หัวข้อย่อยที่ต้องการเน้น (ไม่บังคับ)
                </label>
                <span className="text-[11px] text-slate-400">เลือกด้านล่างหรือพิมพ์เอง</span>
              </div>

              {/* Topic chips from blueprint */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {currentSubjectObj.defaultTopics.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTopic(t)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      topic === t
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    + {t}
                  </button>
                ))}
              </div>

              <input
                id="gen-topic-input"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="เช่น แคลคูลัส, สถิติ, Error Identification, อนุกรมมิติสัมพันธ์..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Difficulty & Question Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  4. ระดับความยาก
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['ง่าย', 'ปานกลาง', 'ยาก', 'ระดับข้อสอบจริง'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer ${
                        difficulty === diff
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    5. จำนวนข้อสอบ
                  </label>
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {questionCount} ข้อ (เวลา ~{questionCount * 2} นาที)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[3, 5, 10, 15].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        questionCount === count
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {count} ข้อ
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Submit Generate Button */}
            <button
              id="submit-generate-exam-btn"
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>AI กำลังประมวลผลข้อสอบและเฉลยละเอียด...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>สร้างข้อสอบทันทีด้วย AI</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Ready-to-Take & Saved Exams List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>คลังข้อสอบพร้อมทำ ({savedExams.length})</span>
            </h3>
            <span className="text-xs text-slate-400">คลิกเพื่อเริ่มทำ</span>
          </div>

          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {savedExams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => onStartExam(exam)}
                className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer relative"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {exam.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {exam.difficulty}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                      {exam.title}
                    </h4>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSaved(exam.id, e)}
                    title="ลบชุดข้อสอบนี้"
                    aria-label="ลบชุดข้อสอบนี้"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all rounded-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      {exam.questions.length} ข้อ
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {exam.timeLimitMinutes} นาที
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform">
                    <Play className="w-3.5 h-3.5 fill-indigo-600" />
                    <span>เริ่มทำ</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
