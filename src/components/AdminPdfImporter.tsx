import React, { useState, useRef } from 'react';
import {
  FileUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Save,
  RotateCcw,
  Eye,
  Edit3,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ExamData, Question, ExamStatus } from '../types';
import { PdfExamParserService, ParseProgress } from '../lib/pdfExamParser';
import { FirestoreService } from '../lib/firestoreService';

interface AdminPdfImporterProps {
  onExamSaved?: (exam: ExamData) => void;
  onCancel?: () => void;
}

export const AdminPdfImporter: React.FC<AdminPdfImporterProps> = ({
  onExamSaved,
  onCancel,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsingProgress, setParsingProgress] = useState<ParseProgress | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedExam, setParsedExam] = useState<ExamData | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'all' | 'diagrams' | 'needsReview' | 'part1' | 'part2'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // การเริ่มประมวลผลไฟล์ตัวอย่าง "แนวข้อสอบ TPAT3 ธ.ค. 66.pdf"
  const handleLoadSampleTpat3 = async () => {
    setIsProcessing(true);
    setSaveStatus('idle');
    try {
      const result = await PdfExamParserService.loadSampleTpat3Exam((progress) => {
        setParsingProgress(progress);
      });
      setParsedExam(result.exam);
      setSelectedQuestionIndex(0);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการโหลดข้อสอบตัวอย่าง');
    } finally {
      setIsProcessing(false);
    }
  };

  // การอัปโหลดไฟล์ PDF ของ Admin
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'application/pdf' && !uploadedFile.name.endsWith('.pdf')) {
      alert('กรุณาเลือกไฟล์เอกสารนามสกุล .pdf เท่านั้น');
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);
    setSaveStatus('idle');

    try {
      const result = await PdfExamParserService.parsePdfFile(uploadedFile, (progress) => {
        setParsingProgress(progress);
      });
      setParsedExam(result.exam);
      setSelectedQuestionIndex(0);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการอ่านไฟล์ PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  // แก้ไขคำถามที่กำลังเลือกอยู่
  const handleUpdateCurrentQuestion = (updates: Partial<Question>) => {
    if (!parsedExam) return;
    const updatedQuestions = [...parsedExam.questions];
    updatedQuestions[selectedQuestionIndex] = {
      ...updatedQuestions[selectedQuestionIndex],
      ...updates,
    };

    setParsedExam({
      ...parsedExam,
      questions: updatedQuestions,
      updatedAt: new Date().toISOString(),
    });
  };

  // อัปเดตตัวเลือกข้อสอบ
  const handleUpdateOption = (optIndex: number, newText: string) => {
    if (!parsedExam) return;
    const currentQ = parsedExam.questions[selectedQuestionIndex];
    const newOptions = [...currentQ.options];
    newOptions[optIndex] = newText;
    handleUpdateCurrentQuestion({ options: newOptions });
  };

  // บันทึกลง Firestore
  const handleSaveToFirestore = async (newStatus: ExamStatus = 'พร้อมใช้งาน') => {
    if (!parsedExam) return;

    setSaveStatus('saving');
    setSaveMessage('กำลังบันทึกข้อมูลข้อสอบลง Firestore...');

    try {
      const examToSave: ExamData = {
        ...parsedExam,
        status: newStatus,
        reviewedBy: 'Admin',
        updatedAt: new Date().toISOString(),
      };

      await FirestoreService.saveExamPreparationSet(examToSave);

      setSaveStatus('saved');
      setSaveMessage(`บันทึกชุดข้อสอบ "${examToSave.title}" เรียบร้อยแล้ว (สถานะ: ${newStatus})`);

      if (onExamSaved) {
        onExamSaved(examToSave);
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus('error');
      setSaveMessage('เกิดข้อผิดพลาดในการบันทึกลงฐานข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
  };

  // กรองคำถามตามหมวดหมู่
  const filteredQuestions = (parsedExam?.questions || []).filter((q, idx) => {
    if (filterMode === 'diagrams' && !q.hasDiagram && !q.diagramSvg) return false;
    if (filterMode === 'needsReview' && !q.needsReview) return false;
    if (filterMode === 'part1' && (q.questionNumber > 45 || idx > 44)) return false;
    if (filterMode === 'part2' && (q.questionNumber <= 45 && idx <= 44)) return false;

    if (searchQuery.trim()) {
      const qText = q.questionText.toLowerCase();
      const numMatch = q.questionNumber.toString().includes(searchQuery.trim());
      const textMatch = qText.includes(searchQuery.toLowerCase());
      return numMatch || textMatch;
    }

    return true;
  });

  const currentQ = parsedExam?.questions[selectedQuestionIndex];

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* ส่วนหัว Header */}
      <div className="border-b border-slate-800 bg-slate-950/60 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              PDF Source of Truth (ไม่ผ่าน AI)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileUp className="w-6 h-6 text-blue-400" />
            ระบบนำเข้าข้อสอบจากไฟล์ PDF (ข้อสอบเตรียมสอบ)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            นำเข้าไฟล์ข้อสอบจริงจาก PDF ถอดข้อความ ตัวเลือก แผนภาพ ตาราง และเลขหน้าต้นฉบับอย่างสมบูรณ์ เพื่อเก็บในระบบ
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          )}
          {parsedExam && (
            <button
              onClick={() => handleSaveToFirestore('พร้อมใช้งาน')}
              disabled={saveStatus === 'saving'}
              className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saveStatus === 'saving' ? 'กำลังบันทึก...' : 'บันทึก & เผยแพร่ข้อสอบ'}
            </button>
          )}
        </div>
      </div>

      {/* กล่องแจ้งเตือนผลการบันทึก */}
      {saveStatus === 'saved' && (
        <div className="bg-emerald-950/60 border-b border-emerald-800/50 p-4 px-6 flex items-center justify-between text-emerald-300 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{saveMessage}</span>
          </div>
          <span className="text-xs text-emerald-400/80 bg-emerald-900/40 px-3 py-1 rounded-lg border border-emerald-700/40">
            Firestore: exams/exam_preparation/items/{parsedExam?.id}
          </span>
        </div>
      )}

      {/* ถ้ายังไม่ได้โหลดข้อสอบ หรือต้องการอัปโหลดไฟล์ใหม่ */}
      {!parsedExam && (
        <div className="p-8 max-w-3xl mx-auto text-center space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-10 cursor-pointer bg-slate-800/30 hover:bg-slate-800/60 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,application/pdf"
              className="hidden"
            />
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileUp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">
              ลากและวางไฟล์ข้อสอบ PDF ที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </h3>
            <p className="text-sm text-slate-400">
              รองรับไฟล์ PDF ข้อสอบจริง (ระบบจะตรวจจับข้อความ ตัวเลือก แผนภาพ และเลขหน้า)
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-4 text-slate-500 font-medium">หรือทดสอบด้วยไฟล์ตัวอย่าง</span>
            </div>
          </div>

          {/* Quick button: TPAT3 Dec 66 */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white">แนวข้อสอบ TPAT3 ธ.ค. 66.pdf</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  ไฟล์ตัวอย่าง 45 หน้า รวม 70 ข้อครบถ้วน (ตัวเลข, มิติสัมพันธ์, เชิงกล/ฟิสิกส์, ข่าวสารวิทยาศาสตร์)
                </p>
              </div>
            </div>
            <button
              onClick={handleLoadSampleTpat3}
              disabled={isProcessing}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              {isProcessing ? 'กำลังอ่านไฟล์ PDF...' : 'โหลดข้อมูลจากไฟล์นี้'}
            </button>
          </div>

          {/* Loading Progress Bar */}
          {isProcessing && parsingProgress && (
            <div className="bg-slate-800/80 border border-blue-500/30 rounded-xl p-5 text-left space-y-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="font-medium text-blue-400">{parsingProgress.message}</span>
                <span>{parsingProgress.percent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${parsingProgress.percent}%` }}
                ></div>
              </div>
              <div className="text-[11px] text-slate-400 text-center">
                หน้า {parsingProgress.currentPage} จาก {parsingProgress.totalPages} หน้า
              </div>
            </div>
          )}
        </div>
      )}

      {/* หน้าจอตรวจสอบและแก้ไขข้อสอบที่ดึงมาจาก PDF (Admin Review & Edit Workspace) */}
      {parsedExam && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* แถบด้านซ้าย: รายการข้อสอบทั้งหมด (70 ข้อ) */}
          <div className="lg:col-span-4 border-r border-slate-800 bg-slate-950/40 p-4 flex flex-col h-full max-h-[800px]">
            {/* กล่องสรุปสถิติ */}
            <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl mb-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">ไฟล์ต้นฉบับ:</span>
                <span className="text-xs text-blue-400 truncate max-w-[180px]" title={parsedExam.sourceFile}>
                  {parsedExam.sourceFile || 'PDF Uploaded'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800/80">
                <div className="bg-slate-800/50 p-1.5 rounded-lg">
                  <div className="text-base font-bold text-white">{parsedExam.questions.length}</div>
                  <div className="text-[10px] text-slate-400">ข้อสอบทั้งหมด</div>
                </div>
                <div className="bg-slate-800/50 p-1.5 rounded-lg">
                  <div className="text-base font-bold text-sky-400">
                    {parsedExam.questions.filter((q) => q.hasDiagram || !!q.diagramSvg).length}
                  </div>
                  <div className="text-[10px] text-slate-400">มีรูปภาพ/แปลน</div>
                </div>
                <div className="bg-slate-800/50 p-1.5 rounded-lg">
                  <div className="text-base font-bold text-amber-400">
                    {parsedExam.questions.filter((q) => q.needsReview).length}
                  </div>
                  <div className="text-[10px] text-slate-400">ต้องตรวจทาน</div>
                </div>
              </div>
            </div>

            {/* ช่องค้นหา & ตัวกรอง */}
            <div className="space-y-2 mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="ค้นหาข้อสอบ หรือเลขข้อ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* แท็บกรอง */}
              <div className="flex flex-wrap gap-1">
                {[
                  { key: 'all', label: `ทั้งหมด (${parsedExam.questions.length})` },
                  { key: 'part1', label: 'ตอนที่ 1 (1-45)' },
                  { key: 'part2', label: 'ตอนที่ 2 (46-70)' },
                  { key: 'diagrams', label: 'มีรูป' },
                  { key: 'needsReview', label: 'ต้องตรวจ' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterMode(tab.key as any)}
                    className={`text-[11px] px-2 py-1 rounded-md transition-colors ${
                      filterMode === tab.key
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* รายการข้อสอบ (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {filteredQuestions.map((q) => {
                const originalIndex = parsedExam.questions.findIndex((item) => item.id === q.id);
                const isSelected = originalIndex === selectedQuestionIndex;

                return (
                  <button
                    key={q.id || `q-${q.questionNumber}`}
                    onClick={() => setSelectedQuestionIndex(originalIndex)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/50 text-white'
                        : 'bg-slate-900/40 border-slate-800/60 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 shrink-0 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {q.questionNumber}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                          หน้า {q.sourcePage || (q.sourcePages ? q.sourcePages.join(', ') : '-')}
                        </span>
                        {q.hasDiagram || !!q.diagramSvg ? (
                          <span className="text-[10px] text-sky-400 flex items-center gap-0.5">
                            <ImageIcon className="w-3 h-3" />
                            รูป
                          </span>
                        ) : null}
                        {q.needsReview && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            ตรวจทาน
                          </span>
                        )}
                      </div>
                      <p className="text-xs line-clamp-1 text-slate-300">
                        {q.questionText}
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 mt-1 ${isSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>

            {/* ปุ่มเปลี่ยนไฟล์ */}
            <div className="pt-3 border-t border-slate-800/80 mt-2">
              <button
                onClick={() => setParsedExam(null)}
                className="w-full py-2 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                นำเข้าไฟล์ PDF อื่น
              </button>
            </div>
          </div>

          {/* แถบด้านขวา: หน้าจอตรวจสอบและแก้ไขข้อคำถามปัจจุบัน (Question Inspector) */}
          <div className="lg:col-span-8 p-6 flex flex-col h-full max-h-[800px] overflow-y-auto">
            {currentQ ? (
              <div className="space-y-6">
                {/* แถบระบุสถานะของข้อ */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white bg-blue-500/20 text-blue-400 px-3 py-1 rounded-xl border border-blue-500/30">
                      ข้อที่ {currentQ.questionNumber}
                    </span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                      แหล่งที่มา: หน้า {currentQ.sourcePage} จาก 45 หน้า
                    </span>
                    {currentQ.hasDiagram && (
                      <span className="text-xs font-medium text-sky-400 bg-sky-950/60 border border-sky-800/50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5" />
                        มีแผนภาพ / กราฟ
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg">
                      <input
                        type="checkbox"
                        checked={!!currentQ.needsReview}
                        onChange={(e) => handleUpdateCurrentQuestion({ needsReview: e.target.checked })}
                        className="rounded border-amber-600 text-amber-500 focus:ring-amber-500"
                      />
                      <span>ต้องการการตรวจทานเพิ่มเติม</span>
                    </label>
                  </div>
                </div>

                {/* ข้อความคำถาม (Question Text Editor) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      ข้อความโจทย์ (รักษาตาม PDF ต้นฉบับ):
                    </label>
                    <span className="text-[11px] text-slate-500">รองรับสูตรคณิตศาสตร์ LaTeX (เช่น $m=10^4$)</span>
                  </div>
                  <textarea
                    rows={4}
                    value={currentQ.questionText}
                    onChange={(e) => handleUpdateCurrentQuestion({ questionText: e.target.value })}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl text-sm text-white font-mono placeholder-slate-600 focus:outline-none"
                    placeholder="พิมพ์หรือแก้ไขข้อความโจทย์..."
                  />
                </div>

                {/* แสดงรูปภาพ / แผนภาพ SVG ที่ถอดจาก PDF */}
                {(currentQ.hasDiagram || currentQ.diagramSvg || currentQ.diagramUrl) && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                      แผนภาพ / กราฟประกอบโจทย์จากหน้า {currentQ.sourcePage}:
                    </label>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-center min-h-[120px]">
                      {currentQ.diagramSvg ? (
                        <div
                          className="max-w-md w-full"
                          dangerouslySetInnerHTML={{ __html: currentQ.diagramSvg }}
                        />
                      ) : currentQ.diagramUrl ? (
                        <img
                          src={currentQ.diagramUrl}
                          alt={`รูปประกอบข้อ ${currentQ.questionNumber}`}
                          className="max-h-48 rounded-lg object-contain"
                        />
                      ) : (
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4" />
                          มีรูปภาพในหน้า PDF ต้นฉบับ (หน้า {currentQ.sourcePage})
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ตัวเลือกทั้ง 5 ข้อ (Options 1-5) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      ตัวเลือกคำตอบ (คลิกปุ่มกลมด้านหน้าเพื่อเลือกเฉลยที่ถูกต้อง):
                    </label>
                    <button
                      onClick={() => handleUpdateCurrentQuestion({ correctOptionIndex: null })}
                      className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                        currentQ.correctOptionIndex === null
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'text-slate-500 hover:text-slate-400'
                      }`}
                    >
                      ไม่มีเฉลยในต้นฉบับ (ห้าม AI เดา)
                    </button>
                  </div>

                  <div className="space-y-2">
                    {currentQ.options.map((opt, optIdx) => {
                      const isCorrect = currentQ.correctOptionIndex === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                            isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/50'
                              : 'bg-slate-950/60 border-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${currentQ.questionNumber}`}
                            checked={isCorrect}
                            onChange={() => handleUpdateCurrentQuestion({ correctOptionIndex: optIdx })}
                            className="w-4 h-4 text-emerald-500 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="w-5 text-xs font-bold text-slate-400 text-center">
                            {optIdx + 1}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                            className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none"
                            placeholder={`ข้อความตัวเลือกที่ ${optIdx + 1}`}
                          />
                          {isCorrect && (
                            <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-700/40">
                              คำตอบที่ถูกต้อง
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* คำอธิบายเฉลยและวิธีคิด */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                    คำอธิบายเฉลย / วิธีทำ:
                  </label>
                  <textarea
                    rows={3}
                    value={currentQ.explanation || ''}
                    onChange={(e) => handleUpdateCurrentQuestion({ explanation: e.target.value })}
                    className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-sm text-slate-300 placeholder-slate-600 focus:outline-none"
                    placeholder="พิมพ์คำอธิบายหรือวิธีทำ..."
                  />
                </div>

                {/* ปุ่มนำทางข้อก่อนหน้า / ถัดไป */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    disabled={selectedQuestionIndex === 0}
                    onClick={() => setSelectedQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl transition-colors"
                  >
                    ← ข้อก่อนหน้า
                  </button>

                  <span className="text-xs text-slate-500">
                    ข้อ {selectedQuestionIndex + 1} จาก {parsedExam.questions.length}
                  </span>

                  <button
                    disabled={selectedQuestionIndex === parsedExam.questions.length - 1}
                    onClick={() =>
                      setSelectedQuestionIndex((prev) =>
                        Math.min(parsedExam.questions.length - 1, prev + 1)
                      )
                    }
                    className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl transition-colors"
                  >
                    ข้อถัดไป →
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                เลือกข้อสอบจากแถบด้านซ้ายเพื่อเริ่มตรวจสอบ
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
