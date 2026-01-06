import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireStudent } from '@/middleware/auth';
import { StudentService } from '@/services/studentService';
import { prisma } from '@/server';
import { validate, validateQuery } from '@/utils/validation';
import { nameSchema, emailSchema, studentIdSchema, paginationSchema } from '@/utils/validation';
import Joi from 'joi';

const router = Router();
const studentService = new StudentService(prisma);

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  studentId: studentIdSchema.optional(),
});

// Get student profile
router.get('/profile', requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const student = await studentService.getStudentById(req.user!.id);
    
    if (!student) {
      res.status(404).json({
        error: {
          code: 'StudentNotFound',
          message: 'Student profile not found',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
});

// Update student profile
router.put('/profile', requireStudent, validate(updateProfileSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const updatedStudent = await studentService.updateStudent(req.user!.id, req.body);

    res.json({
      success: true,
      data: updatedStudent,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get enrolled courses
router.get('/courses', requireStudent, validateQuery(paginationSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query as any;
    const courses = await studentService.getEnrolledCourses(req.user!.id, page, limit);

    res.json({
      success: true,
      data: courses.data,
      pagination: courses.pagination,
    });
  } catch (error) {
    next(error);
  }
});

// Enroll in course
router.post('/courses/:courseId/enroll', requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await studentService.enrollInCourse(req.user!.id, req.params.courseId);

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
    });
  } catch (error) {
    next(error);
  }
});

// Unenroll from course
router.delete('/courses/:courseId/enroll', requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await studentService.unenrollFromCourse(req.user!.id, req.params.courseId);

    res.json({
      success: true,
      message: 'Successfully unenrolled from course',
    });
  } catch (error) {
    next(error);
  }
});

// Get GPA
router.get('/gpa', requireStudent, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const gpa = await studentService.calculateGPA(req.user!.id);

    res.json({
      success: true,
      data: {
        gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
        scale: '4.0',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;