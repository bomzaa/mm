import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  onSnapshot,
  deleteDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { UserProfile, ExamHistoryItem, ExamData, ChatMessage, AnalysisReport } from '../types';
import { StorageService } from './storage';
import { INITIAL_USER_PROFILE } from '../data/examCatalog';

export const FirestoreService = {
  // Sync or fetch User Profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, 'users', userId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    if (!auth.currentUser) {
      StorageService.saveProfile(profile);
      return;
    }
    const userId = auth.currentUser.uid;
    const path = `users/${userId}`;
    const cleanProfile = {
      ...profile,
      id: userId,
      email: profile.email || auth.currentUser.email || '',
      name: profile.name || auth.currentUser.displayName || 'ผู้ใช้งาน',
    };
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, cleanProfile, { merge: true });
      StorageService.saveProfile(cleanProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Save Exam Attempt in user's subcollection
  async saveExamAttempt(attempt: ExamHistoryItem): Promise<void> {
    // Local save first for instant UI response
    StorageService.saveExamAttempt(attempt);

    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/examHistory/${attempt.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'examHistory', attempt.id);
      await setDoc(docRef, {
        ...attempt,
        userId,
      });

      // Update streak in user profile
      const profile = StorageService.getProfile();
      profile.streakDays = (profile.streakDays || 0) + 1;
      await this.saveUserProfile(profile);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Subscribe to Exam History
  subscribeExamHistory(
    userId: string,
    onUpdate: (items: ExamHistoryItem[]) => void,
    onError?: (err: unknown) => void
  ) {
    const path = `users/${userId}/examHistory`;
    const colRef = collection(db, 'users', userId, 'examHistory');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: ExamHistoryItem[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as ExamHistoryItem);
        });
        // Sort newest first
        items.sort(
          (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
        onUpdate(items);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  },

  // Save Custom / Generated Exam
  async saveCustomExam(exam: ExamData): Promise<void> {
    StorageService.saveExam(exam);
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const path = `users/${userId}/customExams/${exam.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'customExams', exam.id);
      await setDoc(docRef, {
        ...exam,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCustomExam(examId: string): Promise<void> {
    StorageService.deleteExam(examId);
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const path = `users/${userId}/customExams/${examId}`;
    try {
      const docRef = doc(db, 'users', userId, 'customExams', examId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Save Chat Message
  async saveChatMessage(message: ChatMessage): Promise<void> {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/chatMessages/${message.id}`;
    try {
      const docRef = doc(db, 'users', userId, 'chatMessages', message.id);
      await setDoc(docRef, {
        ...message,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Save Analysis Report
  async saveAnalysisReport(report: AnalysisReport): Promise<void> {
    StorageService.saveLatestAnalysis(report);
    if (!auth.currentUser) return;

    const userId = auth.currentUser.uid;
    const reportId = `report-${Date.now()}`;
    const path = `users/${userId}/analysisReports/${reportId}`;
    try {
      const docRef = doc(db, 'users', userId, 'analysisReports', reportId);
      await setDoc(docRef, {
        ...report,
        id: reportId,
        userId,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
};
