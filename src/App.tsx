import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Navbar, NavTab } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { ChatTutor } from './components/ChatTutor';
import { ExamGenerator } from './components/ExamGenerator';
import { ExamTakingModal } from './components/ExamTakingModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ExamHistory } from './components/ExamHistory';
import { LoginPage } from './components/LoginPage';
import { UserGuideView } from './components/UserGuideView';
import { SettingsView } from './components/SettingsView';
import { MiniGameView } from './components/MiniGameView';
import { PixelCompanion } from './components/Companion/PixelCompanion';
import { ExamCategory, ExamData, ExamHistoryItem, UserProfile } from './types';
import { StorageService } from './lib/storage';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FirestoreService } from './lib/firestoreService';
import { BookOpenCheck } from 'lucide-react';

export default function App() {
  // Authentication Guard State
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile>(() => StorageService.getProfile());
  const [history, setHistory] = useState<ExamHistoryItem[]>(() => StorageService.getExamHistory());

  // Protected Route Navigation State: default to 'home' (หน้าหลัก)
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active CBT test modal
  const [activeExam, setActiveExam] = useState<ExamData | null>(null);

  // Active Category state for headers and filters
  const [activeCategory, setActiveCategory] = useState<ExamCategory>('TGAT');

  // Generator prefill states
  const [generatorCategory, setGeneratorCategory] = useState<ExamCategory>('TGAT');
  const [generatorSubjectId, setGeneratorSubjectId] = useState<string>('tgat1');

  // Helper to resolve route tab from URL pathname
  const resolveTabFromPath = (pathname: string): NavTab => {
    const clean = pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
    if (clean === 'home' || clean === 'main') return 'home';
    if (clean === 'chatbot' || clean === 'chat' || clean === 'tutor') return 'chatbot';
    if (clean === 'generator' || clean === 'exam-generator') return 'generator';
    if (clean === 'history' || clean === 'exam-history') return 'history';
    if (clean === 'minigame' || clean === 'game' || clean === 'games' || clean === 'mini-game') return 'minigame';
    if (clean === 'guide' || clean === 'how-to-use') return 'guide';
    if (clean === 'analytics' || clean === 'dashboard' || clean === 'stats') return 'analytics';
    if (clean === 'settings' || clean === 'profile' || clean === 'account') return 'settings';
    return 'home';
  };

  // Safe navigation handler with URL pushState synchronization
  const handleTabChange = useCallback((tab: NavTab) => {
    if (tab === 'generator') {
      setGeneratorSubjectId(undefined);
      setGeneratorCategory(undefined);
    }
    setCurrentTab(tab);
    const targetUrl = `/${tab}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({ tab }, '', targetUrl);
    }
  }, []);

  // 1. Initial Authentication and Session Verification on App Startup
  useEffect(() => {
    let unsubscribeHistory: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        StorageService.setLoggedIn(true);

        // Determine target tab from current URL or default to 'home'
        const initialTab = resolveTabFromPath(window.location.pathname);
        setCurrentTab(initialTab);
        if (
          window.location.pathname === '/login' ||
          window.location.pathname === '/' ||
          window.location.pathname === ''
        ) {
          window.history.replaceState({ tab: 'home' }, '', '/home');
          setCurrentTab('home');
        }

        // Fetch or sync user profile from Firestore
        try {
          const profileDoc = await FirestoreService.getUserProfile(firebaseUser.uid);
          if (profileDoc) {
            setUser(profileDoc);
            StorageService.saveProfile(profileDoc);
          } else {
            const initialSyncedProfile: UserProfile = {
              ...user,
              id: firebaseUser.uid,
              name: firebaseUser.displayName || user.name || 'นักเรียน AI Study Buddy',
              email: firebaseUser.email || user.email,
              avatarUrl:
                firebaseUser.photoURL ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                  firebaseUser.uid
                )}`,
            };
            await FirestoreService.saveUserProfile(initialSyncedProfile);
            setUser(initialSyncedProfile);
          }
        } catch (e) {
          console.warn('Profile sync notice:', e);
        }

        // Subscribe to Firestore Exam History in real-time
        try {
          unsubscribeHistory = FirestoreService.subscribeExamHistory(
            firebaseUser.uid,
            (firestoreHistory) => {
              if (firestoreHistory && firestoreHistory.length > 0) {
                setHistory(firestoreHistory);
              }
            }
          );
        } catch (e) {
          console.warn('History subscription notice:', e);
        }
      } else {
        // Not authenticated
        setIsLoggedIn(false);
        StorageService.setLoggedIn(false);
        if (window.location.pathname !== '/login') {
          window.history.replaceState({}, '', '/login');
        }
        if (unsubscribeHistory) {
          unsubscribeHistory();
          unsubscribeHistory = null;
        }
      }

      // Finish auth checking smoothly
      setIsAuthChecking(false);
    });

    // Handle Browser Back / Forward buttons with Protected Route Guard
    const handlePopState = () => {
      if (!auth.currentUser) {
        window.history.replaceState({}, '', '/login');
        setIsLoggedIn(false);
      } else {
        const tab = resolveTabFromPath(window.location.pathname);
        setCurrentTab(tab);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      unsubscribeAuth();
      if (unsubscribeHistory) unsubscribeHistory();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Calculate overall readiness percentage
  const readinessPercentage = React.useMemo(() => {
    if (!history || history.length === 0) return 78;
    const totalPercentage = history.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    const avg = Math.round(totalPercentage / history.length);
    return Math.min(98, Math.max(30, avg));
  }, [history]);

  // Handle successful login: Redirect to 'home' (หน้าหลัก)
  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setIsLoggedIn(true);
    StorageService.saveProfile(profile);
    StorageService.setLoggedIn(true);

    setCurrentTab('home');
    window.history.replaceState({ tab: 'home' }, '', '/home');
  };

  // Handle Logout: Clean session and redirect to /login
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setIsLoggedIn(false);
    StorageService.setLoggedIn(false);
    window.history.replaceState({}, '', '/login');
  };

  // Profile update handler
  const handleUpdateProfile = (updated: UserProfile) => {
    setUser(updated);
    StorageService.saveProfile(updated);
    if (auth.currentUser) {
      FirestoreService.saveUserProfile(updated).catch((err) =>
        console.warn('Firestore profile save warning:', err)
      );
    }
  };

  const handleStartExam = (exam: ExamData) => {
    setActiveExam(exam);
  };

  const handleRetakeFromHistory = (historyItem: ExamHistoryItem) => {
    const examToRetake: ExamData = {
      id: `retake-${Date.now()}`,
      title: historyItem.title,
      gradeLevel: historyItem.questions[0]?.gradeLevel || 'ม.6',
      subjectCategory: historyItem.questions[0]?.subjectCategory || 'วิชาพื้นฐาน',
      category: historyItem.category,
      subject: historyItem.subject,
      difficulty: (historyItem.difficulty as any) || 'ปานกลาง',
      timeLimitMinutes: Math.max(5, Math.ceil((historyItem.timeSpentSeconds || 300) / 60)),
      questions: historyItem.questions.map((q) => ({
        ...q,
        userSelectedIndex: undefined,
        isFlagged: false,
      })),
      createdAt: new Date().toISOString(),
    };
    setActiveExam(examToRetake);
  };

  const handleNavigateToGenerator = (category: ExamCategory, subjectId?: string) => {
    setGeneratorCategory(category);
    if (subjectId) {
      setGeneratorSubjectId(subjectId);
    }
    setActiveCategory(category);
    handleTabChange('generator');
  };

  const handleAskAIAboutQuestion = (
    questionText: string,
    explanation: string,
    userChoice: string,
    correctChoice: string
  ) => {
    const currentMessages = StorageService.getChatMessages();
    const promptText = `ช่วยอธิบายเฉลยข้อนี้อย่างละเอียดให้หน่อยครับ:\n\nโจทย์: "${questionText}"\nคำตอบที่ผมเลือก: "${userChoice}"\nคำตอบที่ถูกต้อง: "${correctChoice}"\n\nคำอธิบายเดิม: ${explanation}\n\nอยากทราบว่าทำไมข้อนี้ถึงตอบข้อนี้ และมีเทคนิคหรือหลักการจำอย่างไรไม่ให้โดนหลอกอีกครับ?`;

    handleTabChange('chatbot');
    const userMsg = {
      id: `user-ask-${Date.now()}`,
      role: 'user' as const,
      content: promptText,
      timestamp: new Date().toISOString(),
    };
    StorageService.saveChatMessages([...currentMessages, userMsg]);
  };

  // LOADING AUTHENTICATION STATE: Smooth splash screen preventing UI flicker
  if (isAuthChecking) {
    return (
      <div className="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-6 text-white select-none font-sans">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 animate-pulse">
            <BookOpenCheck className="w-8 h-8 stroke-[2.2]" />
          </div>
          <div className="absolute -inset-2 rounded-3xl border-2 border-blue-500/30 animate-ping opacity-25" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          AI Study Buddy
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          <span>กำลังตรวจสอบข้อมูลการเข้าสู่ระบบ...</span>
        </p>
      </div>
    );
  }

  // PROTECTED ROUTE / AUTHENTICATION GUARD
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // MAIN APPLICATION LAYOUT (MATCHING SCREENSHOT)
  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Left Sidebar (Matching Screenshot with 7 Items + Logout) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        user={user}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header Navbar (Matching Screenshot with Notification Bell & User Dropdown) */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={handleTabChange}
          user={user}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setGeneratorCategory(cat);
          }}
          readinessPercentage={readinessPercentage}
        />

        {/* Dynamic Body Content with smooth route transitions */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              {/* 1. หน้าหลัก (Home Dashboard - Main UI from Screenshot) */}
              {currentTab === 'home' && (
                <HomeDashboard
                  user={user}
                  history={history}
                  onNavigate={handleTabChange}
                  onSelectCategoryForGenerator={handleNavigateToGenerator}
                  onRetakeExam={handleRetakeFromHistory}
                />
              )}

              {/* 2. AI ติวเตอร์ (แชทบอท) */}
              {currentTab === 'chatbot' && (
                <ChatTutor
                  user={user}
                  onNavigateToGenerator={handleNavigateToGenerator}
                  onNavigateToAnalytics={() => handleTabChange('analytics')}
                />
              )}

              {/* 3. สร้างข้อสอบ */}
              {currentTab === 'generator' && (
                <ExamGenerator
                  onStartExam={handleStartExam}
                  initialCategory={generatorCategory}
                  initialSubjectId={generatorSubjectId}
                />
              )}

              {/* 4. ประวัติข้อสอบ */}
              {currentTab === 'history' && (
                <ExamHistory
                  history={history}
                  onRetakeExam={handleRetakeFromHistory}
                  onAskAIAboutQuestion={handleAskAIAboutQuestion}
                  onNavigateToGenerator={() => handleTabChange('generator')}
                  onRefreshHistory={() => setHistory(StorageService.getExamHistory())}
                />
              )}

              {/* 5. วิธีการใช้งาน */}
              {currentTab === 'guide' && (
                <UserGuideView onNavigate={handleTabChange} />
              )}

              {/* 6. สถิติการเรียน */}
              {currentTab === 'analytics' && (
                <AnalyticsDashboard
                  user={user}
                  history={history}
                  onNavigateToGenerator={() => handleTabChange('generator')}
                />
              )}

              {/* 7. มินิเกม (อยู่ข้างล่างสถิติการเรียน) */}
              {currentTab === 'minigame' && (
                <MiniGameView />
              )}

              {/* 8. ตั้งค่า */}
              {currentTab === 'settings' && (
                <SettingsView
                  user={user}
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={handleLogout}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* AI Pixel Art Companion for stress relief and learning encouragement (disabled in mini-games) */}
      {currentTab !== 'minigame' && (
        <PixelCompanion
          currentTab={currentTab}
          onNavigateToMiniGame={() => handleTabChange('minigame')}
        />
      )}

      {/* CBT Exam Taking Modal */}
      {activeExam && (
        <ExamTakingModal
          exam={activeExam}
          onClose={() => {
            setActiveExam(null);
            setHistory(StorageService.getExamHistory());
          }}
          onAskAIAboutQuestion={handleAskAIAboutQuestion}
        />
      )}
    </div>
  );
}
