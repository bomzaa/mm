# Security Specification: AI Exam Coach

## 1. Data Invariants
1. A User Profile (`/users/{userId}`) can only be created and modified by the authenticated owner (`request.auth.uid == userId`).
2. User profile email must match the auth token email, and email cannot be changed to another user's email.
3. Exam history (`/users/{userId}/examHistory/{historyId}`) can only be read, created, updated, or deleted by the document owner (`request.auth.uid == userId`).
4. Custom exams (`/users/{userId}/customExams/{examId}`) can only be read, created, updated, or deleted by the document owner (`request.auth.uid == userId`).
5. Chat messages (`/users/{userId}/chatMessages/{messageId}`) can only be read, created, updated, or deleted by the document owner (`request.auth.uid == userId`).
6. Analysis reports (`/users/{userId}/analysisReports/{reportId}`) can only be read, created, updated, or deleted by the document owner (`request.auth.uid == userId`).
7. All incoming IDs must be validated with `isValidId()`.
8. Global default-deny rule catches all unmatched collections.

## 2. Dirty Dozen Payloads (Attacks that MUST return PERMISSION_DENIED)
1. Unauthenticated user trying to read user profile `/users/user123`.
2. Authenticated user `user_attacker` trying to read `/users/user_victim`.
3. Authenticated user `user_attacker` trying to write to `/users/user_victim`.
4. User trying to create user profile with spoofed `id: "user_victim"` while authenticated as `user_attacker`.
5. User trying to write to `/users/user123/examHistory/hist1` with `userId: "other_user"`.
6. User trying to create exam history with invalid non-numeric `score` or `totalQuestions`.
7. User trying to inject 10MB malicious string into document ID `{historyId}` or `title`.
8. User trying to access arbitrary root collection `/secret_data/confidential`.
9. User trying to query another user's chat messages `/users/victim_user/chatMessages`.
10. User trying to inject ghost fields during update on user profile.
11. Unverified user attempt when token check is enforced.
12. Attempt to delete another user's custom exam.
