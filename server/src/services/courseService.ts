import { PrismaClient } from '@prisma/client';
import { Course, Module, Lesson, Progress, PaginatedResponse } from '@/types';
import { NotFoundError, AuthorizationError } from '@/middleware/errorHandler';

export class CourseService {
  constructor(private prisma: PrismaClient) {}

  async getCourseById(id: string, studentId?: string): Promise<Course & { modules?: Module[] }> {
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
      throw new NotFoundError('Course not found');
    }

    // Check if student is enrolled (if studentId provided)
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
        throw new AuthorizationError('Not enrolled in this course');
      }
    }

    return course;
  }

  async getCourseProgress(courseId: string, studentId: string): Promise<Progress[]> {
    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment || !enrollment.isActive) {
      throw new AuthorizationError('Not enrolled in this course');
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

  async updateLessonProgress(
    lessonId: string,
    studentId: string,
    completionPercentage: number
  ): Promise<Progress> {
    // Get lesson and course info
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
      throw new NotFoundError('Lesson not found');
    }

    const courseId = lesson.module.courseId;

    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment || !enrollment.isActive) {
      throw new AuthorizationError('Not enrolled in this course');
    }

    // Update lesson progress
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

    // Update overall course progress
    await this.updateCourseProgress(courseId, studentId);

    return progress;
  }

  private async updateCourseProgress(courseId: string, studentId: string): Promise<void> {
    // Get all lessons in the course
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

    // Get progress for all lessons
    const lessonProgress = await this.prisma.progress.findMany({
      where: {
        studentId,
        courseId,
        lessonId: {
          not: null,
        },
      },
    });

    // Calculate overall progress
    const totalLessons = lessons.length;
    const completedLessons = lessonProgress.filter(p => p.completionPercentage >= 100).length;
    const overallProgress = (completedLessons / totalLessons) * 100;

    // Update course progress
    await this.prisma.progress.upsert({
      where: {
        studentId_courseId_lessonId: {
          studentId,
          courseId,
          lessonId: null as any,
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
        lessonId: null as any,
        completionPercentage: overallProgress,
        lastAccessed: new Date(),
        completedAt: overallProgress >= 100 ? new Date() : null,
      },
    });
  }

  async getCourseMaterials(courseId: string, studentId: string): Promise<any[]> {
    // Check enrollment
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId,
        },
      },
    });

    if (!enrollment || !enrollment.isActive) {
      throw new AuthorizationError('Not enrolled in this course');
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

  async searchCourses(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Course>> {
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

  async checkPrerequisites(courseId: string, studentId: string): Promise<boolean> {
    // For now, we'll implement a simple prerequisite system
    // In a real system, you might have a prerequisites table
    
    // This is a placeholder implementation
    // You could extend this to check specific prerequisite courses
    return true;
  }
}