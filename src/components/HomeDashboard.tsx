import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Calculator,
  Atom,
  FlaskConical,
  Leaf,
  Languages,
  BookOpen,
  Globe,
  Microscope,
  FileCheck,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Layers,
  Gamepad2,
  Zap,
  Flame,
  Trophy,
  Award,
  Star,
  Check,
  Info,
  Calendar,
  Shield,
  X,
  HelpCircle,
} from 'lucide-react';
import { ExamCategory, ExamData, ExamHistoryItem, UserProfile } from '../types';
import { NavTab } from './Navbar';

interface HomeDashboardProps {
  user: UserProfile;
  history: ExamHistoryItem[];
  onNavigate: (tab: NavTab) => void;
  onSelectCategoryForGenerator?: (category: ExamCategory, subjectId?: string) => void;
  onRetakeExam?: (historyItem: ExamHistoryItem) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  user,
  history,
  onNavigate,
  onSelectCategoryForGenerator,
  onRetakeExam,
}) => {
  const [showAllSubjects, setShowAllSubjects] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [showExpBadge, setShowExpBadge] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [showBoostTooltip, setShowBoostTooltip] = useState(false);
  const [flamePulse, setFlamePulse] = useState(0);
  const [flameCheer, setFlameCheer] = useState<string | null>(null);

  // Synthesize pleasant celebratory chime using native Web Audio API
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.32);
      });
    } catch {
      // AudioContext muted or unsupported, fail silently
    }
  };

  const handleFlameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlamePulse((prev) => prev + 1);
    const cheers = [
      'ไฟลุกโชน! ฮึดสู้เพื่อฝัน 🔥',
      'ยอดเยี่ยมมาก! ต่อเนื่อง 5 วันแล้ว 🚀',
      'เข้าใกล้เป้าหมาย 7 วันแล้ว! ✨',
      'สปีดอัป! ความพยายามไม่เคยทรยศใคร 🌟',
    ];
    setFlameCheer(cheers[Math.floor(Math.random() * cheers.length)]);
    setTimeout(() => setFlameCheer(null), 2400);

    // Mini firework confetti
    confetti({
      particleCount: 22,
      spread: 45,
      origin: { y: 0.35 },
      colors: ['#f97316', '#f59e0b', '#ef4444', '#fbbf24'],
    });
  };

  const handleDailyCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasCheckedIn) return;
    setHasCheckedIn(true);
    setShowExpBadge(true);
    playChimeSound();

    // Fire lively multi-colored confetti
    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.65 },
      colors: ['#2563eb', '#3b82f6', '#f59e0b', '#10b981', '#ec4899'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0.2, y: 0.7 },
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 0.8, y: 0.7 },
      });
    }, 200);

    setTimeout(() => setShowExpBadge(false), 3000);
  };

  // 8 Popular Subjects as displayed in the screenshot
  const popularSubjects = [
    {
      id: 'math',
      title: 'คณิตศาสตร์',
      lessons: '28 บทเรียน',
      mastery: 82,
      icon: Calculator,
      category: 'A-Level' as ExamCategory,
      subjectId: 'alevel-math1',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500',
      barColor: 'bg-blue-600',
      borderHover: 'hover:border-blue-300',
    },
    {
      id: 'physics',
      title: 'ฟิสิกส์',
      lessons: '22 บทเรียน',
      mastery: 74,
      icon: Atom,
      category: 'A-Level' as ExamCategory,
      subjectId: 'alevel-physics',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-500',
      barColor: 'bg-cyan-500',
      borderHover: 'hover:border-cyan-300',
    },
    {
      id: 'chem',
      title: 'เคมี',
      lessons: '20 บทเรียน',
      mastery: 88,
      icon: FlaskConical,
      category: 'A-Level' as ExamCategory,
      subjectId: 'alevel-chem',
      bgColor: 'bg-rose-50',
      iconColor: 'text-rose-500',
      barColor: 'bg-rose-500',
      borderHover: 'hover:border-rose-300',
    },
    {
      id: 'bio',
      title: 'ชีววิทยา',
      lessons: '24 บทเรียน',
      mastery: 79,
      icon: Leaf,
      category: 'A-Level' as ExamCategory,
      subjectId: 'alevel-bio',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      barColor: 'bg-emerald-500',
      borderHover: 'hover:border-emerald-300',
    },
    {
      id: 'eng',
      title: 'ภาษาอังกฤษ',
      lessons: '18 บทเรียน',
      mastery: 91,
      icon: Languages,
      category: 'TGAT' as ExamCategory,
      subjectId: 'tgat1',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-500',
      barColor: 'bg-purple-600',
      borderHover: 'hover:border-purple-300',
    },
    {
      id: 'thai',
      title: 'ภาษาไทย',
      lessons: '19 บทเรียน',
      mastery: 85,
      icon: BookOpen,
      category: 'A-Level' as ExamCategory,
      subjectId: 'alevel-thai',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
      barColor: 'bg-amber-500',
      borderHover: 'hover:border-amber-300',
    },
    {
      id: 'social',
      title: 'สังคมศึกษา',
      lessons: '21 บทเรียน',
      mastery: 70,
      icon: Globe,
      category: 'A-Level' as ExamCategory,
      subjectId: 'alevel-soc',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-500',
      barColor: 'bg-teal-500',
      borderHover: 'hover:border-teal-300',
    },
    {
      id: 'gen-science',
      title: 'วิทยาศาสตร์ทั่วไป',
      lessons: '17 บทเรียน',
      mastery: 78,
      icon: Microscope,
      category: 'TPAT' as ExamCategory,
      subjectId: 'tpat3',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      barColor: 'bg-indigo-600',
      borderHover: 'hover:border-indigo-300',
    },
  ];

  // Default demo history matching the screenshot perfectly if real history has fewer items
  const demoRecentHistory: ExamHistoryItem[] = [
    {
      id: 'hist-demo-1',
      examId: 'demo-tpat3',
      title: 'TPAT 3 ความถนัดวิทยาศาสตร์ฯ',
      category: 'TPAT',
      subject: 'TPAT3 วิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์',
      difficulty: 'ระดับข้อสอบจริง',
      score: 18,
      totalQuestions: 25,
      percentage: 72,
      timeSpentSeconds: 1240,
      completedAt: 'ชุดที่ 2 • ทำเมื่อ 11 ส.ค. 2569 (23:24)',
      questions: [],
    },
    {
      id: 'hist-demo-2',
      examId: 'demo-math-m5',
      title: 'คณิตศาสตร์ ม.5 เรื่อง ฟังก์ชัน',
      category: 'School',
      subject: 'คณิตศาสตร์เพิ่มเติม ม.5',
      difficulty: 'ปานกลาง',
      score: 22,
      totalQuestions: 30,
      percentage: 73,
      timeSpentSeconds: 1510,
      completedAt: 'ชุดที่ 1 • ทำเมื่อ 11 ส.ค. 2569 (21:15)',
      questions: [],
    },
    {
      id: 'hist-demo-3',
      examId: 'demo-tgat1',
      title: 'TGAT 1 การสื่อสารภาษาอังกฤษ',
      category: 'TGAT',
      subject: 'TGAT1 English Communication',
      difficulty: 'ระดับข้อสอบจริง',
      score: 12,
      totalQuestions: 25,
      percentage: 48,
      timeSpentSeconds: 980,
      completedAt: 'ชุดที่ 1 • ทำเมื่อ 10 ส.ค. 2569 (17:13)',
      questions: [],
    },
  ];

  // Display items: use history if populated, or fallback to screenshot demo history
  const recentExamItems = useMemo(() => {
    const list = history && history.length > 0 ? history : demoRecentHistory;
    const seen = new Set<string>();
    return list.filter((item) => {
      if (!item || !item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }, [history]);

  const displayedHistory = showAllHistory ? recentExamItems : recentExamItems.slice(0, 5);

  const handleSubjectClick = (subject: (typeof popularSubjects)[0]) => {
    if (onSelectCategoryForGenerator) {
      onSelectCategoryForGenerator(subject.category, subject.subjectId);
    }
    onNavigate('generator');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      {/* MOTIVATION & DAILY STREAK INTERACTIVE BAR WITH PLAYFUL FEATURES */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/90 backdrop-blur-md border border-slate-200/80 hover:border-amber-200/80 rounded-2xl p-4 sm:px-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-2xs hover:shadow-md transition-all group/bar"
      >
        {/* Left: Streak Info with Animated Flame & Interactive Touch */}
        <div className="flex items-center gap-3.5 w-full lg:w-auto">
          {/* Flame Icon with Tap/Click Animation & Cheering Bubble */}
          <div className="relative shrink-0">
            <AnimatePresence>
              {flameCheer && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.8 }}
                  animate={{ opacity: 1, y: -26, scale: 1 }}
                  exit={{ opacity: 0, y: -38, scale: 0.8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-orange-600 to-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg pointer-events-none z-30 flex items-center gap-1"
                >
                  <Flame className="w-3 h-3 fill-white" />
                  <span>{flameCheer}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              id="streak-interactive-flame-btn"
              onClick={handleFlameClick}
              whileHover={{ scale: 1.12, rotate: 6 }}
              whileTap={{ scale: 0.88, rotate: -12 }}
              animate={{
                scale: [1, 1.1, 0.95, 1.08, 1],
                rotate: [-2, 3, -2, 2, 0],
              }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 cursor-pointer relative group/flame"
              title="กดเพื่อเติมไฟความขยัน!"
            >
              <Flame className="w-5 h-5 fill-white group-hover/flame:scale-110 transition-transform" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full animate-ping" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </motion.button>
          </div>

          {/* Details & Target */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="streak-calendar-toggle-btn"
                onClick={() => setIsStreakModalOpen(true)}
                className="text-xs sm:text-sm font-black text-slate-900 tracking-tight hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer group/title"
              >
                <span>Streak 5 วันต่อเนื่อง!</span>
                <span className="text-[10px] font-medium text-slate-400 group-hover/title:text-orange-500 underline flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>ดูปฏิทิน</span>
                </span>
              </button>

              {/* Interactive EXP Boost Pill with Popover Tooltip */}
              <div className="relative">
                <button
                  type="button"
                  id="streak-boost-tooltip-btn"
                  onMouseEnter={() => setShowBoostTooltip(true)}
                  onMouseLeave={() => setShowBoostTooltip(false)}
                  onClick={() => setShowBoostTooltip(!showBoostTooltip)}
                  className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200/80 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  <span>+15% EXP Boost</span>
                  <HelpCircle className="w-2.5 h-2.5 text-amber-500/80" />
                </button>

                <AnimatePresence>
                  {showBoostTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-1.5 w-64 p-3 bg-slate-900 text-white rounded-xl shadow-xl z-50 text-[11px] leading-relaxed pointer-events-none"
                    >
                      <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>สิทธิพิเศษ Streak 5 วัน</span>
                      </div>
                      <p className="text-slate-300">
                        คุณจะได้รับคะแนน EXP เพิ่มขึ้น 15% ทุกครั้งที่ทำแบบทดสอบเสร็จ! เมื่อสะสมครบ 7 วันจะอัปเกรดเป็น <span className="text-amber-300 font-bold">+20%</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Daily Goal with 3-Step Interactive Progress */}
            <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] text-slate-500">
                เป้าหมายวันนี้: ทำข้อสอบฝึกฝน <span className="font-bold text-slate-700">1/3</span> ชุด
              </span>

              {/* 3 Step Indicator Pills */}
              <div className="flex items-center gap-1">
                {/* Step 1 (Completed) */}
                <div
                  className="w-5 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-2xs"
                  title="ชุดที่ 1: เสร็จสิ้นแล้ว"
                />
                {/* Step 2 (Pending) */}
                <div
                  className="w-5 h-2 rounded-full bg-slate-200 border border-slate-300/60"
                  title="ชุดที่ 2: รอทำ"
                />
                {/* Step 3 (Pending) */}
                <div
                  className="w-5 h-2 rounded-full bg-slate-200 border border-slate-300/60"
                  title="ชุดที่ 3: รอทำ"
                />
              </div>

              <button
                type="button"
                id="streak-continue-quest-btn"
                onClick={() => {
                  if (onSelectCategoryForGenerator) {
                    onSelectCategoryForGenerator('School', 'school-math');
                  }
                  onNavigate('generator');
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
              >
                <span>ทำต่ออีก 2 ชุด</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Daily Check-in Button with Web Audio + Confetti */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto shrink-0 relative">
          <AnimatePresence>
            {showExpBadge && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -26, scale: 1.15 }}
                exit={{ opacity: 0, y: -40, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-lg pointer-events-none flex items-center gap-1 z-30 ring-2 ring-white"
              >
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>+50 EXP ได้รับแล้ว!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            id="daily-checkin-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleDailyCheckIn}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
              hasCheckedIn
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] hover:bg-right text-white shadow-blue-500/25 hover:shadow-md'
            }`}
          >
            {hasCheckedIn ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5] text-emerald-600" />
                <span>รับรางวัลวันนี้แล้ว</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>กดรับ EXP ประจำวัน</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* POPUP MODAL: STREAK CALENDAR & REWARDS OVERLAY */}
      <AnimatePresence>
        {isStreakModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                id="close-streak-modal-btn"
                onClick={() => setIsStreakModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
                  <Flame className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    ปฏิทินวินัยการเรียน (Streak Tracker)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ทำข้อสอบอย่างน้อยวันละ 1 ชุด เพื่อรักษาและสะสม Streak ต่อเนื่อง
                  </p>
                </div>
              </div>

              {/* 7-Day Weekly Grid */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>สัปดาห์นี้ (5/7 วัน)</span>
                  <span className="text-orange-600 flex items-center gap-1 font-black">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    5 วันติด
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                  {[
                    { day: 'จ.', date: '7', done: true },
                    { day: 'อ.', date: '8', done: true },
                    { day: 'พ.', date: '9', done: true },
                    { day: 'พฤ.', date: '10', done: true },
                    { day: 'ศ.', date: '11', done: true, isToday: true },
                    { day: 'ส.', date: '12', done: false },
                    { day: 'อา.', date: '13', done: false, isReward: true },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl flex flex-col items-center justify-between min-h-[64px] transition-all ${
                        item.done
                          ? 'bg-gradient-to-b from-orange-50 to-amber-100/70 border border-orange-200/80 text-orange-900 shadow-2xs'
                          : item.isToday
                          ? 'bg-blue-50 border-2 border-blue-400 text-blue-900'
                          : 'bg-white border border-slate-200/70 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] font-medium">{item.day}</span>
                      <div className="my-1">
                        {item.done ? (
                          <Flame className="w-4 h-4 fill-orange-500 text-orange-500 mx-auto" />
                        ) : item.isReward ? (
                          <Award className="w-4 h-4 text-amber-500 mx-auto" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-200 mx-auto" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold">
                        {item.done ? '✓' : item.isReward ? '+100' : item.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Streak Shield Status & Perks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white text-sky-600 shadow-2xs shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Streak Freeze</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">มี 1 ชิ้น ป้องกัน Streak ขาดได้ 1 วัน</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-white text-amber-600 shadow-2xs shrink-0">
                    <Zap className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">EXP Multiplier</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">โบนัสปัจจุบัน +15% (ครบ 7 วัน +20%)</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                id="streak-modal-go-practice-btn"
                onClick={() => {
                  setIsStreakModalOpen(false);
                  if (onSelectCategoryForGenerator) {
                    onSelectCategoryForGenerator('School', 'school-math');
                  }
                  onNavigate('generator');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <span>ไปทำแบบทดสอบเพื่อสะสม Streak วันนี้</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECTION 1: Top 2 Hero Action Cards (Matching Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: ข้อสอบฝึกฝน (Practice Exam) */}
        <motion.div
          id="hero-card-practice"
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => {
            if (onSelectCategoryForGenerator) {
              onSelectCategoryForGenerator('School', 'school-math');
            }
            onNavigate('generator');
          }}
          className="group relative bg-gradient-to-r from-blue-50/70 via-blue-50/40 to-indigo-50/30 hover:from-blue-50 hover:to-indigo-50/60 border border-blue-100/80 hover:border-blue-300/80 rounded-2xl p-6 flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-colors overflow-hidden"
        >
          {/* Shimmer light beam on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="flex items-center gap-4.5 min-w-0 relative z-10">
            {/* Blue Round Icon */}
            <motion.div
              whileHover={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 0.4 }}
              className="w-13 h-13 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform"
            >
              <div className="flex flex-col gap-1 items-center justify-center">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <div className="w-4 h-0.5 bg-white rounded-full" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <div className="w-4 h-0.5 bg-white rounded-full" />
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-white" />
                  <div className="w-4 h-0.5 bg-white rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                ข้อสอบฝึกฝน
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                เลือกวิชา ระดับชั้น และหัวข้อที่ต้องการ เพื่อสร้างข้อสอบสำหรับฝึกฝน
              </p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-3 relative z-10" />
        </motion.div>

        {/* Card 2: ข้อสอบเตรียมสอบ (Exam Prep: TGAT, TPAT, A-Level, O-NET) */}
        <motion.div
          id="hero-card-preparatory"
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => {
            if (onSelectCategoryForGenerator) {
              onSelectCategoryForGenerator('TGAT', 'tgat1');
            }
            onNavigate('generator');
          }}
          className="group relative bg-gradient-to-r from-emerald-50/70 via-emerald-50/40 to-teal-50/30 hover:from-emerald-50 hover:to-teal-50/60 border border-emerald-100/80 hover:border-emerald-300/80 rounded-2xl p-6 flex items-center justify-between cursor-pointer shadow-xs hover:shadow-md transition-colors overflow-hidden"
        >
          {/* Shimmer light beam on hover */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <div className="flex items-center gap-4.5 min-w-0 relative z-10">
            {/* Green Round Icon */}
            <motion.div
              whileHover={{ rotate: [0, 8, -8, 4, 0] }}
              transition={{ duration: 0.4 }}
              className="w-13 h-13 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform"
            >
              <ClipboardCheck className="w-6 h-6 stroke-[2.2]" />
            </motion.div>

            {/* Content */}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                ข้อสอบเตรียมสอบ
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-1 leading-relaxed">
                เตรียมตัวสอบ TGAT, TPAT, A-Level และ O-NET
              </p>
            </div>
          </div>

          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 ml-3 relative z-10" />
        </motion.div>
      </div>

      {/* SECTION 2: วิชานิยม (Popular Subjects - 8 Items in Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            วิชานิยม
          </h2>
          <button
            onClick={() => setShowAllSubjects(!showAllSubjects)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50"
          >
            <span>ดูทั้งหมด</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showAllSubjects ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* 8 Popular Subject Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          {popularSubjects.map((sub, index) => {
            const Icon = sub.icon;

            // Custom motion variants for each subject archetype
            const getIconMotion = () => {
              switch (sub.id) {
                case 'math':
                  return { whileHover: { rotate: [-10, 10, -6, 6, 0] }, transition: { duration: 0.4 } };
                case 'physics':
                  return {
                    animate: { rotate: 360 },
                    transition: { duration: 18, repeat: Infinity, ease: 'linear' as const },
                    whileHover: { scale: 1.2, rotate: 720 },
                  };
                case 'chem':
                  return {
                    whileHover: { y: [-3, 2, -3, 0], rotate: [-8, 8, 0] },
                    transition: { duration: 0.45 },
                  };
                case 'bio':
                  return {
                    whileHover: { rotate: [0, 22, -12, 6, 0] },
                    transition: { duration: 0.5 },
                  };
                case 'languages':
                  return {
                    whileHover: { scale: [1, 1.28, 1.12] },
                    transition: { duration: 0.35 },
                  };
                case 'thai':
                  return {
                    whileHover: { rotateY: 180 },
                    transition: { duration: 0.5 },
                  };
                case 'social':
                  return {
                    whileHover: { rotate: 360 },
                    transition: { duration: 0.65 },
                  };
                case 'science':
                  return {
                    whileHover: { scale: [1, 1.3, 0.95, 1.15] },
                    transition: { duration: 0.4 },
                  };
                default:
                  return { whileHover: { scale: 1.15 } };
              }
            };

            const iconMotion = getIconMotion();

            return (
              <motion.div
                key={sub.id}
                id={`subject-tile-${sub.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                whileHover={{ y: -6, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSubjectClick(sub)}
                className={`bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer shadow-xs hover:shadow-md ${sub.borderHover} group transition-colors relative overflow-hidden`}
              >
                {/* Icon Box */}
                <div
                  className={`w-10 h-10 rounded-xl ${sub.bgColor} ${sub.iconColor} flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105`}
                >
                  <motion.div {...iconMotion}>
                    <Icon className="w-5 h-5" />
                  </motion.div>
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors whitespace-nowrap truncate w-full">
                  {sub.title}
                </h4>

                {/* Lessons count & Mastery */}
                <div className="flex items-center justify-between w-full mt-1.5 pt-1.5 border-t border-slate-100 text-[10px]">
                  <span className="text-slate-400 font-medium truncate">
                    {sub.lessons}
                  </span>
                  <span className="font-bold text-slate-700 shrink-0 ml-1">
                    {sub.mastery}%
                  </span>
                </div>

                {/* Animated Progress bar line */}
                <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    className={`${sub.barColor} h-full rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${sub.mastery}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* QUICK LAUNCH BANNER: มินิเกมฝึกทักษะ & Speed Challenge with Living Ambient Orbs */}
      <motion.div
        id="home-minigame-banner"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.012 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.3 }}
        onClick={() => onNavigate('minigame')}
        className="group relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-5 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-md shadow-indigo-500/15 hover:shadow-xl transition-shadow overflow-hidden"
      >
        {/* Living Ambient Glow Orbs */}
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.25, 0.9, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-400/25 rounded-full blur-2xl pointer-events-none"
        />
        <motion.div
          animate={{
            x: [0, -25, 15, 0],
            y: [0, 20, -15, 0],
            scale: [1, 1.2, 0.95, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-12 -right-12 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl pointer-events-none"
        />

        <div className="flex items-center gap-4 min-w-0 relative z-10">
          <motion.div
            animate={{
              rotate: [-3, 3, -3],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform"
          >
            <Gamepad2 className="w-6 h-6 stroke-[2.2]" />
          </motion.div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shadow-xs"
              >
                ⚡ Mini Game
              </motion.span>
              <h3 className="text-base font-bold text-white tracking-tight">
                มินิเกมฝึกคิดเลขเร็ว & จับคู่สูตรสายฟ้า
              </h3>
            </div>
            <p className="text-xs text-blue-100 mt-1 line-clamp-1">
              ฝึกสมอง 45 วินาที ทบทวนสูตรคณิต-วิทย์ และศัพท์ TGAT สะสม XP ปลดล็อกเหรียญรางวัล
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="self-start sm:self-auto px-4 py-2 bg-white text-indigo-700 font-bold text-xs rounded-xl shadow-xs hover:bg-blue-50 transition-colors flex items-center gap-1.5 shrink-0 relative z-10"
        >
          <span>เล่นเกมทันที</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>

      {/* SECTION 3: ประวัติการทำข้อสอบล่าสุด (Recent Exam History) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            ประวัติการทำข้อสอบล่าสุด
          </h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-blue-50"
          >
            <span>ดูทั้งหมด</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Recent Exam History Cards */}
        <div className="space-y-3">
          {displayedHistory.map((item, index) => {
            // Determine icon and color based on category or index
            const isGreen = item.percentage >= 70;
            const isYellow = item.percentage >= 40 && item.percentage < 70;

            const iconBg =
              item.category === 'TPAT' || index === 0
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                : item.category === 'School' || index === 1
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100';

            const ItemIcon =
              item.category === 'TPAT' || index === 0
                ? ClipboardCheck
                : item.category === 'School' || index === 1
                ? FileText
                : FileCheck;

            // Formatted date or custom text
            const completedDateText =
              item.completedAt && item.completedAt.includes('•')
                ? item.completedAt
                : `ชุดที่ 1 • ทำเมื่อ ${new Date(item.completedAt || Date.now()).toLocaleDateString(
                    'th-TH',
                    { day: 'numeric', month: 'short', year: 'numeric' }
                  )}`;

            return (
              <motion.div
                key={item.id}
                id={`recent-exam-item-${item.id}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ x: 4, scale: 1.005 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onNavigate('history')}
                className="bg-white border border-slate-100 hover:border-blue-200 rounded-2xl p-4 sm:px-5 flex items-center justify-between cursor-pointer shadow-xs hover:shadow-sm group transition-colors"
              >
                {/* Left: Icon and Title info */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <ItemIcon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                      {completedDateText}
                    </p>
                  </div>
                </div>

                {/* Right: Score & Percentage Pill */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">
                    <strong className="text-slate-900">{item.score}</strong> / {item.totalQuestions} คะแนน
                  </span>

                  {/* Percentage Pill */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isGreen
                        ? 'bg-emerald-100/80 text-emerald-700'
                        : isYellow
                        ? 'bg-amber-100/80 text-amber-700'
                        : 'bg-rose-100/80 text-rose-700'
                    }`}
                  >
                    {item.percentage}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
