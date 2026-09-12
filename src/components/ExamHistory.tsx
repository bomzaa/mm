import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Calendar,
  BookOpen,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  TrendingUp,
  Eye,
  Trash2,
  Sparkles,
  MessageSquare,
  X,
  ChevronDown,
  Plus,
  HelpCircle,
  FileQuestion,
  GraduationCap,
  Copy,
  Check,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ExamCategory, ExamHistoryItem, Question } from '../types';
import { StorageService } from '../lib/storage';
import { FirestoreService } from '../lib/firestoreService';
import { MathRenderer } from './MathRenderer';
import { formatHumanReadableText } from '../utils/examFormatter';

interface ExamHistoryProps {
  history: ExamHistoryItem[];
  onRetakeExam?: (historyItem: ExamHistoryItem) => void;
  onAskAIAboutQuestion?: (
    questionText: string,
    explanation: string,
    userChoice: string,
    correctChoice: string
  ) => void;
  onNavigateToGenerator?: () => void;
  onRefreshHistory?: () => void;
}

const THAI_MONTHS = [
  { num: 1, name: 'มกราคม', short: 'ม.ค.' },
  { num: 2, name: 'กุมภาพันธ์', short: 'ก.พ.' },
  { num: 3, name: 'มีนาคม', short: 'มี.ค.' },
  { num: 4, name: 'เมษายน', short: 'เม.ย.' },
  { num: 5, name: 'พฤษภาคม', short: 'พ.ค.' },
  { num: 6, name: 'มิถุนายน', short: 'มิ.ย.' },
  { num: 7, name: 'กรกฎาคม', short: 'ก.ค.' },
  { num: 8, name: 'สิงหาคม', short: 'ส.ค.' },
  { num: 9, name: 'กันยายน', short: 'ก.ย.' },
  { num: 10, name: 'ตุลาคม', short: 'ต.ค.' },
  { num: 11, name: 'พฤศจิกายน', short: 'พ.ย.' },
  { num: 12, name: 'ธันวาคม', short: 'ธ.ค.' },
];

export const ExamHistory: React.FC<ExamHistoryProps> = ({
  history,
  onRetakeExam,
  onAskAIAboutQuestion,
  onNavigateToGenerator,
  onRefreshHistory,
}) => {
  // State Filters
  const [selectedYear, setSelectedYear] = useState<string>('ALL'); // 'ALL', '2026', '2025', '2024'
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL'); // 1-12 or 'ALL'
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highestScore' | 'lowestScore'>('newest');

  // Modal Review State
  const [selectedReviewItem, setSelectedReviewItem] = useState<ExamHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reviewFilterTab, setReviewFilterTab] = useState<'all' | 'correct' | 'incorrect'>('all');

  // Confirm delete modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Extract distinct years and subjects from history
  const distinctYears = useMemo(() => {
    const years = new Set<number>();
    history.forEach((item) => {
      const d = new Date(item.completedAt);
      if (!isNaN(d.getFullYear())) {
        years.add(d.getFullYear());
      }
    });
    // Ensure current year (e.g. 2026) is always an option
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [history]);

  const distinctSubjects = useMemo(() => {
    const subjects = new Set<string>();
    history.forEach((item) => {
      if (item.subject) subjects.add(item.subject);
    });
    // Add common defaults if empty
    if (subjects.size === 0) {
      subjects.add('TPAT1 แพทยศาสตร์');
      subjects.add('TGAT1 การสื่อสารภาษาอังกฤษ');
      subjects.add('ฟิสิกส์');
    }
    return Array.from(subjects);
  }, [history]);

  // Count items per month for current active year
  const activeYearNum = selectedYear === 'ALL' ? new Date().getFullYear() : parseInt(selectedYear, 10);
  const monthCountMap = useMemo(() => {
    const map: Record<number, number> = {};
    history.forEach((item) => {
      const d = new Date(item.completedAt);
      if (!isNaN(d.getTime())) {
        const itemYear = d.getFullYear();
        if (selectedYear === 'ALL' || itemYear === activeYearNum) {
          const m = d.getMonth() + 1;
          map[m] = (map[m] || 0) + 1;
        }
      }
    });
    return map;
  }, [history, selectedYear, activeYearNum]);

  // Find month with most exams to suggest in empty state
  const monthWithExams = useMemo(() => {
    for (let m = 12; m >= 1; m--) {
      if (monthCountMap[m] > 0) return m;
    }
    return null;
  }, [monthCountMap]);

  // Filtered and Sorted History Items
  const filteredHistory = useMemo(() => {
    const seen = new Set<string>();
    return history
      .filter((item) => {
        if (!item || !item.id || seen.has(item.id)) return false;
        seen.add(item.id);

        const itemDate = new Date(item.completedAt);
        const itemYear = isNaN(itemDate.getFullYear()) ? 2026 : itemDate.getFullYear();
        const itemMonth = isNaN(itemDate.getMonth()) ? 1 : itemDate.getMonth() + 1;

        // Year filter
        if (selectedYear !== 'ALL' && itemYear !== parseInt(selectedYear, 10)) {
          return false;
        }

        // Month filter
        if (selectedMonth !== 'ALL' && itemMonth !== selectedMonth) {
          return false;
        }

        // Subject filter
        if (selectedSubject !== 'ALL' && item.subject !== selectedSubject) {
          return false;
        }

        // Search text
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(query);
          const matchSubject = item.subject?.toLowerCase().includes(query);
          const matchLesson = item.questions?.[0]?.lesson?.toLowerCase().includes(query);
          if (!matchTitle && !matchSubject && !matchLesson) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
        }
        if (sortBy === 'highestScore') {
          return b.percentage - a.percentage;
        }
        if (sortBy === 'lowestScore') {
          return a.percentage - b.percentage;
        }
        return 0;
      });
  }, [history, selectedYear, selectedMonth, selectedSubject, searchTerm, sortBy]);

  // Calculated Aggregate Stats
  const totalExamsCount = filteredHistory.length;
  const totalQuestionsCount = filteredHistory.reduce((acc, curr) => acc + (curr.totalQuestions || 0), 0);
  const avgPercentage = totalExamsCount > 0
    ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.percentage, 0) / totalExamsCount)
    : 0;
  const maxPercentage = totalExamsCount > 0
    ? Math.max(...filteredHistory.map((item) => item.percentage))
    : 0;
  
  // Calculate average seconds per question
  const avgSecondsPerQuestion = useMemo(() => {
    if (totalQuestionsCount === 0) return 0;
    const totalSecs = filteredHistory.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
    return Math.round(totalSecs / totalQuestionsCount);
  }, [filteredHistory, totalQuestionsCount]);

  // Handle Clear All
  const handleConfirmClearAll = async () => {
    await FirestoreService.clearAllExamHistory();
    setShowClearConfirm(false);
    if (onRefreshHistory) onRefreshHistory();
  };

  // Handle Single Delete
  const handleDeleteItem = async (id: string) => {
    await FirestoreService.deleteExamAttempt(id);
    setItemToDelete(null);
    if (onRefreshHistory) onRefreshHistory();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedYear('ALL');
    setSelectedMonth('ALL');
    setSelectedSubject('ALL');
    setSearchTerm('');
  };

  // Copy Explanation helper
  const handleCopyExplanation = (id: string, text: string) => {
    const readable = formatHumanReadableText(text);
    navigator.clipboard.writeText(readable);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format Date in Thai
  const formatThaiDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const thaiYear = d.getFullYear() + 543;
    const month = THAI_MONTHS[d.getMonth()]?.short || '';
    const day = d.getDate();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${thaiYear} เวลา ${hours}:${mins} น.`;
  };

  // Selected Period Label for Badge
  const periodLabel = useMemo(() => {
    if (selectedMonth === 'ALL' && selectedYear === 'ALL') {
      return 'ประวัติข้อสอบทั้งหมด (รวมทุกช่วงเวลา)';
    }
    if (selectedMonth !== 'ALL') {
      const monthName = THAI_MONTHS.find((m) => m.num === selectedMonth)?.name || '';
      const yearStr = selectedYear === 'ALL' ? 'ทุกปี' : `${parseInt(selectedYear, 10) + 543} (${selectedYear})`;
      return `ประวัติข้อสอบเดือน ${monthName} (${yearStr})`;
    }
    return `ประวัติข้อสอบปี พ.ศ. ${parseInt(selectedYear, 10) + 543} (${selectedYear})`;
  }, [selectedMonth, selectedYear]);

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16 font-sans">
      {/* ================= 1. TOP HEADER SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shadow-xs">
            <History className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ประวัติข้อสอบที่คุณทำสำเร็จ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              บันทึกผลการทำแบบทดสอบทั้งหมด พร้อมคะแนน สถิติ และลิงก์สำหรับวิเคราะห์ละเอียด
            </p>
          </div>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {onNavigateToGenerator && (
            <button
              type="button"
              onClick={onNavigateToGenerator}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>สร้างข้อสอบใหม่</span>
            </button>
          )}

          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="py-2.5 px-3.5 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>ลบทั้งหมด</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= 2. FILTER & TIME SEARCH CARD ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
        {/* Filter Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>ค้นหาและกรองข้อสอบตามช่วงเวลา (เดือน & ปี)</span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างตัวกรองทั้งหมด</span>
          </button>
        </div>

        {/* 4-Column Dropdown Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Year Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>เลือกปี (พ.ศ. / ค.ศ.)</span>
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-9 cursor-pointer"
              >
                <option value="ALL">ทุกปี (รวมทั้งหมด)</option>
                {distinctYears.map((y) => (
                  <option key={y} value={y.toString()}>
                    พ.ศ. {y + 543} ({y})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Month Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>เลือกเดือน</span>
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedMonth(val === 'ALL' ? 'ALL' : parseInt(val, 10));
                }}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-9 cursor-pointer"
              >
                <option value="ALL">ทุกเดือน (ม.ค. - ธ.ค.)</option>
                {THAI_MONTHS.map((m) => (
                  <option key={m.num} value={m.num}>
                    เดือน {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Subject Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>เลือกวิชา</span>
            </label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-9 cursor-pointer"
              >
                <option value="ALL">ทุกวิชา</option>
                {distinctSubjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Search Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>ค้นหาบทเรียน / หัวข้อ</span>
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="พิมพ์ชื่อบทเรียน..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Quick Month Selector Strip (12 Months) */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="font-bold text-slate-700">
              แถบเลือกเดือนด่วน (ปี พ.ศ. {activeYearNum + 543})
            </span>
            <span className="text-slate-400">คลิกที่เดือนเพื่อแสดงเฉพาะเดือนนั้น</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 sm:gap-2">
            {THAI_MONTHS.map((m) => {
              const isSelected = selectedMonth === m.num;
              const count = monthCountMap[m.num] || 0;

              return (
                <button
                  key={m.num}
                  type="button"
                  onClick={() => setSelectedMonth(isSelected ? 'ALL' : m.num)}
                  className={`py-2.5 px-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center select-none ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs border-2 border-blue-600'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-bold">{m.short}</span>
                  {count > 0 ? (
                    <span
                      className={`text-[10px] font-bold mt-0.5 ${
                        isSelected ? 'text-blue-100' : 'text-blue-600'
                      }`}
                    >
                      {count} ชุด
                    </span>
                  ) : (
                    <span className="text-[10px] opacity-0 mt-0.5">-</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= 3. PERFORMANCE STATS (DARK NAVY BANNER) ================= */}
      <div className="space-y-3">
        {/* Banner Subheader Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-900/90 text-blue-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{periodLabel}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              ผลงานการทดสอบในช่วงเวลาที่เลือก
            </h2>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500">เรียงตาม:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-slate-900 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold pr-8 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="newest">ล่าสุดไปเก่าสุด</option>
                <option value="oldest">เก่าสุดไปล่าสุด</option>
                <option value="highestScore">คะแนนสูงสุด</option>
                <option value="lowestScore">คะแนนต่ำสุด</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 4 Stat Boxes Card (Dark Navy Container) */}
        <div className="bg-[#0A1628] rounded-3xl border border-slate-800 p-6 sm:p-7 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
            {/* Box 1: Completed */}
            <div className="flex items-center gap-4 sm:pr-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">ทำไปแล้ว</span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                  {totalExamsCount} <span className="text-sm font-semibold text-slate-400">ชุด</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  รวม {totalQuestionsCount} ข้อ
                </span>
              </div>
            </div>

            {/* Box 2: Average Score */}
            <div className="flex items-center gap-4 sm:px-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">คะแนนเฉลี่ย</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-0.5">
                  {avgPercentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {totalExamsCount === 0
                    ? 'ยังไม่มีข้อมูล'
                    : avgPercentage >= 70
                    ? '🏆 ผลงานยอดเยี่ยม'
                    : avgPercentage >= 50
                    ? '✨ ผ่านเกณฑ์มาตรฐาน'
                    : '📈 ต้องฝึกฝนเพิ่มเติม'}
                </span>
              </div>
            </div>

            {/* Box 3: Max Score */}
            <div className="flex items-center gap-4 sm:px-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Trophy className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">คะแนนสูงสุด</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight mt-0.5">
                  {maxPercentage}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  สถิติสูงสุดในรอบนี้
                </span>
              </div>
            </div>

            {/* Box 4: Average Time per Question */}
            <div className="flex items-center gap-4 sm:pl-4 pt-4 sm:pt-0">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">เวลาเฉลี่ย/ข้อ</span>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                  {avgSecondsPerQuestion}{' '}
                  <span className="text-sm font-semibold text-slate-400">วินาที</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  ระยะเวลาฝึกทำโจทย์
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. EXAM ITEMS LIST & EMPTY STATE ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            รายการข้อสอบที่บันทึกไว้ ({filteredHistory.length} รายการ)
          </h3>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="space-y-3.5">
            {filteredHistory.map((item) => {
              const isHigh = item.percentage >= 70;
              const isMedium = item.percentage >= 50 && item.percentage < 70;
              const formattedDate = formatThaiDate(item.completedAt);
              const lessonName = item.questions?.[0]?.lesson || '';

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  {/* Left Metadata */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-black text-[11px] uppercase tracking-wide shadow-2xs">
                        {item.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs">
                        {item.subject}
                      </span>
                      {lessonName && (
                        <span className="text-xs text-slate-500 font-medium">
                          • บทเรียน: {lessonName}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-base text-slate-900 leading-snug">
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        ใช้เวลา {Math.floor(item.timeSpentSeconds / 60)} นาที {item.timeSpentSeconds % 60} วินาที
                      </span>
                      <span>• จำนวน {item.totalQuestions} ข้อ</span>
                      <span>• ระดับ: {item.difficulty || 'ปานกลาง'}</span>
                      <span className="text-slate-400">• ทำเมื่อ: {formattedDate}</span>
                    </div>
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <div className="text-right">
                      <div
                        className={`text-2xl font-black ${
                          isHigh
                            ? 'text-emerald-600'
                            : isMedium
                            ? 'text-blue-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {item.score}/{item.totalQuestions} ({item.percentage}%)
                      </div>
                      <div className="text-[11px] font-bold text-slate-400">
                        {isHigh ? 'ผ่านเกณฑ์ดีเยี่ยม' : isMedium ? 'ผ่านเกณฑ์' : 'ต้องฝึกฝนเพิ่มเติม'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReviewItem(item)}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>ดูเฉลยละเอียด</span>
                      </button>

                      {onRetakeExam && (
                        <button
                          type="button"
                          onClick={() => onRetakeExam(item)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="ทำข้อสอบชุดนี้ซ้ำ"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>ทำซ้ำ</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setItemToDelete(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= EMPTY STATE (EXACT MATCH TO 00:23 IN VIDEO) ================= */
          <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200 text-center space-y-4 shadow-2xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto shadow-inner">
              <FileQuestion className="w-8 h-8 stroke-[1.8]" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                ไม่พบข้อสอบในช่วงเวลาหรือเงื่อนไขที่เลือก
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                ลองเปลี่ยนเดือน ปี หรือล้างคำค้นหา เพื่อดูประวัติข้อสอบชุดอื่นๆ
              </p>
            </div>

            <div className="pt-2">
              {monthWithExams ? (
                <button
                  type="button"
                  onClick={() => setSelectedMonth(monthWithExams)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <span>
                    ดูประวัติข้อสอบเดือน{THAI_MONTHS.find((m) => m.num === monthWithExams)?.name} ({monthCountMap[monthWithExams]} ชุด)
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ล้างตัวกรองทั้งหมด</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= REVIEW EXAM MODAL (FULL SCREEN STEP-BY-STEP) ================= */}
      {selectedReviewItem && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full min-h-screen overflow-hidden font-sans">
          {/* Header */}
          <header className="w-full border-b border-slate-200 bg-white/95 backdrop-blur-xs sticky top-0 z-20 px-4 sm:px-8 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-lg bg-blue-600 text-white font-bold text-xs">
                    {selectedReviewItem.category}
                  </span>
                  <span className="px-3 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs">
                    {selectedReviewItem.subject}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    คะแนน: {selectedReviewItem.score} / {selectedReviewItem.totalQuestions} ({selectedReviewItem.percentage}%)
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
                  {selectedReviewItem.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReviewItem(null)}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="ปิดหน้ารีวิว"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </header>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h4 className="text-base font-black text-slate-900">
                  เฉลยข้อสอบและคำอธิบายอย่างละเอียด
                </h4>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setReviewFilterTab('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      reviewFilterTab === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ทั้งหมด ({selectedReviewItem.questions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilterTab('correct')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      reviewFilterTab === 'correct'
                        ? 'bg-white text-emerald-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ข้อที่ถูก ({selectedReviewItem.score})
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewFilterTab('incorrect')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      reviewFilterTab === 'incorrect'
                        ? 'bg-white text-rose-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ข้อที่ผิด ({selectedReviewItem.questions.length - selectedReviewItem.score})
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {selectedReviewItem.questions
                  .filter((q) => {
                    const isCorrect = q.userSelectedIndex === q.correctOptionIndex;
                    if (reviewFilterTab === 'correct') return isCorrect;
                    if (reviewFilterTab === 'incorrect') return !isCorrect;
                    return true;
                  })
                  .map((q, idx) => {
                    const isCorrect = q.userSelectedIndex === q.correctOptionIndex;
                    const correctLetter = String.fromCharCode(65 + q.correctOptionIndex);

                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="font-bold text-base text-slate-900 leading-relaxed flex items-start gap-1.5 flex-1">
                            <span className="shrink-0">ข้อ {idx + 1}.</span>
                            <div className="flex-1">
                              <MathRenderer content={q.questionText} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {onAskAIAboutQuestion && (
                              <button
                                type="button"
                                onClick={() => {
                                  const userChoiceText =
                                    q.userSelectedIndex !== undefined
                                      ? q.options[q.userSelectedIndex]
                                      : 'ไม่ได้ตอบ';
                                  const correctChoiceText = q.options[q.correctOptionIndex];
                                  onAskAIAboutQuestion(
                                    q.questionText,
                                    q.explanation,
                                    userChoiceText,
                                    correctChoiceText
                                  );
                                  setSelectedReviewItem(null);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>ถาม AI ข้อนี้</span>
                              </button>
                            )}

                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-lg border flex items-center gap-1.5 ${
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
                        </div>

                        {/* Options Choices Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((optText, optIdx) => {
                            const isThisCorrect = optIdx === q.correctOptionIndex;
                            const isThisUser = optIdx === q.userSelectedIndex;
                            const letter = String.fromCharCode(65 + optIdx);

                            let borderStyle = 'border-slate-200 bg-slate-50/50 text-slate-700';
                            if (isThisCorrect) {
                              borderStyle = 'border-2 border-emerald-400 bg-emerald-50/50 text-slate-900 font-semibold';
                            } else if (isThisUser && !isThisCorrect) {
                              borderStyle = 'border-2 border-rose-300 bg-rose-50/50 text-slate-900 font-semibold';
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${borderStyle}`}
                              >
                                <div className="flex items-center gap-2.5 flex-1">
                                  <span
                                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                                      isThisCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : isThisUser
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-white border border-slate-300 text-slate-600'
                                    }`}
                                  >
                                    {letter}
                                  </span>
                                  <div className="flex-1 flex items-start gap-1">
                                    <span className="font-bold text-slate-800 shrink-0 select-none">{letter}.</span>
                                    <div className="flex-1">
                                      <MathRenderer content={optText.replace(/^(\(?[A-Da-dก-ง1-4]\)?[\.\:\)\s\-]+)/, '').trim() || optText} inline />
                                    </div>
                                  </div>
                                </div>

                                {isThisUser && !isThisCorrect && (
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
                            );
                          })}
                        </div>

                        {/* Step-by-Step Explanation Box */}
                        <div className="bg-sky-50/80 border border-sky-200/90 rounded-2xl p-5 space-y-3.5">
                          <div className="flex items-center justify-between gap-2 border-b border-sky-200/60 pb-2.5">
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-sky-950">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span>วิธีคิดและเฉลยละเอียดทีละขั้นตอน:</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCopyExplanation(`review-q-${idx}`, q.explanation)}
                              className="p-1 text-sky-700 hover:text-sky-900 rounded-md hover:bg-sky-100/60 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                              title="คัดลอกคำอธิบาย"
                            >
                              {copiedId === `review-q-${idx}` ? (
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

                          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                            <MathRenderer content={q.explanation} />
                          </div>

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

      {/* Confirmation Modal for Clear All */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">ยืนยันการลบประวัติทั้งหมด?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                การลบประวัติจะไม่สามารถกู้คืนได้ และสถิติการทำข้อสอบทั้งหมดจะถูกรีเซ็ต
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                ลบทั้งหมด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Single Delete */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">ลบประวัติข้อสอบชุดนี้?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                รายการที่ถูกลบจะไม่สามารถกู้คืนได้
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(itemToDelete)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
