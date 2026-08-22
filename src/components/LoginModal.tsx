import React, { useState } from 'react';
import { Mail, Check, X, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { FirestoreService } from '../lib/firestoreService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: Partial<UserProfile>) => void;
  currentProfile: UserProfile;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentProfile,
}) => {
  const [email, setEmail] = useState(currentProfile.email || 'pasitmorakanun12@gmail.com');
  const [name, setName] = useState(currentProfile.name || 'นักเรียน TCAS69');
  const [gradeLevel, setGradeLevel] = useState(currentProfile.gradeLevel || 'มัธยมศึกษาปีที่ 6');
  const [dreamFaculty, setDreamFaculty] = useState(currentProfile.dreamFaculty || 'คณะแพทยศาสตร์');
  const [dreamUniversity, setDreamUniversity] = useState(
    currentProfile.dreamUniversity || 'จุฬาลงกรณ์มหาวิทยาลัย'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGooglePopupAuth = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user profile already exists in Firestore
      let existingProfile = await FirestoreService.getUserProfile(user.uid);

      const updatedProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || name.trim() || 'นักเรียน TCAS',
        email: user.email || email.trim(),
        avatarUrl:
          user.photoURL ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
        gradeLevel: existingProfile?.gradeLevel || gradeLevel,
        dreamFaculty: existingProfile?.dreamFaculty || dreamFaculty,
        dreamUniversity: existingProfile?.dreamUniversity || dreamUniversity,
        targetScoreTGAT: existingProfile?.targetScoreTGAT || 80,
        targetScoreTPAT: existingProfile?.targetScoreTPAT || 75,
        targetScoreALevel: existingProfile?.targetScoreALevel || 70,
        dailyGoalQuestions: existingProfile?.dailyGoalQuestions || 10,
        streakDays: existingProfile?.streakDays || 1,
        joinedDate: existingProfile?.joinedDate || new Date().toISOString(),
      };

      await FirestoreService.saveUserProfile(updatedProfile);
      onLoginSuccess(updatedProfile);
      onClose();
    } catch (err: unknown) {
      console.warn('Google Popup auth notice:', err);
      // If user closed popup or restricted, fallback cleanly
      const fallbackProfile: Partial<UserProfile> = {
        email: email.trim(),
        name: name.trim() || 'นักเรียน TCAS',
        gradeLevel,
        dreamFaculty,
        dreamUniversity,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
          email
        )}`,
      };
      onLoginSuccess(fallbackProfile);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('กรุณากรอกอีเมล Gmail ให้ถูกต้อง');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const updatedProfile: Partial<UserProfile> = {
        email: email.trim(),
        name: name.trim() || 'นักเรียน TCAS',
        gradeLevel,
        dreamFaculty,
        dreamUniversity,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
          email
        )}`,
      };

      if (auth.currentUser) {
        await FirestoreService.saveUserProfile({
          ...currentProfile,
          ...updatedProfile,
          id: auth.currentUser.uid,
        } as UserProfile);
      }

      onLoginSuccess(updatedProfile);
      onClose();
    } catch (err) {
      console.error('Save profile error:', err);
      onLoginSuccess({
        email: email.trim(),
        name: name.trim() || 'นักเรียน TCAS',
        gradeLevel,
        dreamFaculty,
        dreamUniversity,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="login-modal-box"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-linear-to-r from-indigo-600 to-violet-700 p-6 text-white text-center relative">
          <button
            id="close-login-modal-btn"
            onClick={onClose}
            aria-label="ปิดหน้าต่างเข้าสู่ระบบ"
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner">
            <Sparkles className="w-8 h-8 text-amber-300" />
          </div>

          <h3 className="text-xl font-black tracking-tight">
            เข้าสู่ระบบด้วย Firebase & Google
          </h3>
          <p className="text-indigo-100 text-xs mt-1">
            ซิงค์ประวัติข้อสอบ คลาวด์ดาต้าเบส และสถิติวิเคราะห์แบบเรียลไทม์
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Google Sign In Button */}
          <button
            id="google-one-click-login-btn"
            type="button"
            onClick={handleGooglePopupAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold shadow-xs transition-all active:scale-[0.99] group cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google Popup'}</span>
          </button>

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-xs font-semibold text-slate-400">
              หรือปรับแต่งเป้าหมายการสอบ
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                อีเมล Gmail ผู้ใช้
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อที่ต้องการให้ AI เรียก
              </label>
              <input
                id="login-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น น้องกานต์ หรือ นักเรียน TCAS"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ระดับชั้นปัจจุบัน
                </label>
                <select
                  id="login-grade-select"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                >
                  <option value="มัธยมศึกษาปีที่ 4">ม.4</option>
                  <option value="มัธยมศึกษาปีที่ 5">ม.5</option>
                  <option value="มัธยมศึกษาปีที่ 6">ม.6 (เด็ก69)</option>
                  <option value="เด็กซิ่ว / เตรียมสอบ">เด็กซิ่ว / ซิ่วเตรียมสอบ</option>
                  <option value="บุคคลทั่วไป">บุคคลทั่วไป</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  คณะเป้าหมาย
                </label>
                <input
                  id="login-faculty-input"
                  type="text"
                  value={dreamFaculty}
                  onChange={(e) => setDreamFaculty(e.target.value)}
                  placeholder="เช่น แพทย์, วิศวะ, บัญชี"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>บันทึกและเชื่อมต่อระบบ</span>
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>เชื่อมต่อ Firestore Database ({auth.currentUser ? 'กำลังทำงาน' : 'พร้อมใช้งาน'})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

