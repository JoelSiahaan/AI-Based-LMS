// Core type definitions for the Student LMS

export interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface Teacher {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  teacherId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  courseCode: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  courseId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  estimatedDuration: number;
  moduleId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  maxPoints: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  courseId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: Date;
  isLate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  submissionId: string;
  points: number;
  maxPoints: number;
  feedback?: string;
  gradedAt: Date;
  gradedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Progress {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string | null;
  completionPercentage: number;
  lastAccessed: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum NotificationType {
  ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
  GRADE_POSTED = 'GRADE_POSTED',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  COURSE_UPDATE = 'COURSE_UPDATE',
}

export enum MaterialType {
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  LINK = 'LINK',
  INTERACTIVE = 'INTERACTIVE',
  QUIZ = 'QUIZ',
}

export enum MessageType {
  DIRECT = 'DIRECT',
  FORUM = 'FORUM',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterStudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    studentId?: string;
    teacherId?: string;
    type: 'student' | 'teacher';
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Course enrollment types
export interface EnrollmentRequest {
  courseId: string;
}

export interface CourseWithProgress extends Course {
  progress: Progress | null;
  enrollment?: {
    enrolledAt: Date;
    isActive: boolean;
  };
}

// Assignment submission types
export interface SubmissionRequest {
  assignmentId: string;
  files: any[];
}

export interface SubmissionWithFiles extends Submission {
  files: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    storageUrl: string;
  }[];
  grade?: Grade;
}