import React, { useState } from 'react';
import {
  User,
  Mail,
  GraduationCap,
  Target,
  Flame,
  Save,
  Check,
  X,
  Trash2,
  Award,
  Sparkles,
  School,
} from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../lib/storage';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
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

  if (!isOpen) return null;

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
      onClose();
    }, 600);
  };

  const handleClearHistory = () => {
    if (confirm('คำเตือน: คุณต้องการล้างประวัติการทำข้อสอบทั้งหมดใช่หรือไม่? (ไม่สามารถกู้คืนได้)')) {
      StorageService.clearAllData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        id="user-profile-modal"
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-800 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่างโปรไฟล์"
            className="absolute top-5 right-5 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/50 shadow-md"
            />
            <div>
              <h3 className="text-xl font-black">{user.name}</h3>
              <p className="text-indigo-200 text-xs flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Streak {user.streakDays || 1} วัน</span>
                </span>
                <span className="text-[11px] font-medium text-indigo-100">
                  {user.gradeLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-600" />
              <span>ข้อมูลทั่วไปและการเข้าสู่ระบบ</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อแสดงผล (Display Name)
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมล Gmail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
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

          {/* Section 2: Target Dream Faculty & University */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600" />
              <span>เป้าหมายคณะและมหาวิทยาลัยในฝัน</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คณะที่อยากเข้าศึกษา
                </label>
                <input
                  type="text"
                  value={dreamFaculty}
                  onChange={(e) => setDreamFaculty(e.target.value)}
                  placeholder="เช่น คณะแพทยศาสตร์, คณะวิศวกรรมศาสตร์, คณะบัญชี"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  มหาวิทยาลัยเป้าหมาย
                </label>
                <input
                  type="text"
                  value={dreamUniversity}
                  onChange={(e) => setDreamUniversity(e.target.value)}
                  placeholder="เช่น จุฬาฯ, มก., มธ., มหิดล, มช."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Target Scores */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>เป้าหมายคะแนนสอบ (เต็ม 100)</span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  TGAT เป้าหมาย
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targetScoreTGAT}
                    onChange={(e) => setTargetScoreTGAT(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">เต็ม 100</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  TPAT เป้าหมาย
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targetScoreTPAT}
                    onChange={(e) => setTargetScoreTPAT(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">เต็ม 100</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  A-Level เฉลี่ย
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={targetScoreALevel}
                    onChange={(e) => setTargetScoreALevel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                  <span className="text-[10px] text-slate-400 block text-center mt-1">เต็ม 100</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  เป้าหมายทำโจทย์ต่อวัน: <strong className="text-indigo-600">{dailyGoalQuestions} ข้อ/วัน</strong>
                </label>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={dailyGoalQuestions}
                onChange={(e) => setDailyGoalQuestions(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                ล้างข้อมูลประวัติทั้งหมด
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                ออกจากระบบ
              </button>
            </div>

            <button
              id="save-profile-submit-btn"
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>บันทึกเรียบร้อย!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกการเปลี่ยนแปลง</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
