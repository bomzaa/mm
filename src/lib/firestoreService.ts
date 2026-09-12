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
import { INITIAL_ADMIN_EXAM_PREPARATION_SETS } from '../data/officialExamCatalog';

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

  async deleteExamAttempt(attemptId: string): Promise<void> {
    StorageService.deleteExamAttempt(attemptId);
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/examHistory/${attemptId}`;
    try {
      const docRef = doc(db, 'users', userId, 'examHistory', attemptId);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async clearAllExamHistory(): Promise<void> {
    StorageService.clearExamHistory();
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const path = `users/${userId}/examHistory`;
    try {
      const colRef = collection(db, 'users', userId, 'examHistory');
      const snapshot = await getDocs(colRef);
      const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
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
        const seen = new Set<string>();
        const items: ExamHistoryItem[] = [];
        snapshot.forEach((d) => {
          const item = d.data() as ExamHistoryItem;
          const id = item.id || d.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            items.push({ ...item, id });
          }
        });
        // Sort newest first
        items.sort(
          (a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()
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

  // Official Exam Bank (e.g. TPAT3 ธ.ค. 66)
  async getOfficialExam(examId: string): Promise<ExamData | null> {
    const path = `officialExams/${examId}`;
    try {
      const docRef = doc(db, 'officialExams', examId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as ExamData;
      }
      return null;
    } catch (error) {
      console.warn(`Firestore getOfficialExam (${path}) fallback:`, error);
      return null;
    }
  },

  async saveOfficialExam(exam: ExamData): Promise<void> {
    const path = `officialExams/${exam.id}`;
    try {
      const docRef = doc(db, 'officialExams', exam.id);
      await setDoc(docRef, {
        ...exam,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.warn(`Firestore saveOfficialExam (${path}) warning:`, error);
      // Also cache in local storage
      StorageService.saveExam(exam);
    }
  },

  async listOfficialExams(): Promise<ExamData[]> {
    const path = 'officialExams';
    try {
      const colRef = collection(db, 'officialExams');
      const snapshot = await getDocs(colRef);
      const exams: ExamData[] = [];
      snapshot.forEach((d) => {
        exams.push(d.data() as ExamData);
      });
      return exams;
    } catch (error) {
      console.warn(`Firestore listOfficialExams (${path}) fallback:`, error);
      return [];
    }
  },

  // =========================================================================
  // 📚 ข้อสอบเตรียมสอบ (Curated/Imported by Admin Only from Firebase)
  // Path: exams/exam_preparation/items/{examId} or officialExams/{examId}
  // =========================================================================
  async getExamPreparationSets(): Promise<ExamData[]> {
    const primaryPath = 'exams/exam_preparation/items';
    const fallbackPath = 'officialExams';
    const examMap = new Map<string, ExamData>();

    // Add initial pre-curated sets first as guaranteed fallback baseline
    for (const item of INITIAL_ADMIN_EXAM_PREPARATION_SETS) {
      examMap.set(item.id, item);
    }

    try {
      // 1. Try fetching from exams/exam_preparation/items
      const primaryCol = collection(db, 'exams', 'exam_preparation', 'items');
      const snapshot = await getDocs(primaryCol);
      if (!snapshot.empty) {
        snapshot.forEach((d) => {
          const data = d.data() as ExamData;
          if (data && data.id) {
            examMap.set(data.id, { ...data, isOfficial: true, importedBy: 'admin' });
          }
        });
      } else {
        // If primary collection is newly initialized, also check officialExams
        const officialCol = collection(db, fallbackPath);
        const officialSnap = await getDocs(officialCol);
        officialSnap.forEach((d) => {
          const data = d.data() as ExamData;
          if (data && data.id) {
            examMap.set(data.id, { ...data, isOfficial: true, importedBy: 'admin' });
          }
        });
      }
    } catch (err) {
      console.warn('Firestore getExamPreparationSets network fallback:', err);
    }

    // Return as array sorted by year/title
    return Array.from(examMap.values()).map(e => ({
      ...e,
      isOfficial: true,
      importedBy: 'admin',
    }));
  },

  async getExamPreparationSetById(examId: string): Promise<ExamData | null> {
    try {
      // Check exams/exam_preparation/items
      const primaryRef = doc(db, 'exams', 'exam_preparation', 'items', examId);
      const snapshot = await getDoc(primaryRef);
      if (snapshot.exists()) {
        return snapshot.data() as ExamData;
      }
      // Check officialExams
      const fallbackRef = doc(db, 'officialExams', examId);
      const fallbackSnap = await getDoc(fallbackRef);
      if (fallbackSnap.exists()) {
        return fallbackSnap.data() as ExamData;
      }
    } catch (err) {
      console.warn(`Firestore getExamPreparationSetById (${examId}) warning:`, err);
    }
    // Fallback to local admin catalog
    const local = INITIAL_ADMIN_EXAM_PREPARATION_SETS.find((e) => e.id === examId);
    return local || null;
  },

  async saveExamPreparationSet(exam: ExamData): Promise<void> {
    const cleanExam: ExamData = {
      ...exam,
      isOfficial: true,
      importedBy: 'admin',
      isAiGenerated: false,
      status: exam.status || 'พร้อมใช้งาน',
      createdAt: exam.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Save to examPreparation/{examId} (Requested by User)
    try {
      const examPrepRef = doc(db, 'examPreparation', exam.id);
      await setDoc(examPrepRef, cleanExam, { merge: true });

      // Save questions subcollection
      if (exam.questions && exam.questions.length > 0) {
        for (const q of exam.questions) {
          try {
            const qRef = doc(db, 'examPreparation', exam.id, 'questions', q.id || `q-${q.questionNumber}`);
            await setDoc(qRef, q, { merge: true });
          } catch {
            // non-blocking
          }
        }
      }
    } catch (err) {
      console.warn('Failed saving to examPreparation:', err);
    }

    // 2. Save to exams/exam_preparation/items
    try {
      const primaryRef = doc(db, 'exams', 'exam_preparation', 'items', exam.id);
      await setDoc(primaryRef, cleanExam, { merge: true });
    } catch (err) {
      console.warn('Failed saving to exams/exam_preparation/items:', err);
    }

    // 3. Also mirror to officialExams for backwards compatibility
    try {
      const fallbackRef = doc(db, 'officialExams', exam.id);
      await setDoc(fallbackRef, cleanExam, { merge: true });
    } catch (err) {
      console.warn('Failed saving to officialExams:', err);
    }

    StorageService.saveExam(cleanExam);
  },

  async updateExamPreparationSet(examId: string, updates: Partial<ExamData>): Promise<void> {
    const updatedPayload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    try {
      const examPrepRef = doc(db, 'examPreparation', examId);
      await setDoc(examPrepRef, updatedPayload, { merge: true });
    } catch (err) {
      console.warn('Update examPreparation warning:', err);
    }

    try {
      const primaryRef = doc(db, 'exams', 'exam_preparation', 'items', examId);
      await setDoc(primaryRef, updatedPayload, { merge: true });
    } catch (err) {
      console.warn('Update exams/exam_preparation warning:', err);
    }

    // Update locally
    const current = StorageService.getExam(examId) || INITIAL_ADMIN_EXAM_PREPARATION_SETS.find(e => e.id === examId);
    if (current) {
      StorageService.saveExam({ ...current, ...updatedPayload });
    }
  },

  async deleteExamPreparationSet(examId: string): Promise<void> {
    try {
      const examPrepRef = doc(db, 'examPreparation', examId);
      await deleteDoc(examPrepRef);
    } catch (err) {
      console.warn('Delete examPreparation warning:', err);
    }

    try {
      const primaryRef = doc(db, 'exams', 'exam_preparation', 'items', examId);
      await deleteDoc(primaryRef);
    } catch (err) {
      console.warn('Delete exams/exam_preparation warning:', err);
    }

    try {
      const fallbackRef = doc(db, 'officialExams', examId);
      await deleteDoc(fallbackRef);
    } catch (err) {
      console.warn('Delete officialExams warning:', err);
    }

    // Remove from local storage
    const allExams = StorageService.getAllExams().filter(e => e.id !== examId);
    localStorage.setItem('study_coach_exams', JSON.stringify(allExams));
  },

  subscribeExamPreparationSets(
    onUpdate: (sets: ExamData[]) => void,
    onError?: (err: unknown) => void
  ) {
    const primaryCol = collection(db, 'exams', 'exam_preparation', 'items');
    return onSnapshot(
      primaryCol,
      (snapshot) => {
        const examMap = new Map<string, ExamData>();
        // Seed initial items
        for (const item of INITIAL_ADMIN_EXAM_PREPARATION_SETS) {
          examMap.set(item.id, item);
        }
        snapshot.forEach((d) => {
          const data = d.data() as ExamData;
          if (data && data.id) {
            examMap.set(data.id, { ...data, isOfficial: true, importedBy: 'admin' });
          }
        });
        onUpdate(Array.from(examMap.values()));
      },
      (error) => {
        console.warn('subscribeExamPreparationSets snapshot warning:', error);
        if (onError) onError(error);
        // Fallback to pre-curated sets
        onUpdate(INITIAL_ADMIN_EXAM_PREPARATION_SETS);
      }
    );
  },

  // =========================================================================
  // 🤖 สร้างข้อสอบฝึกฝน (AI-Generated Practice Exams)
  // Path: exams/ai_practice/items/{examId} & users/{userId}/customExams/{examId}
  // =========================================================================
  async saveAiPracticeExam(exam: ExamData): Promise<void> {
    const cleanExam: ExamData = {
      ...exam,
      isAiGenerated: true,
      isOfficial: false,
      createdAt: exam.createdAt || new Date().toISOString(),
    };

    // Cache locally for instant offline CBT access
    StorageService.saveExam(cleanExam);

    // Save to shared AI practice pool in Firestore
    try {
      const aiPracticeRef = doc(db, 'exams', 'ai_practice', 'items', exam.id);
      await setDoc(aiPracticeRef, cleanExam, { merge: true });
    } catch (err) {
      console.warn('Firestore saveAiPracticeExam pool warning:', err);
    }

    // If signed in, also save to user personal custom exams
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      try {
        const userExamRef = doc(db, 'users', userId, 'customExams', exam.id);
        await setDoc(userExamRef, { ...cleanExam, userId }, { merge: true });
      } catch (err) {
        console.warn('Firestore user customExam save warning:', err);
      }
    }
  },
};
