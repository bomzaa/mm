import React, { useState, useRef } from 'react';
import {
  User,
  School,
  Target,
  Mail,
  BookOpen,
  GraduationCap,
  Building,
  Camera,
  LogOut,
  ChevronDown,
  Save,
  Check,
  Sparkles,
  AlertCircle,
  Wind,
  Volume2,
  VolumeX,
  MessageSquare,
  Gauge,
  Maximize2,
} from 'lucide-react';
import { UserProfile } from '../types';
import { StorageService } from '../lib/storage';
import { FirestoreService } from '../lib/firestoreService';
import { CompanionConfig, CompanionService } from '../lib/companionEvents';
import { CompanionCharacterSprite } from './Companion/CompanionCharacterSprite';
import { BreathingRelaxModal } from './Companion/BreathingRelaxModal';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateProfile,
  onLogout,
}) => {
  // Form State initialized with user profile values
  const [name, setName] = useState(user.name || '');
  const [school, setSchool] = useState(user.school || '');
  const [targetExam, setTargetExam] = useState(user.targetExam || '');
  const [email, setEmail] = useState(user.email || '');
  const [gradeLevel, setGradeLevel] = useState(user.gradeLevel || '');
  const [dreamFaculty, setDreamFaculty] = useState(user.dreamFaculty || '');
  const [dreamMajor, setDreamMajor] = useState(user.dreamMajor || '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user.avatarUrl);

  // Companion Settings State
  const [companionCfg, setCompanionCfg] = useState<CompanionConfig>(CompanionService.getConfig());
  const [showBreathingModal, setShowBreathingModal] = useState(false);

  // Status feedback
  const [isSaved, setIsSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Avatar Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAvatarUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      ...user,
      name: name.trim() || user.name,
      school: school.trim(),
      targetExam: targetExam || user.targetExam,
      email: email.trim() || user.email,
      gradeLevel: gradeLevel || user.gradeLevel,
      dreamFaculty: dreamFaculty.trim(),
      dreamMajor: dreamMajor.trim(),
      avatarUrl: avatarUrl,
    };

    onUpdateProfile(updatedProfile);
    StorageService.saveProfile(updatedProfile);
    FirestoreService.saveUserProfile(updatedProfile).catch((err) =>
      console.warn('Firestore user profile sync:', err)
    );

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2800);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4 font-sans space-y-6 animate-in fade-in duration-300">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Main Settings Card (Exact match to screenshot) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-2xs space-y-8">
        {/* ================= 1. PROFILE HEADER ROW ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Left: Avatar + Details */}
          <div className="flex items-center gap-5">
            {/* Avatar Box with Camera Button */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm overflow-hidden border border-blue-500">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[1.8]" />
                )}
              </div>

              {/* Small Camera Button at bottom-right corner */}
              <button
                type="button"
                onClick={handleTriggerUpload}
                title="เปลี่ยนรูปโปรไฟล์"
                className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 border-2 border-white flex items-center justify-center text-white shadow-xs absolute -bottom-1.5 -right-1.5 transition-transform hover:scale-105 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* User Info Details */}
            <div className="space-y-1">
              <div className="flex items-center">
                {/* Vertical Blue Accent Bar */}
                <span className="w-1.5 h-5 sm:h-6 bg-blue-600 rounded-full inline-block mr-2.5 shrink-0" />
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {name || 'ชื่อผู้ใช้งาน'}
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 font-normal pl-4">
                {email || 'pasitmorakanun12@gmail.com'}
              </p>

              <button
                type="button"
                onClick={handleTriggerUpload}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer pl-4 pt-0.5 text-left block"
              >
                เปลี่ยนรูปโปรไฟล์
              </button>
            </div>
          </div>

          {/* Right: Logout Button */}
          <div className="self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>

        {/* ================= 2. FORM GRID (2-COLUMN EXACT LAYOUT) ================= */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Field 1: ชื่อ-นามสกุล */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>ชื่อ-นามสกุล</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุล"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Field 2: โรงเรียน */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                <span>โรงเรียน</span>
              </label>
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="กรอกชื่อโรงเรียน"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Field 3: ข้อสอบเป้าหมายหลัก */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>ข้อสอบเป้าหมายหลัก</span>
              </label>
              <div className="relative">
                <select
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="w-full appearance-none px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs pr-10 cursor-pointer"
                >
                  <option value="">-- เลือกระบบสอบเป้าหมาย --</option>
                  <option value="TGAT (ความถนัดทั่วไป)">TGAT (ความถนัดทั่วไป)</option>
                  <option value="TPAT (ความถนัดวิชาชีพ)">TPAT (ความถนัดวิชาชีพ)</option>
                  <option value="A-Level (วิชาสามัญ)">A-Level (วิชาสามัญ)</option>
                  <option value="O-NET">O-NET</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 4: อีเมล */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>อีเมล</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมลของคุณ"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Field 5: ระดับชั้นเรียน */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>ระดับชั้นเรียน</span>
              </label>
              <div className="relative">
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full appearance-none px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs pr-10 cursor-pointer"
                >
                  <option value="">-- เลือกระดับชั้นเรียน --</option>
                  <option value="ประถมศึกษาปีที่ 1 (ป.1)">ประถมศึกษาปีที่ 1 (ป.1)</option>
                  <option value="ประถมศึกษาปีที่ 2 (ป.2)">ประถมศึกษาปีที่ 2 (ป.2)</option>
                  <option value="ประถมศึกษาปีที่ 3 (ป.3)">ประถมศึกษาปีที่ 3 (ป.3)</option>
                  <option value="ประถมศึกษาปีที่ 4 (ป.4)">ประถมศึกษาปีที่ 4 (ป.4)</option>
                  <option value="ประถมศึกษาปีที่ 5 (ป.5)">ประถมศึกษาปีที่ 5 (ป.5)</option>
                  <option value="ประถมศึกษาปีที่ 6 (ป.6)">ประถมศึกษาปีที่ 6 (ป.6)</option>
                  <option value="มัธยมศึกษาปีที่ 1 (ม.1)">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                  <option value="มัธยมศึกษาปีที่ 2 (ม.2)">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                  <option value="มัธยมศึกษาปีที่ 3 (ม.3)">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                  <option value="มัธยมศึกษาปีที่ 4 (ม.4)">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                  <option value="มัธยมศึกษาปีที่ 5 (ม.5)">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                  <option value="มัธยมศึกษาปีที่ 6 (ม.6)">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 6: คณะเป้าหมาย */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>คณะเป้าหมาย</span>
              </label>
              <input
                type="text"
                value={dreamFaculty}
                onChange={(e) => setDreamFaculty(e.target.value)}
                placeholder="เช่น คณะแพทยศาสตร์, คณะวิศวกรรมศาสตร์"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400"
              />
            </div>

            {/* Field 7: สาขาเป้าหมาย (Full Row on Small / Col 1 on MD) */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>สาขาเป้าหมาย</span>
              </label>
              <input
                type="text"
                value={dreamMajor}
                onChange={(e) => setDreamMajor(e.target.value)}
                placeholder="เช่น สาขาวิศวกรรมคอมพิวเตอร์, สาขาการตลาด"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* ================= 3. SAVE BUTTON & STATUS FEEDBACK ================= */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div>
              {isSaved && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>บันทึกการเปลี่ยนแปลงโปรไฟล์สำเร็จแล้ว!</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการเปลี่ยนแปลง</span>
            </button>
          </div>
        </form>
      </div>

      {/* ================= 2. PIXEL ART COMPANION SETTINGS CARD ================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <CompanionCharacterSprite size={48} mood="happy" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  AI Companion ตัวละคร Pixel Art
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold">
                  ลดความเครียด
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เพื่อนร่วมเรียนคู่คิด ช่วยให้กำลังใจ และผ่อนคลายระหว่างเตรียมสอบ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowBreathingModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Wind className="w-4 h-4 text-teal-600" />
            <span>โหมดฝึกหายใจผ่อนคลาย 30 วิ</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Toggle 1: เปิด/ปิด Companion */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="space-y-0.5 pr-4">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>เปิดใช้งานตัวละคร Companion</span>
              </label>
              <p className="text-xs text-slate-500">
                ให้ตัวละครเดินเล่นและคอยให้กำลังใจบนหน้าจอ
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={companionCfg.enabled}
                onChange={(e) => {
                  const updated = { ...companionCfg, enabled: e.target.checked };
                  setCompanionCfg(updated);
                  CompanionService.saveConfig(updated);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Toggle 2: เปิด/ปิด เสียงเอฟเฟกต์ */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="space-y-0.5 pr-4">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {companionCfg.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
                <span>เสียงเอฟเฟกต์ (Sound FX)</span>
              </label>
              <p className="text-xs text-slate-500">
                เสียงกระโดด ทักทาย และเสียงการหายใจแบบสังเคราะห์
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={companionCfg.soundEnabled}
                onChange={(e) => {
                  const updated = { ...companionCfg, soundEnabled: e.target.checked };
                  setCompanionCfg(updated);
                  CompanionService.saveConfig(updated);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Control 3: ปรับขนาดตัวละคร */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2.5">
            <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-blue-600" />
                <span>ขนาดตัวละคร (Size)</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {companionCfg.size === 'sm' ? 'เล็ก (52px)' : companionCfg.size === 'md' ? 'ปานกลาง (68px)' : 'ใหญ่ (84px)'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'sm', label: 'เล็ก' },
                { id: 'md', label: 'ปานกลาง' },
                { id: 'lg', label: 'ใหญ่' },
              ] as const).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const updated = { ...companionCfg, size: item.id };
                    setCompanionCfg(updated);
                    CompanionService.saveConfig(updated);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    companionCfg.size === item.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Control 4: ปรับความเร็วการเดิน */}
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2.5">
            <label className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-violet-600" />
                <span>ความเร็วการเดิน (Walk Speed)</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {companionCfg.speed === 'slow' ? 'ช้า นุ่มนวล' : companionCfg.speed === 'normal' ? 'ปกติ' : 'เร็ว คล่องแคล่ว'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'slow', label: 'ช้า' },
                { id: 'normal', label: 'ปกติ' },
                { id: 'fast', label: 'เร็ว' },
              ] as const).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const updated = { ...companionCfg, speed: item.id };
                    setCompanionCfg(updated);
                    CompanionService.saveConfig(updated);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    companionCfg.speed === item.id
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle 5: เปิด/ปิด ข้อความให้กำลังใจ */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors md:col-span-2">
            <div className="space-y-0.5 pr-4">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>เปิดใช้งานข้อความให้กำลังใจและเตือนพักสายตา</span>
              </label>
              <p className="text-xs text-slate-500">
                แสดงบอลลูนข้อความปลอบโยน ให้กำลังใจเมื่อตอบถูก/ผิด และเตือนให้พักผ่อนอย่างพอดี
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={companionCfg.encouragementEnabled}
                onChange={(e) => {
                  const updated = { ...companionCfg, encouragementEnabled: e.target.checked };
                  setCompanionCfg(updated);
                  CompanionService.saveConfig(updated);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Breathing Relaxation Modal from Settings */}
      <BreathingRelaxModal
        isOpen={showBreathingModal}
        onClose={() => setShowBreathingModal(false)}
        onComplete={() => setShowBreathingModal(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">ออกจากระบบ?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบเซสชันนี้
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer shadow-xs"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
