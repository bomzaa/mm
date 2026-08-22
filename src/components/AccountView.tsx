import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  LogOut,
  Key,
  CheckCircle2,
  Database,
  Cloud,
  Clock,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface AccountViewProps {
  user: UserProfile;
  onLogout: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({ user, onLogout }) => {
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = auth.currentUser;

  const handleSendResetPassword = async () => {
    if (!user.email) return;
    setIsLoading(true);
    setResetStatus(null);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetStatus('ส่งลิงก์เปลี่ยนรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว');
    } catch (err: any) {
      setResetStatus('เกิดข้อผิดพลาดในการส่งลิงก์เปลี่ยนรหัสผ่าน');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 overflow-hidden border-2 border-indigo-400/40 shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xl text-white">
                  {user.name.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{user.name}</h2>
              <p className="text-slate-400 text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>เข้าสู่ระบบแล้ว</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  เข้าร่วมเมื่อ: {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString('th-TH') : '2026'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-all border border-rose-500/30 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Cloud Database Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">การเชื่อมต่อคลาวด์</h3>
              <p className="text-xs text-slate-500">Firebase Firestore Real-Time DB</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>สถานะเชื่อมต่อ:</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ออนไลน์และซิงค์อัตโนมัติ
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>รหัสบัญชีผู้ใช้ (UID):</span>
              <span className="font-mono text-[11px] text-slate-800 truncate max-w-[140px]">
                {currentUser?.uid || user.id}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ผู้ให้บริการล็อกอิน:</span>
              <span className="font-semibold text-slate-800">
                {currentUser?.providerData[0]?.providerId === 'google.com' ? 'Google Account' : 'Email/Password'}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">ความปลอดภัยและรหัสผ่าน</h3>
                <p className="text-xs text-slate-500">การจัดการรหัสผ่านและสิทธิ์เข้าถึง</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              คุณสามารถขอรับลิงก์สำหรับรีเซ็ตหรือเปลี่ยนรหัสผ่านใหม่ทางอีเมลที่ลงทะเบียนไว้ได้ตลอดเวลา
            </p>
          </div>

          <div>
            {resetStatus && (
              <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{resetStatus}</span>
              </div>
            )}

            <button
              onClick={handleSendResetPassword}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{isLoading ? 'กำลังส่งข้อมูล...' : 'ส่งลิงก์เปลี่ยนรหัสผ่านทางอีเมล'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
