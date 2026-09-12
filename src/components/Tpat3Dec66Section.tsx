import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  Database,
  Play,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileCheck,
  Cpu,
  Compass,
  Zap,
  Leaf,
  Layers,
  Search,
} from 'lucide-react';
import { ExamData, Question } from '../types';
import { TPAT3_DEC_66_EXAM } from '../data/tpat3December66Data';
import { FirestoreService } from '../lib/firestoreService';
import { extractTextFromPdf, parseTpat3Text, buildTpat3ExamData } from '../utils/tpat3PdfParser';
import { MathRenderer } from './MathRenderer';

interface Tpat3Dec66SectionProps {
  onStartExam: (exam: ExamData) => void;
}

export const Tpat3Dec66Section: React.FC<Tpat3Dec66SectionProps> = ({ onStartExam }) => {
  const [examData, setExamData] = useState<ExamData>(TPAT3_DEC_66_EXAM);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(false);
  const [isLoadingFromFirebase, setIsLoadingFromFirebase] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isImporterOpen, setIsImporterOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');

  // Load or sync from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const loadFromFirestore = async () => {
      try {
        setIsLoadingFromFirebase(true);
        const remoteExam = await FirestoreService.getOfficialExam('tpat3-dec-66');
        if (remoteExam && isMounted) {
          setExamData(remoteExam);
          setIsFirebaseSynced(true);
        } else {
          // Sync default verified official TPAT3 Dec 66 exam to Firestore
          await FirestoreService.saveOfficialExam(TPAT3_DEC_66_EXAM);
          if (isMounted) setIsFirebaseSynced(true);
        }
      } catch (err) {
        console.warn('Firestore initial sync warning:', err);
      } finally {
        if (isMounted) setIsLoadingFromFirebase(false);
      }
    };

    loadFromFirestore();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle PDF file upload & parsing
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('กรุณาเลือกไฟล์ PDF เท่านั้น');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      // 1. Extract text from the real PDF
      const { fullText, pageCount } = await extractTextFromPdf(file);
      
      // 2. Parse text into structured questions
      const parsedQuestions = parseTpat3Text(fullText);

      if (parsedQuestions.length === 0) {
        // Fallback: If OCR is needed or parsing format differed, notify user
        setUploadError(`อ่านพบ ${pageCount} หน้า แต่รูปแบบข้อสอบในไฟล์ไม่ตรงกับโครงสร้างตัวเลือก 1-5 หรือ ก-จ กรุณาตรวจสอบเนื้อหา`);
        setIsUploading(false);
        return;
      }

      // 3. Build verified ExamData
      const updatedExam = buildTpat3ExamData(parsedQuestions, file.name);

      // 4. Save to Firestore under officialExams/tpat3-dec-66
      await FirestoreService.saveOfficialExam(updatedExam);

      setExamData(updatedExam);
      setIsFirebaseSynced(true);
      setUploadSuccess(`นำเข้าสำเร็จ! ถอดรหัสข้อสอบได้ ${parsedQuestions.length} ข้อ จากทั้งหมด ${pageCount} หน้า และซิงค์เข้า Firebase เรียบร้อยแล้ว`);
    } catch (err: any) {
      console.error('Error parsing PDF:', err);
      setUploadError(`เกิดข้อผิดพลาดในการประมวลผลไฟล์ PDF: ${err.message || 'ไม่สามารถอ่านไฟล์ได้'}`);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Filter questions for the question browser
  const filteredQuestions = examData.questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchFilter.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchFilter.toLowerCase()) ||
      `ข้อ ${q.questionNumber || ''}`.includes(searchFilter);
    const matchesTopic =
      selectedTopicFilter === 'all' || q.topic.includes(selectedTopicFilter) || q.lesson.includes(selectedTopicFilter);
    return matchesSearch && matchesTopic;
  });

  return (
    <div
      id="tpat3-dec-66-archive-container"
      className="bg-gradient-to-b from-blue-50/70 to-white border-2 border-blue-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 mb-8"
    >
      {/* Category Hierarchy Breadcrumb Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 pb-4">
        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-900">
          <span className="px-2.5 py-1 bg-blue-100/80 rounded-lg text-blue-800">สร้างข้อสอบเตรียมสอบ</span>
          <span className="text-blue-300">/</span>
          <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg shadow-xs">TPAT3</span>
          <span className="text-blue-300">/</span>
          <span className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-blue-950 font-bold">
            แนวข้อสอบ TPAT3 ธ.ค. 66
          </span>
        </div>

        {/* Firebase Sync Status Badge */}
        <div className="flex items-center gap-2">
          {isLoadingFromFirebase ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              กำลังเชื่อมต่อ Firebase...
            </span>
          ) : isFirebaseSynced ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              เชื่อมต่อ Firebase Firestore แล้ว
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              <Database className="w-3.5 h-3.5" />
              โหมดแคชในเครื่อง
            </span>
          )}
        </div>
      </div>

      {/* Main Exam Card Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500 text-white rounded-md tracking-wider">
              OFFICIAL EXAM ARCHIVE
            </span>
            <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-md">
              รอบสอบ ธันวาคม 2566
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            แนวข้อสอบ TPAT3 ธ.ค. 66
          </h3>
          <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
            คลังข้อสอบจริงความถนัดด้านวิทยาศาสตร์ เทคโนโลยี และวิศวกรรมศาสตร์ ครอบคลุมกลศาสตร์เชิงกล, การคิดเชิงคำนวณ, มิติสัมพันธ์ และนวัตกรรมพลังงานสะอาด พร้อมสมการ LaTeX และเฉลยละเอียด
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <motion.button
            type="button"
            id="start-tpat3-dec66-exam-btn"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onStartExam(examData)}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-colors cursor-pointer text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>เริ่มทำข้อสอบชุดนี้ทันที ({examData.questions.length} ข้อ)</span>
          </motion.button>

          <button
            type="button"
            id="toggle-pdf-importer-btn"
            onClick={() => setIsImporterOpen(!isImporterOpen)}
            className="flex items-center gap-2 px-4 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-200 rounded-2xl transition-colors cursor-pointer text-sm"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            <span>นำเข้า/อัปเดตไฟล์ PDF จริง</span>
            {isImporterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Blueprint Sub-competency Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">ส่วนที่ 1.1</p>
            <p className="text-xs font-bold text-slate-800">ความถนัดเชิงกล</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">ส่วนที่ 1.2</p>
            <p className="text-xs font-bold text-slate-800">การคิดเชิงคำนวณ</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">ส่วนที่ 1.3</p>
            <p className="text-xs font-bold text-slate-800">มิติสัมพันธ์ & ภาพฉาย</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">ส่วนที่ 2.1</p>
            <p className="text-xs font-bold text-slate-800">นวัตกรรม & เทคโนโลยี</p>
          </div>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500">ส่วนที่ 2.2</p>
            <p className="text-xs font-bold text-slate-800">สิ่งแวดล้อม Net Zero</p>
          </div>
        </div>
      </div>

      {/* Expandable PDF Importer Panel */}
      <AnimatePresence>
        {isImporterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border border-blue-200 bg-white rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  ระบบนำเข้าและถอดรหัสไฟล์ PDF "แนวข้อสอบ TPAT3 ธ.ค. 66" เข้าสู่ Firebase
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  เลือกหรือลากไฟล์ PDF เพื่ออ่านข้อความ สมการคณิตศาสตร์ และเฉลยจริง โดยไม่ใช้ข้อมูลสมมติ
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/40 rounded-2xl p-6 text-center transition-colors">
              <input
                type="file"
                id="pdf-file-upload-input"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="pdf-file-upload-input"
                className="flex flex-col items-center justify-center cursor-pointer space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  {isUploading ? (
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText className="w-6 h-6" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    {isUploading ? 'กำลังอ่านและถอดรหัสข้อสอบจาก PDF...' : 'คลิกเพื่อเลือกไฟล์ PDF หรือลากไฟล์มาวางที่นี่'}
                  </p>
                  <p className="text-xs text-slate-500">
                    รองรับไฟล์เอกสาร PDF (เช่น แนวข้อสอบ TPAT3 ธ.ค. 66.pdf)
                  </p>
                </div>
              </label>
            </div>

            {/* Upload Feedback Messages */}
            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}
            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Explorer / Quick Preview Toggle */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          id="toggle-preview-questions-btn"
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className="w-full flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>ดูโครงสร้างข้อสอบและตัวอย่างโจทย์ในชุด ({examData.questions.length} ข้อ)</span>
          </div>
          {isPreviewOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Collapsible Questions List */}
        <AnimatePresence>
          {isPreviewOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-4 space-y-4"
            >
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="ค้นหาข้อสอบ เนื้อหา หรือสูตร..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
                >
                  <option value="all">ทุกหมวดหมู่ ({examData.questions.length} ข้อ)</option>
                  <option value="เชิงกล">ความถนัดเชิงกล</option>
                  <option value="คำนวณ">การคิดเชิงคำนวณ</option>
                  <option value="มิติสัมพันธ์">มิติสัมพันธ์ & ภาพฉาย</option>
                  <option value="นวัตกรรม">นวัตกรรม & เทคโนโลยี</option>
                </select>
              </div>

              {/* Questions Stream */}
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                {filteredQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-blue-700">ข้อที่ {q.questionNumber || idx + 1}</span>
                      <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                        {q.topic}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-800 leading-relaxed">
                      <MathRenderer content={q.questionText} />
                    </div>

                    {q.diagramSvg && (
                      <div
                        className="p-2 bg-slate-50 border border-slate-100 rounded-xl my-2 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: q.diagramSvg }}
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl border ${
                            optIdx === q.correctOptionIndex
                              ? 'bg-emerald-50/70 border-emerald-200 font-semibold text-emerald-900'
                              : 'bg-slate-50 border-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="text-slate-400 mr-1.5">({optIdx + 1})</span>
                          <MathRenderer content={opt} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
