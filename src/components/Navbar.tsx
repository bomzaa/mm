import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  BarChart2,
  LogOut,
  Sparkles,
  Flame,
  CheckCheck,
} from 'lucide-react';
import { ExamCategory, UserProfile } from '../types';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'ข้อสอบชุดใหม่พร้อมใช้งาน',
    desc: 'TPAT 3 ความถนัดด้านวิทยาศาสตร์ฯ อัปเดตแนวข้อสอบปีล่าสุดแล้ว',
    time: '10 นาทีที่แล้ว',
    unread: true,
  },
  {
    id: 'n2',
    title: 'เป้าหมายรายวัน',
    desc: 'อย่าลืมทำข้อสอบฝึกฝนประจำวันนี้เพื่อรักษา Streak ต่อเนื่อง!',
    time: '2 ชั่วโมงที่แล้ว',
    unread: true,
  },
  {
    id: 'n3',
    title: 'วิเคราะห์ผลคะแนนสำเร็จ',
    desc: 'ระบบได้ประมวลผลจุดแข็งและจุดอ่อนในวิชาคณิตศาสตร์ให้คุณแล้ว',
    time: 'เมื่อวานนี้',
    unread: true,
  },
];

export type NavTab =
  | 'home'
  | 'chatbot'
  | 'generator'
  | 'history'
  | 'minigame'
  | 'guide'
  | 'analytics'
  | 'settings';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserProfile;
  isLoggedIn: boolean;
  onLogout: () => void;
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
  onLogout,
  onToggleMobileMenu,
  activeCategory = 'TGAT',
  onSelectCategory,
  readinessPercentage = 85,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Display name formatted like in screenshot (e.g. pasitmorakanun12)
  const displayUsername = user.email ? user.email.split('@')[0] : user.name || 'pasitmorakanun12';

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('mock_notifications_read_state');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_NOTIFICATIONS;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleToggleNotifications = () => {
    const nextState = !isNotificationsOpen;
    setIsNotificationsOpen(nextState);

    // เมื่อกดเข้าดูการแจ้งเตือน ให้เคลียร์สถานะเป็นอ่านแล้วทันทีเพื่อให้ตัวเลขสีแดงหายไป
    if (nextState && unreadCount > 0) {
      setNotifications((curr) => {
        const updated = curr.map((n) => ({ ...n, unread: false }));
        try {
          localStorage.setItem('mock_notifications_read_state', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications((curr) => {
      const updated = curr.map((n) => ({ ...n, unread: false }));
      try {
        localStorage.setItem('mock_notifications_read_state', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleToggleNotificationItem = (id: string) => {
    setNotifications((curr) => {
      const updated = curr.map((n) => (n.id === id ? { ...n, unread: false } : n));
      try {
        localStorage.setItem('mock_notifications_read_state', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-xs px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Left: Mobile Menu Hamburger Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          aria-label="เปิดเมนูนำทาง"
          className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Notifications & User Profile Dropdown (Matching Screenshot) */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* Animated Streak Flame Pill */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="เรียนต่อเนื่อง 5 วันติด! รับโบนัส EXP พิเศษ"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-full text-amber-700 text-xs font-bold shadow-xs cursor-pointer select-none"
        >
          <motion.div
            animate={{ scale: [1, 1.25, 0.95, 1.15, 1], rotate: [-4, 4, -2, 2, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          </motion.div>
          <span className="font-extrabold text-[11px] tracking-tight">5 วัน</span>
        </motion.div>

        {/* Notification Bell with Red Badge "3" (disappears when clicked/read) */}
        <div className="relative" ref={notifRef}>
          <button
            id="navbar-notification-btn"
            onClick={handleToggleNotifications}
            aria-label="การแจ้งเตือน"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  key="notification-unread-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs"
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Notifications Popover */}
          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">การแจ้งเตือน</span>
                    {unreadCount > 0 ? (
                      <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 text-[10px] font-bold rounded-full">
                        {unreadCount}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200/60 text-[10px] font-medium rounded-full flex items-center gap-1">
                        <CheckCheck className="w-3 h-3 text-emerald-500" />
                        อ่านแล้วทั้งหมด
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline cursor-pointer font-medium"
                    >
                      อ่านทั้งหมด
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const reset = INITIAL_NOTIFICATIONS.map((n) => ({ ...n, unread: true }));
                        setNotifications(reset);
                        try {
                          localStorage.setItem('mock_notifications_read_state', JSON.stringify(reset));
                        } catch {
                          // ignore
                        }
                      }}
                      className="text-[10px] text-slate-400 hover:text-slate-600 hover:underline cursor-pointer"
                      title="รีเซ็ตข้อความเป็นยังไม่อ่าน"
                    >
                      รีเซ็ต
                    </button>
                  )}
                </div>
                <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleToggleNotificationItem(n.id)}
                      className={`py-2.5 px-2 rounded-xl transition-colors cursor-pointer ${
                        n.unread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50 opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {n.unread ? (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-2xs" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        )}
                        <h4 className={`text-xs ${n.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                          {n.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 pl-4 leading-relaxed">{n.desc}</p>
                      <span className="text-[10px] text-slate-400 pl-4 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Pill & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            id="navbar-user-dropdown-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:pr-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {/* Circle Avatar Icon */}
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 shadow-xs shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={displayUsername} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4.5 h-4.5 text-slate-600" />
              )}
            </div>

            {/* Username */}
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline-block max-w-[150px] truncate">
              {displayUsername}
            </span>

            {/* Down Chevron */}
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-slate-700' : ''
              }`}
            />
          </motion.button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2"
              >
                {/* User info summary */}
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    onSelectTab('settings');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>ตั้งค่าโปรไฟล์และบัญชี</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTab('analytics');
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:text-blue-600 hover:bg-blue-50/70 rounded-xl transition-colors text-left"
                >
                  <BarChart2 className="w-4 h-4 text-slate-400" />
                  <span>สถิติการเรียน</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
