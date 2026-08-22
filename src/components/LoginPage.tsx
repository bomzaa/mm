import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookOpenCheck,
  User,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { FirestoreService } from '../lib/firestoreService';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper to translate Firebase error codes to friendly Thai messages
  const getFriendlyErrorMessage = (error: any): string => {
    const code = error?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
      case 'auth/email-already-in-use':
        return 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น';
      case 'auth/weak-password':
        return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      case 'auth/popup-closed-by-user':
        return 'หน้าต่างเข้าสู่ระบบ Google ถูกปิดก่อนทำรายการเสร็จ';
      case 'auth/network-request-failed':
        return 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบอินเทอร์เน็ต';
      case 'auth/too-many-requests':
        return 'มีการพยายามเข้าสู่ระบบผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่';
      default:
        return error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง';
    }
  };

  // Google Authentication Handler
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Sync or retrieve user profile
      let profile = await FirestoreService.getUserProfile(user.uid);
      if (!profile) {
        profile = {
          id: user.uid,
          name: user.displayName || 'นักเรียน AI Study Buddy',
          email: user.email || email,
          avatarUrl:
            user.photoURL ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
          gradeLevel: 'มัธยมศึกษาปีที่ 6',
          dreamFaculty: 'คณะแพทยศาสตร์',
          dreamUniversity: 'จุฬาลงกรณ์มหาวิทยาลัย',
          targetScoreTGAT: 80,
          targetScoreTPAT: 75,
          targetScoreALevel: 70,
          dailyGoalQuestions: 15,
          streakDays: 1,
          joinedDate: new Date().toISOString(),
        };
        await FirestoreService.saveUserProfile(profile);
      }

      onLoginSuccess(profile);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Email/Password Login Handler
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const user = result.user;

      let profile = await FirestoreService.getUserProfile(user.uid);
      if (!profile) {
        profile = {
          id: user.uid,
          name: user.displayName || email.split('@')[0] || 'นักเรียน AI Study Buddy',
          email: user.email || email.trim(),
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
          gradeLevel: 'มัธยมศึกษาปีที่ 6',
          dreamFaculty: 'คณะแพทยศาสตร์',
          dreamUniversity: 'จุฬาลงกรณ์มหาวิทยาลัย',
          targetScoreTGAT: 80,
          targetScoreTPAT: 75,
          targetScoreALevel: 70,
          dailyGoalQuestions: 15,
          streakDays: 1,
          joinedDate: new Date().toISOString(),
        };
        await FirestoreService.saveUserProfile(profile);
      }

      onLoginSuccess(profile);
    } catch (err: any) {
      console.error('Email Login Error:', err);
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Register Handler
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      const user = result.user;

      if (displayName.trim()) {
        await updateProfile(user, { displayName: displayName.trim() });
      }

      const newProfile: UserProfile = {
        id: user.uid,
        name: displayName.trim() || email.split('@')[0] || 'นักเรียน AI Study Buddy',
        email: user.email || email.trim(),
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.uid)}`,
        gradeLevel: 'มัธยมศึกษาปีที่ 6',
        dreamFaculty: 'คณะแพทยศาสตร์',
        dreamUniversity: 'จุฬาลงกรณ์มหาวิทยาลัย',
        targetScoreTGAT: 80,
        targetScoreTPAT: 75,
        targetScoreALevel: 70,
        dailyGoalQuestions: 15,
        streakDays: 1,
        joinedDate: new Date().toISOString(),
      };

      await FirestoreService.saveUserProfile(newProfile);
      onLoginSuccess(newProfile);
    } catch (err: any) {
      console.error('Register Error:', err);
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('กรุณากรอกอีเมลที่ถูกต้องเพื่อรับลิงก์รีเซ็ตรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage('ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมาย');
    } catch (err: any) {
      console.error('Forgot Password Error:', err);
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      {/* Main Container Card (Exact replica of image.png design) */}
      <div
        id="login-auth-card"
        className="w-full max-w-[440px] bg-white rounded-3xl sm:rounded-[32px] shadow-2xl shadow-slate-300/60 overflow-hidden border border-slate-100 transition-all duration-300"
      >
        {/* Top Blue Hero Banner */}
        <div className="bg-gradient-to-b from-[#1877F2] via-[#146AE0] to-[#0A5BD0] pt-9 pb-8 px-6 text-center text-white relative">
          {/* Logo Badge (Book with Checkmark inside translucent container) */}
          <div className="w-14 h-14 bg-white/20 backdrop-blur-xs border border-white/30 rounded-2xl flex items-center justify-center text-white mx-auto mb-3.5 shadow-inner">
            <BookOpenCheck className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* App Title */}
          <h1 className="text-2xl sm:text-[28px] font-black tracking-tight text-white drop-shadow-xs">
            AI Study Buddy
          </h1>

          {/* Subtitle */}
          <p className="text-blue-100 text-xs sm:text-[13px] mt-1 font-medium">
            {mode === 'login' && 'เข้าสู่ระบบเพื่อใช้งาน AI Study Buddy'}
            {mode === 'register' && 'สร้างบัญชีผู้ใช้ใหม่สำหรับเตรียมสอบ'}
            {mode === 'forgot' && 'รีเซ็ตรหัสผ่านบัญชีผู้ใช้ของคุณ'}
          </p>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Status Messages */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div
              id="login-success-alert"
              className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <>
              {/* Google Sign In Button */}
              <button
                id="google-login-btn"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white text-slate-700 font-semibold text-sm shadow-xs hover:shadow-sm transition-all active:scale-[0.99] cursor-pointer group"
              >
                {/* Google G SVG */}
                <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>เข้าสู่ระบบด้วย Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs font-medium text-slate-400 absolute">
                  หรือ
                </span>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    อีเมล (Email)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="กรอกอีเมลของคุณ"
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-slate-700"
                    >
                      รหัสผ่าน (Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      ลืมรหัสผ่าน?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านของคุณ"
                      className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Primary Submit Button */}
                <button
                  id="email-login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  <span>{isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
                </button>
              </form>

              {/* Bottom Register Switch */}
              <div className="pt-2 text-center text-xs text-slate-500">
                <span>ยังไม่มีบัญชี? </span>
                <button
                  id="switch-to-register-btn"
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-blue-600 font-bold hover:text-blue-700 hover:underline cursor-pointer"
                >
                  สมัครเลย
                </button>
              </div>
            </>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล / ชื่อเล่น
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="เช่น น้องกานต์ ม.6 TCAS"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมล (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="กำหนดรหัสผ่าน"
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านอีกครั้ง
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านเดิมอีกครั้ง"
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                id="register-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                <span>{isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}</span>
              </button>

              {/* Back to Login */}
              <div className="pt-2 text-center text-xs text-slate-500">
                <span>มีบัญชีผู้ใช้อยู่แล้ว? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-blue-600 font-bold hover:text-blue-700 hover:underline cursor-pointer"
                >
                  เข้าสู่ระบบ
                </button>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                กรุณากรอกอีเมลที่คุณใช้ลงทะเบียน ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังกล่องข้อความของคุณ
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  อีเมลของคุณ (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="กรอกอีเมลของคุณ"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/60 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <span>{isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-800 hover:underline cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>กลับไปหน้าเข้าสู่ระบบ</span>
                </button>
              </div>
            </form>
          )}

          {/* Security Assurance Badge */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>ระบบความปลอดภัยและการเข้ารหัสตามมาตรฐาน Firebase</span>
          </div>
        </div>
      </div>
    </div>
  );
};
