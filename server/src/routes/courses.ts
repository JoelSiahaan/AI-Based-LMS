import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest, requireStudent } from '@/middleware/auth';
import { CourseService } from '@/services/courseService';
import { prisma } from '@/server';
import { validateQuery, validateParams } from '@/utils/validation';
import { paginationSchema, idSchema } from '@/utils/validation';
import Joi from 'joi';

const router = Router();
const courseService = new CourseService(prisma);

// Validation schemas
const searchSchema = Joi.object({
  q: Joi.string().min(1).max(100).required(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const progressUpdateSchema = Joi.object({
  completionPercentage: Joi.number().min(0).max(100).required(),
});

// Search courses
router.get('/search', requireStudent, validateQuery(searchSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { q, page, limit } = req.query as any;
    const courses = await courseService.searchCourses(q, page, limit);

    res.json({
      success: true,
      data: courses.data,
      pagination: courses.pagination,
    });
  } catch (error) {
    next(error);
  }
});

// Get course details
router.get('/:id', requireStudent, validateParams(Joi.object({ id: idSchema })), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.getCourseById(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
});

// Get course materials
router.get('/:id/materials', requireStudent, validateParams(Joi.object({ id: idSchema })), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const materials = await courseService.getCourseMaterials(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: materials,
    });
  } catch (error) {
    next(error);
  }
});

// Get course progress
router.get('/:id/progress', requireStudent, validateParams(Joi.object({ id: idSchema })), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const progress = await courseService.getCourseProgress(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
});

// Update lesson progress
router.put('/lessons/:lessonId/progress', requireStudent, validateParams(Joi.object({ lessonId: idSchema })), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { completionPercentage } = req.body;
    const progress = await courseService.updateLessonProgress(
      req.params.lessonId,
      req.user!.id,
      completionPercentage
    );

    res.json({
      success: true,
      data: progress,
      message: 'Progress updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Check prerequisites for a course
router.get('/:id/prerequisites', requireStudent, validateParams(Joi.object({ id: idSchema })), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const canEnroll = await courseService.checkPrerequisites(req.params.id, req.user!.id);

    res.json({
      success: true,
      data: {
        canEnroll,
        message: canEnroll ? 'Prerequisites met' : 'Prerequisites not met',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;