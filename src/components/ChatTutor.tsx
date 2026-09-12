import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  BookOpen,
  HelpCircle,
  BarChart2,
  Lightbulb,
  Image as ImageIcon,
  X,
  Loader2,
  GraduationCap,
  BrainCircuit,
  Zap,
  ArrowRight,
  RefreshCw,
  RotateCcw,
  MessageSquarePlus,
  AlertTriangle,
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';
import { ChatMessage, ExamCategory, UserProfile } from '../types';
import { StorageService } from '../lib/storage';
import { FirestoreService } from '../lib/firestoreService';
import { formatMathToSpeechText, formatHumanReadableText } from '../utils/examFormatter';

interface ChatTutorProps {
  user: UserProfile;
  onNavigateToGenerator?: (category: ExamCategory, subjectId: string) => void;
  onNavigateToAnalytics?: () => void;
}

export type TutorMode = 'socratic' | 'comprehensive' | 'quick_solution';

export const ChatTutor: React.FC<ChatTutorProps> = ({
  user,
  onNavigateToGenerator,
  onNavigateToAnalytics,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => StorageService.getChatMessages());
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [tutorMode, setTutorMode] = useState<TutorMode>('socratic');

  // Image upload attachment state
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    previewUrl: string;
    base64Data: string;
    mimeType: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Sync to local storage
  useEffect(() => {
    StorageService.saveChatMessages(messages);
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedImage({
        file,
        previewUrl: result,
        base64Data,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle TTS Text-to-Speech
  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('เบราว์เซอร์นี้ยังไม่รองรับระบบอ่านออกเสียง');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = formatMathToSpeechText(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'th-TH';
    utterance.rate = 1.05;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Handle Copy text
  const handleCopy = (id: string, text: string) => {
    const readable = formatHumanReadableText(text);
    navigator.clipboard.writeText(readable);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Internal API caller with single automatic retry
  const callChatApi = async (pastMessagesToSend: any[], currentImage?: any) => {
    const examHistory = StorageService.getExamHistory();
    const recentAttempts = examHistory.slice(0, 3).map((h) => ({
      subject: h.subject,
      title: h.title,
      score: h.score,
      totalQuestions: h.totalQuestions,
      percentage: h.percentage,
    }));

    const requestBody = {
      messages: pastMessagesToSend,
      tutorMode,
      gradeLevel: user.gradeLevel,
      userGoal: {
        name: user.name,
        gradeLevel: user.gradeLevel,
        dreamFaculty: user.dreamFaculty,
        dreamUniversity: user.dreamUniversity,
        targetExam: user.targetExam,
      },
      recentExamHistory: recentAttempts,
      image: currentImage
        ? {
            mimeType: currentImage.mimeType,
            data: currentImage.base64Data,
          }
        : undefined,
    };

    let response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    // Auto-retry once on 5xx or network hiccups
    if (!response.ok && response.status >= 500) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    }

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    return await response.json();
  };

  // Handle Send Message (Multi-turn with memory & error resilience)
  const handleSendMessage = async (textToSend?: string, isRetry = false) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if ((!query && !selectedImage) || isLoading) return;

    const currentImage = selectedImage;

    let updatedHistory = [...messages];

    // If this is a direct user message (not a retry of an existing message), add it
    if (!isRetry) {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query || (currentImage ? 'ช่วยวิเคราะห์และอธิบายโจทย์ในรูปภาพนี้อย่างละเอียดให้หน่อยครับ' : ''),
        timestamp: new Date().toISOString(),
      };
      updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setInputText('');
      setSelectedImage(null);

      FirestoreService.saveChatMessage(userMsg).catch((err) =>
        console.warn('Chat firestore save notice:', err)
      );
    } else {
      // If retrying, remove the previous error message if present
      updatedHistory = updatedHistory.filter((m) => !m.isError);
      setMessages(updatedHistory);
    }

    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      // Filter out any previous error messages when sending history to AI
      const cleanHistory = updatedHistory.filter((m) => !m.isError && m.content.trim().length > 0);
      const pastMessagesToSend = cleanHistory.slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const data = await callChatApi(pastMessagesToSend, currentImage);
      const replyText = data.reply || 'ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้';
      const suggestedQuestions = Array.isArray(data.suggestedQuestions)
        ? data.suggestedQuestions
        : [];

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: replyText,
        suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : undefined,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev.filter((m) => !m.isError), modelMsg]);
      FirestoreService.saveChatMessage(modelMsg).catch((err) =>
        console.warn('Chat firestore save notice:', err)
      );
    } catch (error: any) {
      console.error('Failed to get chat response:', error);
      const errorMsg: ChatMessage = {
        id: `model-err-${Date.now()}`,
        role: 'model',
        content: `⚠️ ระบบ AI ขัดข้องชั่วคราว กรุณาลองส่งข้อความอีกครั้ง (${error.message || 'Network error'})`,
        isError: true,
        retryPrompt: query,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Retry a failed turn
  const handleRetryFailed = (failedMsg: ChatMessage) => {
    if (isLoading) return;
    const promptToRetry = failedMsg.retryPrompt || '';
    handleSendMessage(promptToRetry, true);
  };

  // Handle Start New Conversation (Instant Reset without blocking iframe window.confirm)
  const handleClearChat = () => {
    const resetMsg: ChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'model',
      content: `สวัสดีครับคุณ **${user.name || 'เพื่อนนักเรียน'}**! 🚀 ผมคือ **AI Study Buddy** ผู้ช่วยติวและเรียนรู้ส่วนตัวของคุณ\n\nพร้อมช่วยเหลือทั้งการติวเนื้อหา สรุปบทเรียน ช่วยแนะแนววิธีคิดโจทย์ทีละขั้นตอน หรือวิเคราะห์จุดที่ยังสงสัย ถามต่อเนื่องได้เลยครับ!`,
      timestamp: new Date().toISOString(),
      suggestedQuestions: [
        'ช่วยสอนตรีโกณมิติพื้นฐานหน่อย',
        'ฟิสิกส์เรื่องการเคลื่อนที่แนวตรงใช้สูตรอะไรบ้าง?',
        'แนะนำเทคนิคจำศัพท์ภาษาอังกฤษ TGAT1',
        'ช่วยติวเรื่องสมดุลเคมีทีละสเต็ป',
      ],
    };
    setMessages([resetMsg]);
    setInputText('');
    setSelectedImage(null);
    StorageService.saveChatMessages([resetMsg]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-4 animate-in fade-in duration-300 font-sans">
      {/* 1. TOP HEADER CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Blue Vertical Accent Pill */}
          <div className="w-1.5 h-8 bg-blue-600 rounded-full shrink-0" />

          {/* Blue Square Bot Icon */}
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-5 h-5" />
          </div>

          {/* Text Title & Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                AI Study Buddy (ติวเตอร์ส่วนตัวอัจฉริยะ)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                จดจำบริบทต่อเนื่อง
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              ติวเตอร์ระดับชั้น {user.gradeLevel || 'มัธยมศึกษา'} • ถาม-ตอบต่อเนื่องได้ ไม่ต้องพิมพ์โจทย์ซ้ำ
            </p>
          </div>
        </div>

        {/* Right side: Tutor Mode Selector & New Chat Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* Tutor Mode Switcher */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setTutorMode('socratic')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                tutorMode === 'socratic'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="โหมดชวนคิด: อธิบายทีละสเต็ป ไม่เฉลยทันที ถามตรวจความเข้าใจ"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>โหมดชวนคิด</span>
            </button>

            <button
              onClick={() => setTutorMode('comprehensive')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                tutorMode === 'comprehensive'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="โหมดละเอียด: สรุปเนื้อหาพร้อมสูตรและตัวอย่าง"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>อธิบายละเอียด</span>
            </button>

            <button
              onClick={() => setTutorMode('quick_solution')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                tutorMode === 'quick_solution'
                  ? 'bg-white text-blue-600 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="โหมดเฉลยไว: คำตอบตรงจุดและวิธีลัด"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>เฉลยไว</span>
            </button>
          </div>

          {/* Start New Conversation Button */}
          <button
            id="btn-clear-chat"
            onClick={handleClearChat}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 border border-slate-200/80 px-2.5 py-1.5 rounded-xl transition-all font-semibold cursor-pointer shadow-2xs select-none"
            title="เริ่มบทสนทนาใหม่ (รีเซ็ตห้องแชต)"
          >
            <MessageSquarePlus className="w-3.5 h-3.5 text-blue-600" />
            <span>เริ่มแชตใหม่</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CHAT WINDOW */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 sm:p-6 min-h-[480px] sm:min-h-[520px] flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6 flex-1">
          {messages.map((msg, msgIdx) => {
            const isUser = msg.role === 'user';
            const isErrorMsg = msg.isError;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : ''}`}
              >
                {/* Bot Icon on Left for AI responses */}
                {!isUser && (
                  <div
                    className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${
                      isErrorMsg
                        ? 'bg-amber-600'
                        : 'bg-gradient-to-tr from-blue-700 to-indigo-600'
                    }`}
                  >
                    {isErrorMsg ? <AlertTriangle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                )}

                {/* Message Bubble Body */}
                <div className={`max-w-[92%] sm:max-w-[82%] space-y-2 ${isUser ? 'text-right' : ''}`}>
                  <div
                    className={`p-4 sm:p-5 rounded-2xl leading-relaxed text-xs sm:text-sm text-left ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-xs font-normal'
                        : isErrorMsg
                        ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-none shadow-2xs'
                        : 'bg-slate-50/95 border border-slate-100 text-slate-800 shadow-2xs rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <div className="text-white whitespace-pre-wrap break-words">
                        <MathRenderer content={msg.content} className="text-white" />
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-inherit break-words">
                        <MathRenderer content={msg.content} />
                      </div>
                    )}

                    {/* Retry Button inside error bubble */}
                    {isErrorMsg && (
                      <div className="mt-3 pt-2 border-t border-amber-200/80 flex items-center gap-3">
                        <button
                          onClick={() => handleRetryFailed(msg)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>ลองใหม่อีกครั้ง (Retry)</span>
                        </button>
                        <span className="text-[11px] text-amber-700">ข้อความเดิมของคุณยังคงอยู่ครบ</span>
                      </div>
                    )}

                    {/* Time Stamp */}
                    {msg.timestamp && (
                      <div
                        className={`text-[10px] mt-2 text-right font-medium ${
                          isUser ? 'text-blue-100' : isErrorMsg ? 'text-amber-600/70' : 'text-slate-400'
                        }`}
                      >
                        {formatMessageTime(msg.timestamp)}
                      </div>
                    )}
                  </div>

                  {/* Actions for regular AI answers: Read Aloud & Copy */}
                  {!isUser && !isErrorMsg && (
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex items-center gap-2 pl-1">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                            speakingId === msg.id
                              ? 'bg-blue-100 border-blue-300 text-blue-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3 h-3 text-rose-500" />
                              <span>หยุดอ่าน</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-slate-400" />
                              <span>ฟังเสียง</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-400" />
                              <span>คัดลอก</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Interactive Suggested Follow-up Questions (Chips for Next Multi-turn) */}
                      {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && msgIdx === messages.length - 1 && (
                        <div className="mt-1 space-y-1.5">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold pl-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>ถามต่อเนื่องจากเรื่องนี้:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestedQuestions.map((sq, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSendMessage(sq)}
                                disabled={isLoading}
                                className="group inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50/70 hover:bg-blue-100/90 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-medium transition-all shadow-2xs hover:scale-[1.01] cursor-pointer text-left active:scale-95"
                              >
                                <span className="text-blue-500 font-bold">↳</span>
                                <span>{sq}</span>
                                <ArrowRight className="w-3 h-3 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar on Right */}
                {isUser && (
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                    {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Thinking / Loading indicator with Staggered Bouncing Dots */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-50/95 border border-slate-100 rounded-2xl rounded-tl-none p-4 text-xs text-slate-600 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 font-medium text-blue-600">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: dot * 0.15,
                          ease: 'easeInOut',
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block"
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-700">AI Tutor กำลังคิดและเรียบเรียงคำอธิบายทีละขั้นตอน...</span>
                </div>
                <div className="space-y-1.5 w-48 sm:w-64">
                  <div className="h-2 bg-slate-200/80 rounded-full animate-pulse" />
                  <div className="h-2 bg-slate-200/80 rounded-full animate-pulse w-4/5" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 3. PROMPT QUICK STARTERS BAR with Interactive Motion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold shrink-0 pl-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          <span>หัวข้อยอดนิยม:</span>
        </div>

        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSendMessage('ช่วยสอนตรีโกณมิติพื้นฐานหน่อย')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/80 rounded-xl text-xs text-slate-600 font-medium transition-all shadow-2xs shrink-0 cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>ตรีโกณมิติพื้นฐาน</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSendMessage('ฟิสิกส์เรื่องแรงและการเคลื่อนที่ กฎของนิวตัน')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/80 rounded-xl text-xs text-slate-600 font-medium transition-all shadow-2xs shrink-0 cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>กฎการเคลื่อนที่นิวตัน</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSendMessage('เทคนิคทำข้อสอบ Grammar ภาษาอังกฤษ TGAT1')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/80 rounded-xl text-xs text-slate-600 font-medium transition-all shadow-2xs shrink-0 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-sky-500" />
          <span>Grammar TGAT1</span>
        </motion.button>

        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => handleSendMessage('ช่วยสรุปสูตรเคมีเรื่องปริมาณสารสัมพันธ์')}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-200/80 rounded-xl text-xs text-slate-600 font-medium transition-all shadow-2xs shrink-0 cursor-pointer"
        >
          <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>สูตรปริมาณสารสัมพันธ์</span>
        </motion.button>
      </div>

      {/* 4. CHAT INPUT BAR WITH ENTER TO SEND & SHIFT+ENTER MULTILINE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 sm:p-2.5 px-3 sm:px-4 flex items-end gap-3 shadow-xs">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />

        {/* Image Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors shrink-0 mb-0.5"
          title="อัปโหลดรูปภาพโจทย์ปัญหา"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Image Preview Chip if Attached */}
        {selectedImage && (
          <div className="relative shrink-0 flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-xl p-1 pr-2 mb-0.5">
            <img
              src={selectedImage.previewUrl}
              alt="attachment preview"
              className="w-7 h-7 rounded-lg object-cover"
            />
            <span className="text-[11px] text-blue-700 font-medium max-w-[90px] truncate">
              {selectedImage.file.name}
            </span>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-0.5 hover:bg-blue-200 rounded-full text-blue-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Multiline Textarea with Enter/Shift+Enter handler */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isLoading}
          placeholder="พิมพ์คำถาม หรือตอบคำถามติวเตอร์... (Enter เพื่อส่ง, Shift + Enter เพื่อขึ้นบรรทัดใหม่)"
          className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none py-2 max-h-32"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={isLoading || (!inputText.trim() && !selectedImage)}
          aria-label="ส่งข้อความ"
          className={`p-2 sm:p-2.5 rounded-xl transition-all shrink-0 mb-0.5 ${
            inputText.trim() || selectedImage
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs cursor-pointer active:scale-95'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Helper text under input */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
        <span>💡 AI จำบริบทเดิมได้ สามารถถามต่อได้ทันที เช่น "แล้วข้อ 2 ล่ะ?", "ทำไมถึงได้คำตอบนี้?"</span>
        <span className="hidden sm:inline">กด Enter เพื่อส่ง | Shift+Enter เพื่อขึ้นบรรทัดใหม่</span>
      </div>
    </div>
  );
};

