import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Search,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Database,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Eye,
  BookOpen,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  Upload,
  FileUp,
  Image as ImageIcon,
  Edit3,
  Trash2,
} from 'lucide-react';
import { ExamData, Question, ExamStatus } from '../types';
import { FirestoreService } from '../lib/firestoreService';
import { Tpat3Dec66Section } from './Tpat3Dec66Section';
import { AdminPdfImporter } from './AdminPdfImporter';
import { MathRenderer } from './MathRenderer';

interface ExamPreparationViewProps {
  onStartExam: (exam: ExamData) => void;
  onBackToMenu: () => void;
}

export const ExamPreparationView: React.FC<ExamPreparationViewProps> = ({
  onStartExam,
  onBackToMenu,
}) => {
  const [examSets, setExamSets] = useState<ExamData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExamType, setSelectedExamType] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  // Selected Exam Set for Details / Preview Modal
  const [activeExamDetail, setActiveExamDetail] = useState<ExamData | null>(null);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState<number>(0);
  const [showDedicatedTpat3Section, setShowDedicatedTpat3Section] = useState<boolean>(false);
  const [showAdminPdfImporter, setShowAdminPdfImporter] = useState<boolean>(false);

  // Load exam sets from Firebase Firestore
  const loadExams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sets = await FirestoreService.getExamPreparationSets();
      setExamSets(sets);
    } catch (err: any) {
      console.error('Error loading exam preparation sets:', err);
      setError('ไม่สามารถเชื่อมต่อฐานข้อมูล Firebase ได้ กรุณากดลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExams();

    // Subscribe to real-time updates from Firebase
    const unsubscribe = FirestoreService.subscribeExamPreparationSets(
      (updatedSets) => {
        if (updatedSets && updatedSets.length > 0) {
          setExamSets(updatedSets);
        }
      },
      (err) => {
        console.warn('Real-time snapshot error in ExamPreparationView:', err);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Unique lists for filter pills/dropdowns
  const examTypes = ['ALL', ...Array.from(new Set(examSets.map((e) => e.category || 'TPAT')))];
  const years = ['ALL', ...Array.from(new Set(examSets.map((e) => e.year || '2566'))).sort((a, b) => b.localeCompare(a))];
  const subjects = ['ALL', ...Array.from(new Set(examSets.map((e) => e.subject || ''))).filter(Boolean)];

  // Filtered Exam Sets
  const filteredSets = examSets.filter((item) => {
    // Exam Type filter (TPAT3 is matching category TPAT or examCode TPAT3)
    if (selectedExamType !== 'ALL') {
      const matchesCategory = item.category === selectedExamType;
      const matchesCode = item.examCode?.includes(selectedExamType);
      if (!matchesCategory && !matchesCode) return false;
    }

    // Year filter
    if (selectedYear !== 'ALL' && item.year !== selectedYear) {
      return false;
    }

    // Subject filter
    if (selectedSubject !== 'ALL' && item.subject !== selectedSubject) {
      return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSubject = item.subject?.toLowerCase().includes(q);
      const matchTopic = item.topic?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchCode = item.examCode?.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchTopic && !matchDesc && !matchCode) {
        return false;
      }
    }

    return true;
  });

  return (
    <div id="exam-preparation-view-container" className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Top Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  ข้อสอบเตรียมสอบ
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin นำเข้า • คลังข้อสอบจริง</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                ข้อสอบจริงและแนวข้อสอบมาตรฐานที่ Admin นำเข้าในระบบ Firebase Firestore โดยตรง
                (ไม่ผ่านการดัดแปลงหรือสร้างโดย AI) พร้อมข้อมูลรูปภาพและแผนภาพทางวิศวกรรมครบถ้วน
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <motion.button
              type="button"
              id="btn-admin-pdf-importer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAdminPdfImporter(true)}
              className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <FileUp className="w-4 h-4" />
              <span>นำเข้าข้อสอบจาก PDF (Admin)</span>
            </motion.button>

            <motion.button
              type="button"
              id="btn-back-to-exam-menu"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={onBackToMenu}
              className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>เปลี่ยนประเภทข้อสอบ</span>
            </motion.button>
          </div>
        </div>

        {/* Admin PDF Importer Modal/Panel */}
        <AnimatePresence>
          {showAdminPdfImporter && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 pt-6 border-t border-slate-100"
            >
              <AdminPdfImporter
                onCancel={() => setShowAdminPdfImporter(false)}
                onExamSaved={(savedExam) => {
                  setExamSets((prev) => {
                    const idx = prev.findIndex((e) => e.id === savedExam.id);
                    if (idx >= 0) {
                      const next = [...prev];
                      next[idx] = savedExam;
                      return next;
                    }
                    return [savedExam, ...prev];
                  });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Highlight Banner: TPAT3 ธ.ค. 66 */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-cyan-50/90 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-md">
                  แนะนำสำหรับ ม.6
                </span>
                <span className="text-xs text-slate-500">• 70 ข้อเต็มชุด</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                TPAT3 ➔ ข้อสอบเตรียมสอบ ➔ แนวข้อสอบ TPAT3 ธ.ค. 66
              </h3>
              <p className="text-xs text-slate-600">
                ดึงข้อสอบจริงจาก Firebase Firestore แยกวิชาเฉพาะ พร้อมแปลนรอก วงจรไฟฟ้า ภาพฉาย 3D
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="btn-quick-view-tpat3"
              onClick={() => {
                const tpat3 = examSets.find((e) => e.id === 'tpat3-dec-66');
                if (tpat3) {
                  setActiveExamDetail(tpat3);
                } else {
                  setShowDedicatedTpat3Section(true);
                }
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ดูรายละเอียดชุดนี้</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="btn-toggle-tpat3-importer"
              onClick={() => setShowDedicatedTpat3Section(!showDedicatedTpat3Section)}
              title="จัดการชุดข้อสอบ TPAT3 / นำเข้าไฟล์ PDF"
              className="px-3 py-2.5 bg-white hover:bg-slate-50 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">นำเข้า PDF</span>
            </button>
          </div>
        </div>

        {/* Collapsible Dedicated TPAT3 Section & PDF Importer */}
        <AnimatePresence>
          {showDedicatedTpat3Section && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 pt-5 border-t border-slate-100 overflow-hidden"
            >
              <Tpat3Dec66Section onStartExam={onStartExam} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search and Filters Bar */}
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="search-exam-prep-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชุดข้อสอบ, รหัสวิชา, หรือเนื้อหา..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ล้าง
                </button>
              )}
            </div>

            {/* Exam Type Select */}
            <div className="md:col-span-3">
              <select
                id="select-filter-exam-type"
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="ALL">สนามสอบ: ทั้งหมด</option>
                <option value="TPAT3">TPAT3 (ความถนัดวิทย์-วิศวะ)</option>
                <option value="TGAT">TGAT (ความถนัดทั่วไป)</option>
                <option value="TPAT">TPAT (ความถนัดวิชาชีพ)</option>
                <option value="A-Level">A-Level (วิชาสามัญ)</option>
                <option value="O-NET">O-NET (ระดับชาติ)</option>
              </select>
            </div>

            {/* Year Select */}
            <div className="md:col-span-2">
              <select
                id="select-filter-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:border-slate-300 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="ALL">ปี: ทั้งหมด</option>
                {years.filter(y => y !== 'ALL').map((y) => (
                  <option key={y} value={y}>
                    ปี {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <div className="md:col-span-2 flex items-center">
              <button
                type="button"
                id="btn-refresh-exams"
                onClick={loadExams}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`} />
                <span>รีเฟรช</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>ทางลัด:</span>
            </span>
            {[
              { label: 'ทั้งหมด', type: 'ALL', year: 'ALL' },
              { label: 'TPAT3 (วิศวะ/วิทย์)', type: 'TPAT3', year: 'ALL' },
              { label: 'TGAT ธ.ค. 66', type: 'TGAT', year: '2566' },
              { label: 'A-Level 66', type: 'A-Level', year: '2566' },
              { label: 'O-NET ม.6', type: 'O-NET', year: '2566' },
            ].map((pill, idx) => {
              const isActive = selectedExamType === pill.type && (pill.year === 'ALL' || selectedYear === pill.year);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedExamType(pill.type);
                    if (pill.year !== 'ALL') setSelectedYear(pill.year);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading Skeleton State */
        <div id="exam-prep-loading-state" className="space-y-4">
          <div className="flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-bold text-slate-800">
                กำลังดึงข้อมูลชุดข้อสอบเตรียมสอบจาก Firebase...
              </p>
              <p className="text-xs text-slate-400">
                เชื่อมต่อคลังข้อสอบ Admin แยกหมวดหมู่ตามมาตรฐาน ทปอ.
              </p>
            </div>
          </div>
        </div>
      ) : error ? (
        /* Error State */
        <div id="exam-prep-error-state" className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-rose-900">เกิดข้อผิดพลาดในการโหลดข้อสอบ</h3>
            <p className="text-xs text-rose-600 mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={loadExams}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      ) : filteredSets.length === 0 ? (
        /* Empty State */
        <div id="exam-prep-empty-state" className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">ไม่พบชุดข้อสอบที่ตรงกับเงื่อนไขการค้นหา</h3>
            <p className="text-xs text-slate-500 mt-1">
              ลองปรับเปลี่ยนคำค้นหา หรือเลือกตัวกรองสนามสอบเป็น "ทั้งหมด"
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedExamType('ALL');
              setSelectedYear('ALL');
              setSelectedSubject('ALL');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        /* List of Exam Sets */
        <div id="exam-prep-list" className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSets.map((set) => {
            const isTpat3 = set.id === 'tpat3-dec-66' || set.examCode === 'TPAT3';
            const questionsCount = set.questions?.length || set.totalQuestions || 0;

            return (
              <motion.div
                key={set.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -3 }}
                className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                  isTpat3
                    ? 'border-blue-300 ring-1 ring-blue-100 hover:border-blue-400'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Card Badges Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black tracking-wide ${
                        isTpat3
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-900 text-white'
                      }`}>
                        {set.category || 'TPAT'}
                      </span>
                      {set.year && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                          ปี {set.year} {set.term ? `(${set.term})` : ''}
                        </span>
                      )}
                      {/* Status Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        set.status === 'พร้อมใช้งาน'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : set.status === 'ตรวจสอบแล้ว'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : set.status === 'กำลังประมวลผล'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        ● {set.status || 'พร้อมใช้งาน'}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-md border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>PDF ต้นฉบับ</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {set.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {set.description || set.topic || 'ข้อสอบมาตรฐานเตรียมสอบเข้ามหาวิทยาลัย'}
                  </p>

                  {/* PDF Source & Details Pills */}
                  {(set.sourceFile || set.totalPages || set.diagramsCount) && (
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-2">
                      {set.sourceFile && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span className="truncate max-w-[180px]">{set.sourceFile}</span>
                        </span>
                      )}
                      {set.totalPages && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                          <span>{set.totalPages} หน้า</span>
                        </span>
                      )}
                      {((set.diagramsCount && set.diagramsCount > 0) || (set.questions?.some(q => q.hasDiagram || q.diagramSvg))) && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md">
                          <ImageIcon className="w-3 h-3" />
                          <span>แผนภาพ {set.diagramsCount || set.questions?.filter(q => q.hasDiagram || q.diagramSvg).length} ข้อ</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Meta Information Pills */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span><strong>{questionsCount}</strong> ข้อ</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span><strong>{set.timeLimitMinutes}</strong> นาที</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Database className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="truncate">Firestore DB</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveExamDetail(set)}
                    className="flex-1 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>ดูรายละเอียด</span>
                  </button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onStartExam(set)}
                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <span>เริ่มทำข้อสอบ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Details & Structure Modal */}
      <AnimatePresence>
        {activeExamDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setActiveExamDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">
                      {activeExamDetail.category} • {activeExamDetail.year || '2566'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Admin Curated</span>
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-2">
                    {activeExamDetail.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeExamDetail.subject}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveExamDetail(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Exam Blueprint Breakdown */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] font-bold text-slate-400 block">จำนวนข้อ</span>
                    <span className="text-lg font-black text-slate-900">
                      {activeExamDetail.questions?.length || activeExamDetail.totalQuestions || 0} ข้อ
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] font-bold text-slate-400 block">เวลาสอบ</span>
                    <span className="text-lg font-black text-slate-900">
                      {activeExamDetail.timeLimitMinutes} นาที
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] font-bold text-slate-400 block">ระดับความยาก</span>
                    <span className="text-lg font-black text-blue-600">
                      {activeExamDetail.difficulty}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[11px] font-bold text-slate-400 block">ฐานข้อมูล</span>
                    <span className="text-lg font-black text-emerald-600">
                      Firestore
                    </span>
                  </div>
                </div>

                {/* Description Box */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>คำอธิบายโครงสร้างข้อสอบ</span>
                  </h4>
                  <p>{activeExamDetail.description || 'ชุดข้อสอบจริงตามแบบพิมพ์เขียวการสอบทางการ'}</p>
                  {activeExamDetail.source && (
                    <p className="mt-2 text-[11px] text-slate-400">
                      แหล่งที่มา: {activeExamDetail.source}
                    </p>
                  )}
                </div>

                {/* TPAT3 Specific Topics Notice */}
                {activeExamDetail.id === 'tpat3-dec-66' && (
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-xs text-slate-700 space-y-2">
                    <h5 className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span>สัดส่วนคะแนนและหมวดหมู่ข้อสอบจริง (ครบ 70 ข้อ):</span>
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 ml-1">
                      <li>ตอนที่ 1: การทดสอบความถนัดด้านตัวเลข, มิติสัมพันธ์, ด้านเชิงกลและฟิสิกส์ (ข้อ 1-45 • หน้า 1-30)</li>
                      <li>ตอนที่ 2: ความคิดและความสนใจทางด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์ (ข้อ 46-70 • หน้า 31-44)</li>
                    </ul>
                  </div>
                )}

                {/* Questions Preview Accordion / Mini Inspector */}
                {activeExamDetail.questions && activeExamDetail.questions.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>ตัวอย่างข้อสอบจาก PDF ({activeExamDetail.questions.length} ข้อ):</span>
                      </h5>
                      <span className="text-[11px] text-slate-400">
                        แสดงข้อ {previewQuestionIndex + 1} จาก {activeExamDetail.questions.length}
                      </span>
                    </div>

                    {/* Question Viewer Card */}
                    {activeExamDetail.questions[previewQuestionIndex] && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                              ข้อที่ {activeExamDetail.questions[previewQuestionIndex].questionNumber}
                            </span>
                            <span className="text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              หน้า {activeExamDetail.questions[previewQuestionIndex].sourcePage || '-'}
                            </span>
                            {activeExamDetail.questions[previewQuestionIndex].hasDiagram && (
                              <span className="text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                                <ImageIcon className="w-3 h-3" />
                                มีรูป
                              </span>
                            )}
                          </div>

                          {/* Navigation buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={previewQuestionIndex === 0}
                              onClick={() => setPreviewQuestionIndex((prev) => Math.max(0, prev - 1))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                            >
                              ← ก่อนหน้า
                            </button>
                            <button
                              type="button"
                              disabled={previewQuestionIndex === activeExamDetail.questions.length - 1}
                              onClick={() => setPreviewQuestionIndex((prev) => Math.min(activeExamDetail.questions.length - 1, prev + 1))}
                              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                            >
                              ถัดไป →
                            </button>
                          </div>
                        </div>

                        {/* Question Text with Math */}
                        <div className="text-slate-800 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                          <MathRenderer text={activeExamDetail.questions[previewQuestionIndex].questionText} />
                        </div>

                        {/* Diagram Render */}
                        {activeExamDetail.questions[previewQuestionIndex].diagramSvg && (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-center">
                            <div
                              className="max-w-xs w-full"
                              dangerouslySetInnerHTML={{ __html: activeExamDetail.questions[previewQuestionIndex].diagramSvg! }}
                            />
                          </div>
                        )}

                        {/* Options */}
                        <div className="space-y-1.5">
                          {activeExamDetail.questions[previewQuestionIndex].options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg border flex items-center gap-2 ${
                                activeExamDetail.questions[previewQuestionIndex].correctOptionIndex === oIdx
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="w-5 text-center font-bold text-slate-400">{oIdx + 1}.</span>
                              <span className="flex-1"><MathRenderer text={opt} /></span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveExamDetail(null)}
                  className="w-full sm:w-1/3 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
                <motion.button
                  type="button"
                  id="modal-btn-start-exam"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const examToStart = activeExamDetail;
                    setActiveExamDetail(null);
                    onStartExam(examToStart);
                  }}
                  className="w-full sm:w-2/3 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>เริ่มทำข้อสอบชุดนี้ทันที</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
