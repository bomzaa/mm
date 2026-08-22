import React from 'react';
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  BarChart2,
  History,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Brain,
  Lightbulb,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface UserGuideViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({ onNavigate }) => {
  const guideSteps = [
    {
      step: 1,
      title: '1. สนทนาและปรึกษาติวเตอร์ AI (Chatbot)',
      description:
        'ถามข้อสงสัยในบทเรียน อธิบายโจทย์ยากๆ ขอเทคนิคการจำสูตร หรือสรุปเนื้อหาสำคัญสำหรับ TGAT, TPAT และ A-Level ได้ตลอด 24 ชม.',
      icon: MessageSquare,
      color: 'bg-blue-500 text-white',
      actionTab: 'chatbot' as NavTab,
      actionText: 'เริ่มคุยกับ AI',
    },
    {
      step: 2,
      title: '2. สร้างข้อสอบจำลองด้วย AI (สร้างข้อสอบด้วย AI)',
      description:
        'ระบุวิชา หัวข้อ หรือระดับความยากที่ต้องการฝึกฝน AI จะสร้างชุดข้อสอบ CBT พร้อมตัวจับเวลา และระบบตรวจเฉลยละเอียดอัตโนมัติ',
      icon: Sparkles,
      color: 'bg-indigo-500 text-white',
      actionTab: 'generator' as NavTab,
      actionText: 'สร้างข้อสอบทันที',
    },
    {
      step: 3,
      title: '3. ติดตามความพร้อมสอบ (Dashboard)',
      description:
        'ประเมินคะแนนเฉลี่ย จุดแข็ง จุดที่ต้องพัฒนา และรับแผนการติวรายสัปดาห์ (Weekly Study Plan) ที่คำนวณตามคณะเป้าหมายของคุณ',
      icon: BarChart2,
      color: 'bg-emerald-500 text-white',
      actionTab: 'dashboard' as NavTab,
      actionText: 'ดูแดชบอร์ด',
    },
    {
      step: 4,
      title: '4. ทบทวนข้อสอบย้อนหลัง (ประวัติข้อสอบ)',
      description:
        'ดูบันทึกข้อสอบที่เคยทำย้อนหลัง วิเคราะห์ข้อที่ตอบผิด หรือกด "ถาม AI เพิ่มเติม" เพื่อให้ติวเตอร์ช่วยอธิบายวิธีคิดข้อนั้นๆ',
      icon: History,
      color: 'bg-amber-500 text-white',
      actionTab: 'history' as NavTab,
      actionText: 'ดูประวัติข้อสอบ',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-blue-600/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            คู่มือการใช้งาน
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black">
          วิธีการใช้งาน AI Study Buddy
        </h2>
        <p className="text-blue-100 text-sm mt-1 leading-relaxed max-w-2xl">
          ระบบช่วยเตรียมสอบและวางแผนการเรียนอัจฉริยะสำหรับนักเรียนมัธยมและผู้เตรียมสอบ TCAS
        </p>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {guideSteps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {item.title}
                  </h3>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => onNavigate(item.actionTab)}
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors cursor-pointer w-fit"
              >
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Pro Tips Box */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-6 text-amber-900">
        <div className="flex items-center gap-2 mb-2 font-bold text-base">
          <Lightbulb className="w-5 h-5 text-amber-600 fill-amber-500" />
          <span>เคล็ดลับการเตรียมสอบให้ได้คะแนนสูงสุด</span>
        </div>
        <ul className="space-y-2 text-xs text-amber-800 leading-relaxed list-disc list-inside">
          <li>กำหนดคณะและมหาวิทยาลัยในฝันในหน้า <strong>โปรไฟล์</strong> เพื่อให้ระบบคำนวณเป้าหมายคะแนนที่แม่นยำ</li>
          <li>ทำโจทย์อย่างน้อยวันละ 10-15 ข้อ เพื่อรักษา <strong>Streak</strong> การติวอย่างสม่ำเสมอ</li>
          <li>หากทำข้อสอบเสร็จแล้วข้อไหนสงสัย ให้กดปุ่ม <strong>"ถาม AI ข้อนี้"</strong> ในหน้าประวัติเพื่อดูคำอธิบายเสริม</li>
        </ul>
      </div>
    </div>
  );
};
