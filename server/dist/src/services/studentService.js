"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const errorHandler_1 = require("@/middleware/errorHandler");
class StudentService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStudentById(id) {
        const student = await this.prisma.student.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                studentId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
            },
        });
        return student;
    }
    async getStudentByEmail(email) {
        const student = await this.prisma.student.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                studentId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
            },
        });
        return student;
    }
    async getStudentByStudentId(studentId) {
        const student = await this.prisma.student.findUnique({
            where: { studentId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                studentId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
            },
        });
        return student;
    }
    async updateStudent(id, data) {
        const existingStudent = await this.prisma.student.findUnique({
            where: { id },
        });
        if (!existingStudent) {
            throw new errorHandler_1.NotFoundError('Student not found');
        }
        if (data.email && data.email !== existingStudent.email) {
            const emailExists = await this.prisma.student.findUnique({
                where: { email: data.email },
            });
            if (emailExists) {
                throw new errorHandler_1.ConflictError('Email already exists');
            }
        }
        if (data.studentId && data.studentId !== existingStudent.studentId) {
            const studentIdExists = await this.prisma.student.findUnique({
                where: { studentId: data.studentId },
            });
            if (studentIdExists) {
                throw new errorHandler_1.ConflictError('Student ID already exists');
            }
        }
        const updatedStudent = await this.prisma.student.update({
            where: { id },
            data: {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                studentId: data.studentId,
                isActive: data.isActive,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                studentId: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                lastLoginAt: true,
            },
        });
        return updatedStudent;
    }
    async getEnrolledCourses(studentId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [enrollments, total] = await Promise.all([
            this.prisma.enrollment.findMany({
                where: {
                    studentId,
                    isActive: true,
                },
                include: {
                    course: {
                        include: {
                            teacher: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    enrolledAt: 'desc',
                },
            }),
            this.prisma.enrollment.count({
                where: {
                    studentId,
                    isActive: true,
                },
            }),
        ]);
        const coursesWithProgress = await Promise.all(enrollments.map(async (enrollment) => {
            const progress = await this.prisma.progress.findFirst({
                where: {
                    studentId,
                    courseId: enrollment.courseId,
                    lessonId: null,
                },
            });
            return {
                ...enrollment.course,
                progress,
                enrollment: {
                    enrolledAt: enrollment.enrolledAt,
                    isActive: enrollment.isActive,
                },
            };
        }));
        return {
            data: coursesWithProgress,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async enrollInCourse(studentId, courseId) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course || !course.isActive) {
            throw new errorHandler_1.NotFoundError('Course not found or inactive');
        }
        const existingEnrollment = await this.prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });
        if (existingEnrollment && existingEnrollment.isActive) {
            throw new errorHandler_1.ConflictError('Already enrolled in this course');
        }
        await this.prisma.enrollment.upsert({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
            update: {
                isActive: true,
                enrolledAt: new Date(),
            },
            create: {
                studentId,
                courseId,
                isActive: true,
            },
        });
        await this.prisma.progress.upsert({
            where: {
                studentId_courseId_lessonId: {
                    studentId,
                    courseId,
                    lessonId: null,
                },
            },
            update: {
                lastAccessed: new Date(),
            },
            create: {
                studentId,
                courseId,
                completionPercentage: 0,
                lastAccessed: new Date(),
            },
        });
    }
    async unenrollFromCourse(studentId, courseId) {
        const enrollment = await this.prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });
        if (!enrollment || !enrollment.isActive) {
            throw new errorHandler_1.NotFoundError('Enrollment not found');
        }
        await this.prisma.enrollment.update({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
            data: {
                isActive: false,
            },
        });
    }
    async calculateGPA(studentId) {
        const grades = await this.prisma.grade.findMany({
            where: {
                studentId,
            },
            include: {
                assignment: {
                    select: {
                        maxPoints: true,
                    },
                },
            },
        });
        if (grades.length === 0) {
            return 0;
        }
        let totalWeightedPoints = 0;
        let totalMaxPoints = 0;
        grades.forEach((grade) => {
            const percentage = (grade.points / grade.maxPoints) * 100;
            const gradePoints = this.percentageToGradePoints(percentage);
            totalWeightedPoints += gradePoints * grade.assignment.maxPoints;
            totalMaxPoints += grade.assignment.maxPoints;
        });
        return totalMaxPoints > 0 ? totalWeightedPoints / totalMaxPoints : 0;
    }
    percentageToGradePoints(percentage) {
        if (percentage >= 97)
            return 4.0;
        if (percentage >= 93)
            return 3.7;
        if (percentage >= 90)
            return 3.3;
        if (percentage >= 87)
            return 3.0;
        if (percentage >= 83)
            return 2.7;
        if (percentage >= 80)
            return 2.3;
        if (percentage >= 77)
            return 2.0;
        if (percentage >= 73)
            return 1.7;
        if (percentage >= 70)
            return 1.3;
        if (percentage >= 67)
            return 1.0;
        if (percentage >= 65)
            return 0.7;
        return 0.0;
    }
}
exports.StudentService = StudentService;
//# sourceMappingURL=studentService.js.map