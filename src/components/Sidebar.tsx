import React from 'react';
import {
  MessageSquare,
  Sparkles,
  BarChart2,
  History,
  User,
  HelpCircle,
  ShieldCheck,
  LogOut,
  X,
  Target,
  Flame,
  BookOpenCheck,
} from 'lucide-react';
import { UserProfile } from '../types';
import { NavTab } from './Navbar';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserProfile;
  isLoggedIn: boolean;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  isLoggedIn,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  // Exact 7 Navigation Items in strict specified order:
  // 1. Chatbot
  // 2. สร้างข้อสอบด้วย AI
  // 3. Dashboard
  // 4. ประวัติข้อสอบ
  // 5. โปรไฟล์
  // 6. วิธีการใช้งาน
  // 7. บัญชีผู้ใช้งาน
  const navItems = [
    {
      id: 'chatbot' as NavTab,
      label: 'Chatbot',
      icon: MessageSquare,
    },
    {
      id: 'generator' as NavTab,
      label: 'สร้างข้อสอบด้วย AI',
      icon: Sparkles,
    },
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: BarChart2,
    },
    {
      id: 'history' as NavTab,
      label: 'ประวัติข้อสอบ',
      icon: History,
    },
    {
      id: 'profile' as NavTab,
      label: 'โปรไฟล์',
      icon: User,
    },
    {
      id: 'guide' as NavTab,
      label: 'วิธีการใช้งาน',
      icon: HelpCircle,
    },
    {
      id: 'account' as NavTab,
      label: 'บัญชีผู้ใช้งาน',
      icon: ShieldCheck,
    },
  ];

  const content = (
    <div className="h-full flex flex-col bg-slate-900 text-white w-64 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div
            onClick={() => {
              onSelectTab('chatbot');
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-blue-600 group-hover:bg-blue-500 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-md shadow-blue-600/30 transition-all">
              <BookOpenCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight block text-white">
                AI Study Buddy
              </span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                Smart Learning Station
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="ปิดเมนู"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'opacity-100 text-white' : 'opacity-70'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Target Faculty Widget */}
      <div className="px-6 py-2">
        <div
          onClick={() => {
            onSelectTab('profile');
            if (onCloseMobile) onCloseMobile();
          }}
          className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition-colors space-y-1.5"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>เป้าหมายสอบเข้า</span>
            </span>
            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>{user.streakDays || 1}d</span>
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200 truncate">
            {user.dreamFaculty || 'ตั้งเป้าหมายคณะ'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {user.dreamUniversity || user.gradeLevel}
          </p>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div className="mt-auto p-4 border-t border-slate-800 space-y-2">
        {/* Firestore Live Status Indicator */}
        <div className="flex items-center justify-between px-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Firebase Auth & DB</span>
          </span>
          <span className="text-emerald-400 font-medium">เชื่อมต่อแล้ว</span>
        </div>

        <div className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-800/70 transition-colors">
          <div
            onClick={() => {
              onSelectTab('profile');
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0 border border-slate-600">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white">
                  {user.name.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {user.name}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="ออกจากระบบ"
            aria-label="ออกจากระบบ"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-col shrink-0 hidden md:flex h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

