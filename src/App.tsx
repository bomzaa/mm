import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar, NavTab } from './components/Navbar';
import { ChatTutor } from './components/ChatTutor';
import { ExamGenerator } from './components/ExamGenerator';
import { ExamTakingModal } from './components/ExamTakingModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ExamHistory } from './components/ExamHistory';
import { LoginPage } from './components/LoginPage';
import { ProfileView } from './components/ProfileView';
import { UserGuideView } from './components/UserGuideView';
import { AccountView } from './components/AccountView';
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

  // Protected Route Navigation State: default to 'chatbot'
  const [currentTab, setCurrentTab] = useState<NavTab>('chatbot');
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
    if (clean === 'generator' || clean === 'exam-generator') return 'generator';
    if (clean === 'dashboard' || clean === 'analytics') return 'dashboard';
    if (clean === 'exam-history' || clean === 'history') return 'history';
    if (clean === 'profile') return 'profile';
    if (clean === 'guide' || clean === 'how-to-use') return 'guide';
    if (clean === 'account' || clean === 'user-account') return 'account';
    return 'chatbot';
  };

  // Safe navigation handler with URL pushState synchronization
  const handleTabChange = useCallback((tab: NavTab) => {
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

        // Determine target tab from current URL or default to 'chatbot'
        const initialTab = resolveTabFromPath(window.location.pathname);
        setCurrentTab(initialTab);
        if (window.location.pathname === '/login' || window.location.pathname === '/' || window.location.pathname === '') {
          window.history.replaceState({ tab: 'chatbot' }, '', '/chatbot');
          setCurrentTab('chatbot');
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

  // Handle successful login: Strictly Redirect to Chatbot
  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setIsLoggedIn(true);
    StorageService.saveProfile(profile);
    StorageService.setLoggedIn(true);

    // CRITICAL: Chatbot is the main screen of the app. Redirect directly to Chatbot!
    setCurrentTab('chatbot');
    window.history.replaceState({ tab: 'chatbot' }, '', '/chatbot');
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

  const handleNavigateToGeneratorFromChat = (category: ExamCategory, subjectId: string) => {
    setGeneratorCategory(category);
    setGeneratorSubjectId(subjectId);
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

  // 8. LOADING AUTHENTICATION STATE: Smooth splash screen preventing UI flicker
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

  // 1 & 3. PROTECTED ROUTE / AUTHENTICATION GUARD:
  // If user is not authenticated, show the Login Page immediately.
  // Forbidden to render or access internal screens!
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 6. MAIN APPLICATION LAYOUT (AFTER SUCCESSFUL AUTHENTICATION)
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      {/* Left Sidebar: 7 Navigation Items in strict order */}
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
        {/* Top Header */}
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

        {/* Dynamic Protected Body Content (Strictly Rendered According to NavTab) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* 1. Chatbot (Main App Screen) */}
          {currentTab === 'chatbot' && (
            <ChatTutor
              user={user}
              onNavigateToGenerator={handleNavigateToGeneratorFromChat}
              onNavigateToAnalytics={() => handleTabChange('dashboard')}
            />
          )}

          {/* 2. สร้างข้อสอบด้วย AI */}
          {currentTab === 'generator' && (
            <ExamGenerator
              onStartExam={handleStartExam}
              initialCategory={generatorCategory}
              initialSubjectId={generatorSubjectId}
            />
          )}

          {/* 3. Dashboard */}
          {currentTab === 'dashboard' && (
            <AnalyticsDashboard
              user={user}
              history={history}
              onNavigateToGenerator={() => handleTabChange('generator')}
            />
          )}

          {/* 4. ประวัติข้อสอบ */}
          {currentTab === 'history' && (
            <ExamHistory
              history={history}
              onRetakeExam={handleRetakeFromHistory}
              onAskAIAboutQuestion={handleAskAIAboutQuestion}
            />
          )}

          {/* 5. โปรไฟล์ */}
          {currentTab === 'profile' && (
            <ProfileView
              user={user}
              onUpdateProfile={handleUpdateProfile}
              onLogout={handleLogout}
            />
          )}

          {/* 6. วิธีการใช้งาน */}
          {currentTab === 'guide' && (
            <UserGuideView onNavigate={handleTabChange} />
          )}

          {/* 7. บัญชีผู้ใช้งาน */}
          {currentTab === 'account' && (
            <AccountView user={user} onLogout={handleLogout} />
          )}
        </main>
      </div>

      {/* CBT Exam Modal */}
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
