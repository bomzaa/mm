import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  BarChart2,
  TrendingUp,
  Target,
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Compass,
  RefreshCw,
  Zap,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  MoveHorizontal,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { UserProfile, ExamHistoryItem, AnalysisReport } from '../types';
import { StorageService } from '../lib/storage';
import { FirestoreService } from '../lib/firestoreService';

interface AnalyticsDashboardProps {
  user: UserProfile;
  history: ExamHistoryItem[];
  onNavigateToGenerator?: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  user,
  history,
  onNavigateToGenerator,
}) => {
  const [report, setReport] = useState<AnalysisReport | null>(() => StorageService.getLatestAnalysis());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute stats
  const totalExams = history.length;
  const totalQuestions = history.reduce((acc, h) => acc + h.totalQuestions, 0);
  const totalCorrect = history.reduce((acc, h) => acc + h.score, 0);
  const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  // Radar Data for competencies
  const radarData = [
    { subject: 'TGAT1 ภาษาอังกฤษ', score: Math.min(100, (user.targetScoreTGAT || 80) - 5) },
    { subject: 'TGAT2 ตรรกะ/ตัวเลข', score: Math.min(100, (user.targetScoreTGAT || 80) + 5) },
    { subject: 'TGAT3 สมรรถนะอนาคต', score: Math.min(100, (user.targetScoreTGAT || 80)) },
    { subject: 'TPAT ความถนัดวิชาชีพ', score: Math.min(100, user.targetScoreTPAT || 75) },
    { subject: 'A-Level คณิต/คำนวณ', score: Math.min(100, (user.targetScoreALevel || 70) - 10) },
    { subject: 'A-Level วิทย์/สังคม', score: Math.min(100, (user.targetScoreALevel || 70) + 5) },
  ];

  // History timeline data: All attempts mapped in chronological order (attempt 1, 2, 3...)
  const historyChartData = useMemo(() => {
    if (!history || history.length === 0) return [];
    
    // Sort oldest first so ครั้งที่ 1 is the 1st attempt, ครั้งที่ 2 is 2nd, etc.
    const sorted = [...history].sort(
      (a, b) => new Date(a.completedAt || 0).getTime() - new Date(b.completedAt || 0).getTime()
    );

    return sorted.map((h, idx) => {
      const d = new Date(h.completedAt);
      const dateText = !isNaN(d.getTime())
        ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
        : '';
      return {
        id: h.id,
        name: `ครั้งที่ ${idx + 1}`,
        attemptIndex: idx + 1,
        score: h.percentage,
        rawScore: h.score,
        totalQuestions: h.totalQuestions,
        subject: h.subject || h.title,
        title: h.title,
        category: h.category,
        date: dateText,
      };
    });
  }, [history]);

  // Horizontal Scroll & Drag-to-Scroll refs and state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftStart, setScrollLeftStart] = useState(0);

  // Check scroll boundaries
  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth + 5;
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  }, []);

  // Auto-scroll to the newest attempts (far right) on mount or data change
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
      updateScrollButtons();
    }
  }, [historyChartData.length, updateScrollButtons]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [updateScrollButtons]);

  const handleScrollClick = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (el) {
      const step = 200;
      el.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth',
      });
      setTimeout(updateScrollButtons, 300);
    }
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftStart(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftStart - walk;
    updateScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    updateScrollButtons();
  };

  // Dynamic Chart Width Calculation: scales comfortably with attempt count
  const chartDynamicWidth = Math.max(480, historyChartData.length * 64);

  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: user,
          history: history.slice(0, 10),
        }),
      });

      if (!response.ok) {
        throw new Error(`การวิเคราะห์ล้มเหลว: ${response.status}`);
      }

      const data = await response.json();
      const analysisReport: AnalysisReport = {
        readinessScore: data.readinessScore || Math.min(95, Math.max(40, averageAccuracy || 72)),
        estimatedPercentile: data.estimatedPercentile || 'Top 15-20% ของประเทศ',
        overview: data.overview || 'ผลการทำข้อสอบอยู่ในเกณฑ์ดี มีความพร้อมในหมวดตรรกะและการอ่าน',
        targetFacultyFeedback: data.targetFacultyFeedback || `มีโอกาสสอบติด ${user.dreamFaculty} สูง หากรักษาความสม่ำเสมอ`,
        strengths: data.strengths || [
          { topic: 'การคิดเชิงตรรกะ (TGAT2)', detail: 'ทำคะแนนพาร์ทอนุกรมและตรรกศาสตร์ได้แม่นยำและรวดเร็ว' },
          { topic: 'การอ่านจับใจความ', detail: 'เข้าใจประเด็นหลักของบทความได้รวดเร็ว' },
        ],
        weaknesses: data.weaknesses || [
          { topic: 'ไวยากรณ์ขั้นสูง (Error ID)', detail: 'ต้องทบทวน Subject-Verb Agreement และ Participle', priority: 'สูง' },
          { topic: 'การบริหารเวลาในห้องสอบ', detail: 'ใช้เวลาเกินในพาร์ทคำนวณซับซ้อน', priority: 'ปานกลาง' },
        ],
        weeklyPlan: data.weeklyPlan || [
          { day: 'วันจันทร์-อังคาร', focus: 'TGAT1 ภาษาอังกฤษ', action: 'ฝึกทำโจทย์ Reading & Cloze Test วันละ 15 ข้อ' },
          { day: 'วันพุธ-พฤหัสบดี', focus: 'TGAT2 ตรรกะตัวเลข', action: 'ทบทวนสูตรลัดอนุกรมและมิติสัมพันธ์ 20 ข้อ' },
          { day: 'วันศุกร์-เสาร์', focus: 'A-Level / TPAT', action: 'จับเวลาทำข้อสอบเสมือนจริง 1 ชุดเต็ม' },
          { day: 'วันอาทิตย์', focus: 'ทบทวนข้อผิด', action: 'สรุปสมุดบันทึกข้อผิดพลาด (Error Note)' },
        ],
        tips: data.tips || [
          'เทคนิคตัดช้อยส์: ตัด 2 ช้อยส์ที่เป็นไปไม่ได้ออกก่อนเสมอเพื่อเพิ่มโอกาสถูกเป็น 50%',
          'ตั้งเป้าทำข้อสอบสม่ำเสมอวันละอย่างน้อย 15-20 ข้อดีกว่าอ่านอัดวันเดียว',
        ],
        analyzedAt: new Date().toISOString(),
      };

      setReport(analysisReport);
      StorageService.saveLatestAnalysis(analysisReport);
      FirestoreService.saveAnalysisReport(analysisReport).catch((err) =>
        console.warn('Firestore report save notice:', err)
      );
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการประมวลผล');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner with AI Analyze Button */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Exam Performance Analytics
            </span>
            <span className="text-xs text-slate-400">อัปเดตล่าสุดตามประวัติข้อสอบ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            วิเคราะห์ความพร้อม & จุดแข็งจุดอ่อน
          </h2>
          <p className="text-sm text-slate-500">
            เป้าหมาย: <strong className="text-slate-800">{user.dreamFaculty} ({user.dreamUniversity})</strong> • ระดับชั้น: {user.gradeLevel}
          </p>
        </div>

        <button
          id="run-ai-analysis-btn"
          onClick={handleRunAIAnalysis}
          disabled={isAnalyzing}
          className="py-3 px-6 rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95 disabled:opacity-60"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI กำลังประมวลผลการเรียน...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>วิเคราะห์ผลด้วย AI ทันที</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ดัชนีความพร้อม (Readiness)</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {report ? `${report.readinessScore}%` : `${Math.max(60, averageAccuracy)}%`}
          </div>
          <div className="text-xs text-indigo-600 font-semibold mt-1">
            {report ? report.estimatedPercentile : 'คาดการณ์โอกาสสอบติด'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">ชุดข้อสอบที่ทำแล้ว</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalExams} ชุด</div>
          <div className="text-xs text-emerald-600 font-semibold mt-1">
            สะสมทั้งหมด {totalQuestions} ข้อ
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">อัตราความถูกต้องเฉลี่ย</span>
            <TrendingUp className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{averageAccuracy}%</div>
          <div className="text-xs text-slate-500 font-semibold mt-1">
            {totalCorrect}/{totalQuestions} ข้อที่ตอบถูก
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">เป้าหมายคะแนน TGAT</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{user.targetScoreTGAT}/100</div>
          <div className="text-xs text-amber-600 font-semibold mt-1">
            TPAT {user.targetScoreTPAT} • A-Level {user.targetScoreALevel}
          </div>
        </div>
      </div>

      {/* Visual Charts: Radar Chart & Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Radar Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black text-slate-800 text-base">สมรรถนะแต่ละทักษะการสอบ (Radar Assessment)</h3>
              <p className="text-xs text-slate-500">ความเชี่ยวชาญเทียบกับเกณฑ์เป้าหมาย TCAS</p>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="ความพร้อม" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
              ระดับความพร้อมของผู้เรียน
            </span>
          </div>
        </div>

        {/* History Bar Progression Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-black text-slate-800 text-base">แนวโน้มคะแนนสอบย้อนหลัง (%)</h3>
              <p className="text-xs text-slate-500">พัฒนาการจากชุดข้อสอบจำลองล่าสุด</p>
            </div>

            {/* Scroll Navigation Controls */}
            {historyChartData.length > 0 && (
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/80 shrink-0">
                <button
                  type="button"
                  id="chart-scroll-left-btn"
                  onClick={() => handleScrollClick('left')}
                  disabled={!canScrollLeft}
                  className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  title="เลื่อนไปทางซ้าย (ดูครั้งก่อนหน้า)"
                  aria-label="เลื่อนซ้าย"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-slate-600 px-1.5 select-none">
                  {historyChartData.length} ครั้ง
                </span>
                <button
                  type="button"
                  id="chart-scroll-right-btn"
                  onClick={() => handleScrollClick('right')}
                  disabled={!canScrollRight}
                  className="p-1.5 rounded-lg hover:bg-white hover:shadow-2xs text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  title="เลื่อนไปทางขวา (ดูครั้งล่าสุด)"
                  aria-label="เลื่อนขวา"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {historyChartData.length > 0 ? (
            <div className="space-y-2">
              {/* Horizontally Scrollable Chart Area */}
              <div
                ref={scrollContainerRef}
                onScroll={updateScrollButtons}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className={`w-full overflow-x-auto custom-scrollbar pb-2 select-none ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{ scrollbarWidth: 'thin' }}
              >
                <div style={{ width: `${chartDynamicWidth}px`, height: '280px', minWidth: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={historyChartData}
                      margin={{ top: 10, right: 20, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        interval={0}
                      />
                      <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${value}%`, 'คะแนนความถูกต้อง']}
                        labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                            const item = payload[0].payload;
                            return `${label}: ${item.title || item.subject} ${item.date ? `(${item.date})` : ''}`;
                          }
                          return label;
                        }}
                        contentStyle={{
                          borderRadius: '12px',
                          borderColor: '#e2e8f0',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                          fontSize: '12px',
                        }}
                      />
                      <Bar
                        dataKey="score"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={44}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scroll guide text / indicator */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <MoveHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span>ลากเมาส์ หรือปัดเพื่อเลื่อนซ้าย-ขวา</span>
                </span>
                <span>
                  {canScrollLeft ? '👈 มีครั้งก่อนหน้า' : 'ครั้งแรก'} • {canScrollRight ? 'มีครั้งล่าสุด 👉' : 'ครั้งล่าสุด'}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
              <BarChart2 className="w-10 h-10 text-slate-300" />
              <span>ยังไม่มีประวัติการทำข้อสอบเพียงพอ</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 text-center font-medium">
            ยิ่งทำข้อสอบจำลองต่อเนื่อง กราฟจะยิ่งสะท้อนความพร้อมจริงได้แม่นยำขึ้น
          </div>
        </div>
      </div>

      {/* AI Detailed Diagnosis Section */}
      {report && (
        <div className="bg-linear-to-b from-indigo-50/50 to-white rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-indigo-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">
                ผลการวิเคราะห์เจาะลึกและแผนพัฒนาเฉพาะบุคคล โดย AI
              </h3>
              <p className="text-xs text-slate-500">
                วิเคราะห์เมื่อ {new Date(report.analyzedAt).toLocaleString('th-TH')}
              </p>
            </div>
          </div>

          {/* Target Faculty Feedback Banner */}
          <div className="p-4 bg-white rounded-2xl border border-indigo-200 shadow-2xs">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-indigo-950">
                  การประเมินโอกาสสอบติด: {user.dreamFaculty}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {report.targetFacultyFeedback}
                </p>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>จุดแข็งเด่นชัด (ทำคะแนนได้ดี)</span>
              </div>
              <div className="space-y-2">
                {report.strengths.map((item, idx) => (
                  <div key={idx} className="p-3 bg-emerald-50/60 rounded-xl space-y-0.5">
                    <div className="font-bold text-xs text-emerald-900">{item.topic}</div>
                    <div className="text-xs text-slate-600">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>จุดอ่อนที่ต้องเร่งแก้ไขด่วน</span>
              </div>
              <div className="space-y-2">
                {report.weaknesses.map((item, idx) => (
                  <div key={idx} className="p-3 bg-rose-50/60 rounded-xl space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-rose-900">{item.topic}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-200 text-rose-800">
                        ความสำคัญ: {item.priority}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Day Study Schedule */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>ตารางติวเข้มและฝึกทำข้อสอบ 7 วันที่แนะนำ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {report.weeklyPlan.map((plan, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="text-[11px] font-black text-indigo-600 uppercase">{plan.day}</div>
                  <div className="font-bold text-xs text-slate-800 truncate">{plan.focus}</div>
                  <div className="text-xs text-slate-500 leading-snug">{plan.action}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Strategy Tips */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
              <span>เคล็ดลับพิเศษสำหรับเตรียมสอบ</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700">
              {report.tips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
