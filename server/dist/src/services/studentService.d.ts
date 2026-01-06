import { PrismaClient } from '@prisma/client';
import { Student, CourseWithProgress, PaginatedResponse } from '@/types';
export declare class StudentService {
    private prisma;
    constructor(prisma: PrismaClient);
    getStudentById(id: string): Promise<Student | null>;
    getStudentByEmail(email: string): Promise<Student | null>;
    getStudentByStudentId(studentId: string): Promise<Student | null>;
    updateStudent(id: string, data: Partial<Student>): Promise<Student>;
    getEnrolledCourses(studentId: string, page?: number, limit?: number): Promise<PaginatedResponse<CourseWithProgress>>;
    enrollInCourse(studentId: string, courseId: string): Promise<void>;
    unenrollFromCourse(studentId: string, courseId: string): Promise<void>;
    calculateGPA(studentId: string): Promise<number>;
    private percentageToGradePoints;
}
//# sourceMappingURL=studentService.d.ts.map