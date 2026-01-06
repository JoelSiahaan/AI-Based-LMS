"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const errorHandler_1 = require("@/middleware/errorHandler");
class CourseService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCourseById(id, studentId) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                modules: {
                    where: { isActive: true },
                    include: {
                        lessons: {
                            where: { isActive: true },
                            orderBy: { order: 'asc' },
                        },
                    },
                    orderBy: { order: 'asc' },
                },
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!course || !course.isActive) {
            throw new errorHandler_1.NotFoundError('Course not found');
        }
        if (studentId) {
            const enrollment = await this.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId,
                        courseId: id,
                    },
                },
            });
            if (!enrollment || !enrollment.isActive) {
                throw new errorHandler_1.AuthorizationError('Not enrolled in this course');
            }
        }
        return course;
    }
    async getCourseProgress(courseId, studentId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });
        if (!enrollment || !enrollment.isActive) {
            throw new errorHandler_1.AuthorizationError('Not enrolled in this course');
        }
        const progress = await this.prisma.progress.findMany({
            where: {
                studentId,
                courseId,
            },
            include: {
                lesson: {
                    select: {
                        title: true,
                        moduleId: true,
                    },
                },
            },
            orderBy: {
                lastAccessed: 'desc',
            },
        });
        return progress;
    }
    async updateLessonProgress(lessonId, studentId, completionPercentage) {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                module: {
                    select: {
                        courseId: true,
                    },
                },
            },
        });
        if (!lesson) {
            throw new errorHandler_1.NotFoundError('Lesson not found');
        }
        const courseId = lesson.module.courseId;
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });
        if (!enrollment || !enrollment.isActive) {
            throw new errorHandler_1.AuthorizationError('Not enrolled in this course');
        }
        const progress = await this.prisma.progress.upsert({
            where: {
                studentId_courseId_lessonId: {
                    studentId,
                    courseId,
                    lessonId,
                },
            },
            update: {
                completionPercentage,
                lastAccessed: new Date(),
                completedAt: completionPercentage >= 100 ? new Date() : null,
            },
            create: {
                studentId,
                courseId,
                lessonId,
                completionPercentage,
                lastAccessed: new Date(),
                completedAt: completionPercentage >= 100 ? new Date() : null,
            },
        });
        await this.updateCourseProgress(courseId, studentId);
        return progress;
    }
    async updateCourseProgress(courseId, studentId) {
        const lessons = await this.prisma.lesson.findMany({
            where: {
                module: {
                    courseId,
                },
                isActive: true,
            },
        });
        if (lessons.length === 0) {
            return;
        }
        const lessonProgress = await this.prisma.progress.findMany({
            where: {
                studentId,
                courseId,
                lessonId: {
                    not: null,
                },
            },
        });
        const totalLessons = lessons.length;
        const completedLessons = lessonProgress.filter(p => p.completionPercentage >= 100).length;
        const overallProgress = (completedLessons / totalLessons) * 100;
        await this.prisma.progress.upsert({
            where: {
                studentId_courseId_lessonId: {
                    studentId,
                    courseId,
                    lessonId: null,
                },
            },
            update: {
                completionPercentage: overallProgress,
                lastAccessed: new Date(),
                completedAt: overallProgress >= 100 ? new Date() : null,
            },
            create: {
                studentId,
                courseId,
                completionPercentage: overallProgress,
                lastAccessed: new Date(),
                completedAt: overallProgress >= 100 ? new Date() : null,
            },
        });
    }
    async getCourseMaterials(courseId, studentId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });
        if (!enrollment || !enrollment.isActive) {
            throw new errorHandler_1.AuthorizationError('Not enrolled in this course');
        }
        const materials = await this.prisma.material.findMany({
            where: {
                lesson: {
                    module: {
                        courseId,
                    },
                },
                isActive: true,
            },
            include: {
                lesson: {
                    select: {
                        title: true,
                        module: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
            },
            orderBy: [
                { lesson: { module: { order: 'asc' } } },
                { lesson: { order: 'asc' } },
                { order: 'asc' },
            ],
        });
        return materials;
    }
    async searchCourses(query, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { courseCode: { contains: query, mode: 'insensitive' } },
                    ],
                },
                include: {
                    teacher: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                    _count: {
                        select: {
                            enrollments: {
                                where: { isActive: true },
                            },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    title: 'asc',
                },
            }),
            this.prisma.course.count({
                where: {
                    isActive: true,
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } },
                        { courseCode: { contains: query, mode: 'insensitive' } },
                    ],
                },
            }),
        ]);
        return {
            data: courses,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async checkPrerequisites(courseId, studentId) {
        return true;
    }
}
exports.CourseService = CourseService;
//# sourceMappingURL=courseService.js.map