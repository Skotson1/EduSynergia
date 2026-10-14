export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string;
  createdAt?: string;
  avatar?: string;
  roleTitle: string; // e.g. "Dyrektor Szkoły", "Wychowawca kl. 3A", "Uczeń", "Rodzic"
  className?: string; // e.g. "3A"
  studentId?: string; // for parent/student
  subjectsTaught?: string[];
}

export interface SystemConfig {
  isInitialized: boolean;
  schoolName: string;
  schoolCity: string;
  academicYear: string;
  semester: 1 | 2;
  adminName: string;
  adminEmail: string;
}

export type GradeCategory = 
  | 'sprawdzian'
  | 'kartkowka'
  | 'odpowiedz'
  | 'praca_klasowa'
  | 'zadanie_domowe'
  | 'aktywnosc'
  | 'projekt';

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  value: string; // "5", "4+", "3-", "6", "np", "+"
  numericValue: number; // for weighted average (e.g. 4.75 for 5-, 4.5 for 4+)
  weight: number; // 1 to 5
  category: GradeCategory;
  date: string; // YYYY-MM-DD
  semester: 1 | 2;
  teacherName: string;
  description: string;
  countToAverage: boolean;
}

export interface Subject {
  id: string;
  name: string;
  shortName: string;
  teacherName: string;
  weeklyHours: number;
}

export type AttendanceStatus = 
  | 'obecny'
  | 'nieobecny'
  | 'usprawiedliwiony'
  | 'spozniony'
  | 'zwolniony';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  lessonHour: number; // 1-8
  subjectName: string;
  status: AttendanceStatus;
  excuseReason?: string;
  excuseStatus?: 'none' | 'pending' | 'accepted' | 'rejected';
  teacherName?: string;
}

export interface TimetableLesson {
  id: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5; // 1=Mon, 5=Fri
  lessonHour: number; // 1-8
  timeStart: string;
  timeEnd: string;
  subjectName: string;
  classroom: string;
  teacherName: string;
  className: string;
  groupName?: string;
  isSubstitution?: boolean;
  substitutionNote?: string;
  originalTeacherName?: string;
  isCancelled?: boolean;
  cancelReason?: string;
  lessonTopic?: string;
  homeworkInfo?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientId: string;
  recipientName: string;
  subject: string;
  content: string;
  date: string; // ISO string or YYYY-MM-DD HH:mm
  isRead: boolean;
  isStarred?: boolean;
  isArchived?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  date: string;
  priority: 'normal' | 'important' | 'urgent';
  targetAudience: string;
  pinned?: boolean;
}

export interface HomeworkTask {
  id: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string;
  className: string;
  teacherName: string;
  type: 'sprawdzian' | 'kartkowka' | 'zadanie_domowe' | 'projekt' | 'inne';
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  numberInJournal: number;
  pesel: string;
  parentName: string;
  parentEmail: string;
}

export interface LessonBell {
  hour: number;
  start: string;
  end: string;
}

export type BehaviorPointType = 'pozytywny' | 'negatywny';

export interface BehaviorPoint {
  id: string;
  studentId: string;
  points: number; // e.g. 15 or -10
  type: BehaviorPointType;
  title: string;
  category: string; // e.g. "Wolontariat", "Udział w konkursie", "Brak pracy domowej", "Aktywność"
  description: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  subjectName?: string;
}

export interface LessonPlusMinus {
  id: string;
  studentId: string;
  subjectId: string;
  type: 'plus' | 'minus';
  date: string;
  teacherName: string;
  note?: string;
}

export type ResetRequestStatus = 'oczekujące' | 'zrealizowane' | 'odrzucone';

export interface PasswordResetRequest {
  id: string;
  fullName: string;
  emailOrLogin: string;
  roleCandidate?: 'uczen' | 'nauczyciel' | 'rodzic';
  className?: string;
  requestDate: string; // YYYY-MM-DD HH:mm
  status: ResetRequestStatus;
  reasonNote?: string;
  adminResponse?: string;
  newTemporaryPassword?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
