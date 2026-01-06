import { PrismaClient } from '@prisma/client';
import { Course, Module, Progress, PaginatedResponse } from '@/types';
export declare class CourseService {
    private prisma;
    constructor(prisma: PrismaClient);
    getCourseById(id: string, studentId?: string): Promise<Course & {
        modules?: Module[];
    }>;
    getCourseProgress(courseId: string, studentId: string): Promise<Progress[]>;
    updateLessonProgress(lessonId: string, studentId: string, completionPercentage: number): Promise<Progress>;
    private updateCourseProgress;
    getCourseMaterials(courseId: string, studentId: string): Promise<any[]>;
    searchCourses(query: string, page?: number, limit?: number): Promise<PaginatedResponse<Course>>;
    checkPrerequisites(courseId: string, studentId: string): Promise<boolean>;
}
//# sourceMappingURL=courseService.d.ts.map