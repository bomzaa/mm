import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Zap,
  Target,
  BrainCircuit,
  MessageSquare,
  BarChart2,
  ArrowRight,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ExamCategory, UserProfile } from '../types';
import { EXAM_SUBJECTS } from '../data/examCatalog';
import { StorageService } from '../lib/storage';
import { FirestoreService } from '../lib/firestoreService';

interface ChatTutorProps {
  user: UserProfile;
  onNavigateToGenerator?: (category: ExamCategory, subjectId: string) => void;
  onNavigateToAnalytics?: () => void;
}

export const ChatTutor: React.FC<ChatTutorProps> = ({
  user,
  onNavigateToGenerator,
  onNavigateToAnalytics,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => StorageService.getChatMessages());
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>('TGAT');
  const [selectedSubject, setSelectedSubject] = useState<string>('tgat1');
  const [mode, setMode] = useState<string>('ติวเตอร์เจาะลึก (Step-by-Step)');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredSubjects = EXAM_SUBJECTS.filter((s) => s.category === selectedCategory);
  const currentSubjectObj =
    EXAM_SUBJECTS.find((s) => s.id === selectedSubject) || filteredSubjects[0] || EXAM_SUBJECTS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    StorageService.saveChatMessages(messages);
  }, [messages]);

  // Handle TTS
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
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'th-TH';
    utterance.rate = 1.05;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
      category: selectedCategory,
      subject: currentSubjectObj?.name,
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsLoading(true);
    FirestoreService.saveChatMessage(userMsg).catch((err) =>
      console.warn('Chat firestore save notice:', err)
    );

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.slice(-10).map((m) => ({ role: m.role, content: m.content })),
          category: selectedCategory,
          subject: currentSubjectObj?.name,
          userGoal: {
            gradeLevel: user.gradeLevel,
            dreamFaculty: user.dreamFaculty,
            dreamUniversity: user.dreamUniversity,
          },
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || 'ขออภัย ไม่สามารถสร้างคำตอบได้';

      const defaultSuggestions = [
        `ขอโจทย์ฝึกทำเรื่องนี้ 1 ข้อ (${currentSubjectObj?.name || 'TGAT'})`,
        `สรุปเทคนิคจำและจุดหลอกบ่อยๆ`,
        `ข้อนี้ออกสอบบ่อยแค่ไหนใน TCAS?`,
      ];

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toISOString(),
        category: selectedCategory,
        subject: currentSubjectObj?.name,
        suggestedQuestions: defaultSuggestions,
      };

      setMessages((prev) => [...prev, modelMsg]);
      FirestoreService.saveChatMessage(modelMsg).catch((err) =>
        console.warn('Chat firestore save notice:', err)
      );
    } catch (error: any) {
      console.error('Failed to get chat response:', error);
      const errorMsg: ChatMessage = {
        id: `model-err-${Date.now()}`,
        role: 'model',
        content: `⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI Tutor (${error.message || 'โปรดลองอีกครั้ง'})\n\nคำแนะนำ: คุณสามารถลองกดส่งคำถามซ้ำ หรือเปลี่ยนหัวข้อคำถามใหม่ครับ`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('คุณต้องการล้างประวัติการสนทนานี้หรือไม่?')) {
      const resetMsg: ChatMessage[] = [
        {
          id: `welcome-${Date.now()}`,
          role: 'model',
          content: `เริ่มการสนทนาใหม่แล้วครับ! มีเรื่องไหนใน **${currentSubjectObj?.name || 'TGAT'}** ที่อยากให้ผมช่วยติวหรือยกตัวอย่างโจทย์ให้ดูไหมครับ?`,
          timestamp: new Date().toISOString(),
          suggestedQuestions: [
            'สรุปสูตรและจุดสำคัญที่ต้องจำ',
            'ขอโจทย์ตัวอย่างพร้อมวิธีคิดทีละสเต็ป',
            'เทคนิคตัดช้อยส์เมื่อเวลาจะหมด',
          ],
        },
      ];
      setMessages(resetMsg);
      StorageService.saveChatMessages(resetMsg);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6.5rem)] pb-2 overflow-hidden max-w-7xl mx-auto w-full">
      {/* Left Chat Window (8 Columns) */}
      <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-full">
        {/* Chat Header Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
          {/* Category & Subject Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
              {(['TGAT', 'TPAT', 'A-Level', 'O-NET'] as ExamCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    const firstSub = EXAM_SUBJECTS.find((s) => s.category === cat);
                    if (firstSub) setSelectedSubject(firstSub.id);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-2 focus:ring-indigo-500 max-w-[170px] truncate"
            >
              {filteredSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selector & Actions */}
          <div className="flex items-center gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="text-xs font-medium bg-white border border-slate-200 text-slate-700 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 hidden sm:block"
            >
              <option value="ติวเตอร์เจาะลึก (Step-by-Step)">🎯 ติวเตอร์เจาะลึก</option>
              <option value="สรุปสูตร & เทคนิคโกงเวลา">⚡ สรุปสูตรลัด</option>
              <option value="ฝึกทำโจทย์ & ตะลุยข้อสอบ">📝 ตะลุยข้อสอบ</option>
            </select>

            <button
              onClick={handleClearChat}
              title="ล้างการสนทนา"
              aria-label="ล้างการสนทนา"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : ''}`}
              >
                {/* Bot Icon */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className="max-w-[85%] sm:max-w-[80%] space-y-1.5">
                  <div
                    className={`p-4 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-xs font-normal'
                        : 'bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-700 shadow-2xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    ) : (
                      <div className="markdown-body prose prose-sm max-w-none text-slate-800">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Actions for AI answers */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                          speakingId === msg.id
                            ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-bold'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {speakingId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            <span>หยุด</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>ฟังเสียง</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>คัดลอก</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-slate-400 ml-auto">
                        {new Date(msg.timestamp).toLocaleTimeString('th-TH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}

                  {/* Follow-up question chips */}
                  {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="pt-2 space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        <span>ลองถามต่อ:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-xs text-left px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 transition-all font-medium cursor-pointer"
                          >
                            💬 {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs mt-0.5">
                    {user.name.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 text-slate-700 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <BrainCircuit className="w-4 h-4 animate-spin" />
                  <span>AI Tutor กำลังเรียบเรียงคำตอบ...</span>
                </div>
                <div className="space-y-1.5 w-48 sm:w-60">
                  <div className="h-2 bg-slate-200 rounded-full animate-pulse" />
                  <div className="h-2 bg-slate-200 rounded-full animate-pulse w-4/5" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">ด่วน:</span>
          <button
            onClick={() =>
              handleSendMessage(`ขอสรุปสูตรลัดและเทคนิคสำคัญของ ${currentSubjectObj?.name}`)
            }
            className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            ⚡ สรุปสูตรลัด
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                `ขอดูตัวอย่างโจทย์ข้อยากของ ${currentSubjectObj?.name} พร้อมวิธีตัดช้อยส์`
              )
            }
            className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            🎯 โจทย์ระดับยาก
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                `วิเคราะห์จุดที่เด็กนักเรียนมักทำผิดมากที่สุดใน ${currentSubjectObj?.name}`
              )
            }
            className="text-xs px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 transition-colors shrink-0 cursor-pointer"
          >
            ⚠️ จุดที่ชอบโดนหลอก
          </button>
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={`ถามคำถามหรือให้ติว ${currentSubjectObj?.name || 'TGAT'}...`}
              className="flex-1 bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Dashboard Column (4 Columns - Professional Polish Widgets) */}
      <div className="col-span-1 lg:col-span-4 space-y-5 overflow-y-auto pr-1 hidden lg:block">
        {/* Performance Quick Widget ("วิเคราะห์ล่าสุด") */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>วิเคราะห์ล่าสุด</span>
            </h3>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
              +12% จากสัปดาห์ก่อน
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>TGAT1 การสื่อสารอังกฤษ</span>
                <span className="text-emerald-600 font-bold">82%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>TGAT2 การคิดอย่างมีเหตุผล</span>
                <span className="text-indigo-600 font-bold">74%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '74%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>TPAT3 ความถนัดวิทยาศาสตร์</span>
                <span className="text-amber-600 font-bold">65%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>

          {onNavigateToAnalytics && (
            <button
              onClick={onNavigateToAnalytics}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>ดูรายงานฉบับเต็ม</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Mock Exam Banner ("สร้างข้อสอบด่วน") */}
        <div className="bg-linear-to-tr from-indigo-700 to-violet-600 p-5 rounded-2xl text-white relative overflow-hidden shadow-md shadow-indigo-600/20">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
            <Sparkles className="w-36 h-36" />
          </div>

          <div className="relative z-10 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-amber-300 text-[10px] font-bold">
              <Zap className="w-3 h-3 fill-amber-300" />
              <span>AI Exam Generator</span>
            </div>

            <h4 className="font-bold text-base leading-snug">
              สร้างข้อสอบจำลอง {currentSubjectObj.name}
            </h4>

            <p className="text-xs text-indigo-100 leading-relaxed">
              สุ่มโจทย์ 5 ข้อตาม Blueprint พร้อมจับเวลาและเฉลยละเอียดแบบ Step-by-Step
            </p>

            {onNavigateToGenerator && (
              <button
                onClick={() => onNavigateToGenerator(selectedCategory, selectedSubject)}
                className="mt-2 w-full py-2.5 bg-white hover:bg-slate-100 text-indigo-700 font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>เริ่มทำข้อสอบทันที</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Activity Log Widget ("ประวัติกิจกรรม") */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>ประวัติกิจกรรมล่าสุด</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">ทำข้อสอบ TGAT1 ผ่าน 80%</p>
                <p className="text-[10px] text-slate-400">วันนี้ 10:45 น.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">ถาม AI เรื่องสูตรฟิสิกส์</p>
                <p className="text-[10px] text-slate-400">เมื่อวาน 21:15 น.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-xs">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800">ทบทวนข้อสอบ TPAT3</p>
                <p className="text-[10px] text-slate-400">2 วันที่แล้ว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

