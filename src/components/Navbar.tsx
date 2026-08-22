import React from 'react';
import {
  Menu,
  Sparkles,
  Flame,
  User,
  LogIn,
  LogOut,
  Target,
  Brain,
} from 'lucide-react';
import { ExamCategory, UserProfile } from '../types';

export type NavTab = 'chat' | 'generator' | 'analytics' | 'history' | 'profile';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserProfile;
  isLoggedIn: boolean;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onToggleMobileMenu?: () => void;
  activeCategory?: ExamCategory;
  onSelectCategory?: (cat: ExamCategory) => void;
  readinessPercentage?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  user,
  isLoggedIn,
  onOpenLoginModal,
  onLogout,
  onOpenProfile,
  onToggleMobileMenu,
  activeCategory = 'TGAT',
  onSelectCategory,
  readinessPercentage = 85,
}) => {
  const getTabTitle = (tab: NavTab) => {
    switch (tab) {
      case 'chat':
        return 'สนทนากับ AI';
      case 'generator':
        return 'สร้างข้อสอบ';
      case 'analytics':
        return 'วิเคราะห์ผลการเรียน';
      case 'history':
        return 'ประวัติข้อสอบ';
      case 'profile':
        return 'ข้อมูลผู้ใช้งาน';
      default:
        return 'AI Exam Coach';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Left: Mobile Menu Button + Title + Category Pills */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          aria-label="เปิดเมนูนำทาง"
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Tab Title */}
        <h2 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight whitespace-nowrap">
          {getTabTitle(currentTab)}
        </h2>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Category Pills (TGAT, TPAT, A-Level) */}
        <div className="hidden sm:flex items-center gap-1.5">
          {(['TGAT', 'TPAT', 'A-Level', 'O-NET'] as ExamCategory[]).map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory && onSelectCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-100 text-indigo-700 underline underline-offset-2'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Progress Indicator & User Quick Stats */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Readiness Progress Bar (Professional Polish Style) */}
        <div
          onClick={() => onSelectTab('analytics')}
          title={`ดัชนีความพร้อมรวม: ${readinessPercentage}%`}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <button className="text-xs text-slate-500 font-medium group-hover:text-indigo-600 transition-colors whitespace-nowrap hidden md:inline-block">
            ความพร้อม:{' '}
            <strong className="text-slate-800 group-hover:text-indigo-600">
              {readinessPercentage}%
            </strong>
          </button>
          <div className="w-24 sm:w-32 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, readinessPercentage))}%` }}
            />
          </div>
        </div>

        {/* Streak Pill */}
        <div
          onClick={onOpenProfile}
          title={`ฝึกฝนต่อเนื่อง ${user.streakDays || 1} วัน`}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span className="tabular-nums">{user.streakDays || 1} วัน</span>
        </div>

        {/* User Button on Mobile / Top Right */}
        <div className="flex md:hidden items-center gap-1">
          {isLoggedIn ? (
            <button
              onClick={onOpenProfile}
              aria-label="โปรไฟล์ผู้ใช้"
              className="w-8 h-8 rounded-full overflow-hidden border border-indigo-200"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="px-2.5 py-1 text-xs font-bold bg-indigo-600 text-white rounded-lg"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

