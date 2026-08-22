import React, { useState } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Target,
  Flame,
  Save,
  Check,
  Award,
  BookOpen,
} from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../lib/storage';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateProfile,
  onLogout,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [gradeLevel, setGradeLevel] = useState(user.gradeLevel);
  const [dreamFaculty, setDreamFaculty] = useState(user.dreamFaculty);
  const [dreamUniversity, setDreamUniversity] = useState(user.dreamUniversity);
  const [targetScoreTGAT, setTargetScoreTGAT] = useState(user.targetScoreTGAT || 80);
  const [targetScoreTPAT, setTargetScoreTPAT] = useState(user.targetScoreTPAT || 75);
  const [targetScoreALevel, setTargetScoreALevel] = useState(user.targetScoreALevel || 70);
  const [dailyGoalQuestions, setDailyGoalQuestions] = useState(user.dailyGoalQuestions || 15);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: name.trim(),
      email: email.trim(),
      gradeLevel,
      dreamFaculty: dreamFaculty.trim(),
      dreamUniversity: dreamUniversity.trim(),
      targetScoreTGAT: Number(targetScoreTGAT),
      targetScoreTPAT: Number(targetScoreTPAT),
      targetScoreALevel: Number(targetScoreALevel),
      dailyGoalQuestions: Number(dailyGoalQuestions),
    };

    onUpdateProfile(updated);
    StorageService.saveProfile(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 overflow-hidden border-2 border-white/40 shadow-md shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-white">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black">{user.name}</h2>
            <p className="text-indigo-200 text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                <span>Streak {user.streakDays || 1} วัน</span>
              </span>
              <span className="text-[11px] font-medium text-indigo-100 px-2.5 py-0.5 rounded-full bg-white/10">
                {user.gradeLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Section 1: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600" />
            <span>ข้อมูลทั่วไปของผู้เรียน</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อที่ต้องการให้ AI เรียก (Display Name)
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                อีเมล Gmail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ระดับชั้นปัจจุบัน
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="มัธยมศึกษาปีที่ 4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
              <option value="มัธยมศึกษาปีที่ 5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
              <option value="มัธยมศึกษาปีที่ 6">มัธยมศึกษาปีที่ 6 (ม.6 TCAS69)</option>
              <option value="เด็กซิ่ว / ซิ่วเตรียมสอบ">เด็กซิ่ว / ซิ่วเตรียมสอบ</option>
              <option value="บุคคลทั่วไป">บุคคลทั่วไป / เตรียมสอบครู/แพทย์</option>
            </select>
          </div>
        </div>

        {/* Section 2: Goals */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-600" />
            <span>เป้าหมายคณะและมหาวิทยาลัยในฝัน</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                คณะที่อยากเข้าศึกษา
              </label>
              <input
                type="text"
                value={dreamFaculty}
                onChange={(e) => setDreamFaculty(e.target.value)}
                placeholder="เช่น คณะแพทยศาสตร์, คณะวิศวกรรมศาสตร์, คณะบัญชี"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                มหาวิทยาลัยเป้าหมาย
              </label>
              <input
                type="text"
                value={dreamUniversity}
                onChange={(e) => setDreamUniversity(e.target.value)}
                placeholder="เช่น จุฬาลงกรณ์มหาวิทยาลัย, ม.เกษตรศาสตร์"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Target Scores */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>เป้าหมายคะแนนสอบ (เต็ม 100)</span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                TGAT เป้าหมาย
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={targetScoreTGAT}
                onChange={(e) => setTargetScoreTGAT(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                TPAT เป้าหมาย
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={targetScoreTPAT}
                onChange={(e) => setTargetScoreTPAT(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-center"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                A-Level เฉลี่ย
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={targetScoreALevel}
                onChange={(e) => setTargetScoreALevel(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-center"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>บันทึกข้อมูลแล้ว!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>บันทึกการเปลี่ยนแปลงโปรไฟล์</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
