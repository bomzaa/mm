import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Eye,
  Trash2,
  Sparkles,
  MessageSquare,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ExamCategory, ExamHistoryItem, Question } from '../types';

interface ExamHistoryProps {
  history: ExamHistoryItem[];
  onRetakeExam?: (historyItem: ExamHistoryItem) => void;
  onAskAIAboutQuestion?: (questionText: string, explanation: string, userChoice: string, correctChoice: string) => void;
}

export const ExamHistory: React.FC<ExamHistoryProps> = ({
  history,
  onRetakeExam,
  onAskAIAboutQuestion,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReviewItem, setSelectedReviewItem] = useState<ExamHistoryItem | null>(null);

  const filteredHistory = history.filter((item) => {
    const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <History className="w-7 h-7 text-indigo-600" />
            <span>ประวัติการทำข้อสอบ (Exam History)</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            บันทึกผลการทดสอบย้อนหลัง สามารถกลับมาทบทวนเฉลยละเอียดหรือทำซ้ำได้ทุกชุด
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
          {['ALL', 'TGAT', 'TPAT', 'A-Level', 'O-NET', 'School'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat === 'ALL' ? 'ทั้งหมด' : cat === 'School' ? 'ข้อสอบ ร.ร.' : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อชุดข้อสอบ หรือวิชา..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isHigh = item.percentage >= 70;
            const isMedium = item.percentage >= 50 && item.percentage < 70;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{item.subject}</span>
                    <span className="text-[11px] text-slate-400">• {new Date(item.completedAt).toLocaleDateString('th-TH')}</span>
                  </div>

                  <h4 className="font-bold text-base text-slate-800 leading-snug">
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ใช้เวลา {Math.floor(item.timeSpentSeconds / 60)} นาที {item.timeSpentSeconds % 60} วินาที
                    </span>
                    <span>• {item.totalQuestions} ข้อ</span>
                    <span>• ความยาก: {item.difficulty}</span>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <div
                      className={`text-xl font-black ${
                        isHigh ? 'text-emerald-600' : isMedium ? 'text-indigo-600' : 'text-rose-600'
                      }`}
                    >
                      {item.score}/{item.totalQuestions} ({item.percentage}%)
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400">
                      {isHigh ? 'ผ่านเกณฑ์ดีเยี่ยม' : isMedium ? 'ผ่านเกณฑ์' : 'ควรทบทวนเพิ่ม'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedReviewItem(item)}
                      className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>ดูเฉลย</span>
                    </button>

                    {onRetakeExam && (
                      <button
                        onClick={() => onRetakeExam(item)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ทำซ้ำ</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">ไม่พบประวัติการทำข้อสอบ</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            คุณยังไม่มีประวัติการทำข้อสอบในหมวดนี้ ลองสร้างข้อสอบจำลองด้วย AI แล้วมาฝึกทำกันเลย!
          </p>
        </div>
      )}

      {/* Review Modal */}
      {selectedReviewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                    {selectedReviewItem.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    คะแนน: {selectedReviewItem.score}/{selectedReviewItem.totalQuestions} ({selectedReviewItem.percentage}%)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  {selectedReviewItem.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedReviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/40">
              {selectedReviewItem.questions.map((q, idx) => {
                const isCorrect = q.userSelectedIndex === q.correctOptionIndex;
                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-2xl p-5 border-2 shadow-2xs space-y-3 ${
                      isCorrect ? 'border-emerald-200' : 'border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-800">
                          {isCorrect ? 'ถูกต้อง' : 'ตอบผิด หรือไม่ได้ตอบ'}
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
                            setSelectedReviewItem(null);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>ถาม AI ข้อนี้</span>
                        </button>
                      )}
                    </div>

                    <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">
                      {q.questionText}
                    </p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isThisCorrect = optIdx === q.correctOptionIndex;
                        const isThisUser = optIdx === q.userSelectedIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              isThisCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                : isThisUser
                                ? 'bg-rose-50 border-rose-300 text-rose-900 line-through'
                                : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                          >
                            <span>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </span>
                            {isThisCorrect && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                คำตอบถูกต้อง
                              </span>
                            )}
                            {isThisUser && !isThisCorrect && (
                              <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                คำตอบที่คุณเลือก
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs leading-relaxed text-slate-800">
                      <div className="font-bold text-indigo-900 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>วิธีคิดและเฉลยละเอียด:</span>
                      </div>
                      <div className="markdown-body">
                        <ReactMarkdown>{q.explanation}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
