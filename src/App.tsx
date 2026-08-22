import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar, NavTab } from './components/Navbar';
import { ChatTutor } from './components/ChatTutor';
import { ExamGenerator } from './components/ExamGenerator';
import { ExamTakingModal } from './components/ExamTakingModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ExamHistory } from './components/ExamHistory';
import { UserProfileModal } from './components/UserProfileModal';
import { LoginModal } from './components/LoginModal';
import { ExamCategory, ExamData, ExamHistoryItem, UserProfile } from './types';
import { StorageService } from './lib/storage';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FirestoreService } from './lib/firestoreService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('chat');
  const [user, setUser] = useState<UserProfile>(() => StorageService.getProfile());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => StorageService.isLoggedIn());
  const [history, setHistory] = useState<ExamHistoryItem[]>(() => StorageService.getExamHistory());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active CBT test modal
  const [activeExam, setActiveExam] = useState<ExamData | null>(null);

  // Active Category state for headers and filters
  const [activeCategory, setActiveCategory] = useState<ExamCategory>('TGAT');

  // Generator prefill states
  const [generatorCategory, setGeneratorCategory] = useState<ExamCategory>('TGAT');
  const [generatorSubjectId, setGeneratorSubjectId] = useState<string>('tgat1');

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Firebase Auth State Listener & Firestore realtime history listener
  useEffect(() => {
    let unsubscribeHistory: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        StorageService.setLoggedIn(true);

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
              name: firebaseUser.displayName || user.name,
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
          console.warn('Profile sync error:', e);
        }

        // Subscribe to Firestore Exam History
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
          console.warn('History subscription error:', e);
        }
      } else {
        if (unsubscribeHistory) {
          unsubscribeHistory();
          unsubscribeHistory = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeHistory) unsubscribeHistory();
    };
  }, []);

  // Calculate overall readiness percentage
  const readinessPercentage = React.useMemo(() => {
    if (!history || history.length === 0) return 76;
    const totalPercentage = history.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    const avg = Math.round(totalPercentage / history.length);
    return Math.min(98, Math.max(30, avg));
  }, [history]);

  // Sync profile & history
  const handleUpdateProfile = (updated: UserProfile) => {
    setUser(updated);
    StorageService.saveProfile(updated);
    if (auth.currentUser) {
      FirestoreService.saveUserProfile(updated).catch((err) =>
        console.warn('Firestore profile save warning:', err)
      );
    }
  };

  const handleLoginSuccess = (profileUpdates: Partial<UserProfile>) => {
    const updated = { ...user, ...profileUpdates };
    setUser(updated);
    setIsLoggedIn(true);
    StorageService.saveProfile(updated);
    StorageService.setLoggedIn(true);
    if (auth.currentUser) {
      FirestoreService.saveUserProfile(updated).catch((err) =>
        console.warn('Firestore profile save warning:', err)
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setIsLoggedIn(false);
    StorageService.setLoggedIn(false);
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
    setCurrentTab('generator');
  };

  const handleAskAIAboutQuestion = (
    questionText: string,
    explanation: string,
    userChoice: string,
    correctChoice: string
  ) => {
    const currentMessages = StorageService.getChatMessages();
    const promptText = `ช่วยอธิบายเฉลยข้อนี้อย่างละเอียดให้หน่อยครับ:\n\nโจทย์: "${questionText}"\nคำตอบที่ผมเลือก: "${userChoice}"\nคำตอบที่ถูกต้อง: "${correctChoice}"\n\nคำอธิบายเดิม: ${explanation}\n\nอยากทราบว่าทำไมข้อนี้ถึงตอบข้อนี้ และมีเทคนิคหรือหลักการจำอย่างไรไม่ให้โดนหลอกอีกครับ?`;

    setCurrentTab('chat');
    const userMsg = {
      id: `user-ask-${Date.now()}`,
      role: 'user' as const,
      content: promptText,
      timestamp: new Date().toISOString(),
    };
    StorageService.saveChatMessages([...currentMessages, userMsg]);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Left Sidebar (Desktop Persistent & Mobile Drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'profile') {
            setIsProfileModalOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        user={user}
        isLoggedIn={isLoggedIn}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            if (tab === 'profile') {
              setIsProfileModalOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          user={user}
          isLoggedIn={isLoggedIn}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setGeneratorCategory(cat);
          }}
          readinessPercentage={readinessPercentage}
        />

        {/* Dynamic Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'chat' && (
            <ChatTutor
              user={user}
              onNavigateToGenerator={handleNavigateToGeneratorFromChat}
              onNavigateToAnalytics={() => setCurrentTab('analytics')}
            />
          )}

          {currentTab === 'generator' && (
            <ExamGenerator
              onStartExam={handleStartExam}
              initialCategory={generatorCategory}
              initialSubjectId={generatorSubjectId}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsDashboard
              user={user}
              history={history}
              onNavigateToGenerator={() => setCurrentTab('generator')}
            />
          )}

          {currentTab === 'history' && (
            <ExamHistory
              history={history}
              onRetakeExam={handleRetakeFromHistory}
              onAskAIAboutQuestion={handleAskAIAboutQuestion}
            />
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

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
        onLogout={handleLogout}
      />

      {/* Google / Gmail Sign In Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentProfile={user}
      />
    </div>
  );
}

