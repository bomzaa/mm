import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  MessageSquareText,
  FileEdit,
  Clock,
  Gamepad2,
  BookOpen,
  BarChart2,
  Settings,
  LogOut,
  X,
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
  // Navigation Items matching the design:
  // 1. หน้าหลัก (home)
  // 2. AI ติวเตอร์ (แชทบอท) (chatbot)
  // 3. สร้างข้อสอบ (generator)
  // 4. ประวัติข้อสอบ (history)
  // 5. วิธีการใช้งาน (guide)
  // 6. สถิติการเรียน (analytics)
  // 7. มินิเกม (minigame)
  // 8. ตั้งค่า (settings)
  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'หน้าหลัก',
      icon: Home,
    },
    {
      id: 'chatbot' as NavTab,
      label: 'AI ติวเตอร์ (แชทบอท)',
      icon: MessageSquareText,
    },
    {
      id: 'generator' as NavTab,
      label: 'สร้างข้อสอบ',
      icon: FileEdit,
    },
    {
      id: 'history' as NavTab,
      label: 'ประวัติข้อสอบ',
      icon: Clock,
    },
    {
      id: 'guide' as NavTab,
      label: 'วิธีการใช้งาน',
      icon: BookOpen,
    },
    {
      id: 'analytics' as NavTab,
      label: 'สถิติการเรียน',
      icon: BarChart2,
    },
    {
      id: 'minigame' as NavTab,
      label: 'มินิเกม',
      icon: Gamepad2,
    },
    {
      id: 'settings' as NavTab,
      label: 'ตั้งค่า',
      icon: Settings,
    },
  ];

  const content = (
    <div className="h-full flex flex-col bg-white text-slate-800 w-64 select-none border-r border-slate-100">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div
            onClick={() => {
              onSelectTab('home');
              if (onCloseMobile) onCloseMobile();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-xs shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <BookOpenCheck className="w-5 h-5 stroke-[2.4]" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              AI Study Buddy
            </span>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="ปิดเมนู"
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu with sliding active layout animation */}
        <nav className="space-y-1.5 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <motion.button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left cursor-pointer transition-colors ${
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarTab"
                    className="absolute inset-0 bg-blue-50/90 rounded-xl"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 relative z-10 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}
                />
                <span className="truncate relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Logout Button (Matching Screenshot) */}
      <div className="mt-auto p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 bg-white flex-col shrink-0 hidden md:flex h-screen sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
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
