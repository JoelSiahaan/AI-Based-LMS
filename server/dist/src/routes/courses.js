"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const courseService_1 = require("@/services/courseService");
const server_1 = require("@/server");
const validation_1 = require("@/utils/validation");
const validation_2 = require("@/utils/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const courseService = new courseService_1.CourseService(server_1.prisma);
const searchSchema = joi_1.default.object({
    q: joi_1.default.string().min(1).max(100).required(),
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(20),
});
const progressUpdateSchema = joi_1.default.object({
    completionPercentage: joi_1.default.number().min(0).max(100).required(),
});
router.get('/search', auth_1.requireStudent, (0, validation_1.validateQuery)(searchSchema), async (req, res, next) => {
    try {
        const { q, page, limit } = req.query;
        const courses = await courseService.searchCourses(q, page, limit);
        res.json({
            success: true,
            data: courses.data,
            pagination: courses.pagination,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', auth_1.requireStudent, (0, validation_1.validateParams)(joi_1.default.object({ id: validation_2.idSchema })), async (req, res, next) => {
    try {
        const course = await courseService.getCourseById(req.params.id, req.user.id);
        res.json({
            success: true,
            data: course,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/materials', auth_1.requireStudent, (0, validation_1.validateParams)(joi_1.default.object({ id: validation_2.idSchema })), async (req, res, next) => {
    try {
        const materials = await courseService.getCourseMaterials(req.params.id, req.user.id);
        res.json({
            success: true,
            data: materials,
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/progress', auth_1.requireStudent, (0, validation_1.validateParams)(joi_1.default.object({ id: validation_2.idSchema })), async (req, res, next) => {
    try {
        const progress = await courseService.getCourseProgress(req.params.id, req.user.id);
        res.json({
            success: true,
            data: progress,
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/lessons/:lessonId/progress', auth_1.requireStudent, (0, validation_1.validateParams)(joi_1.default.object({ lessonId: validation_2.idSchema })), async (req, res, next) => {
    try {
        const { completionPercentage } = req.body;
        const progress = await courseService.updateLessonProgress(req.params.lessonId, req.user.id, completionPercentage);
        res.json({
            success: true,
            data: progress,
            message: 'Progress updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id/prerequisites', auth_1.requireStudent, (0, validation_1.validateParams)(joi_1.default.object({ id: validation_2.idSchema })), async (req, res, next) => {
    try {
        const canEnroll = await courseService.checkPrerequisites(req.params.id, req.user.id);
        res.json({
            success: true,
            data: {
                canEnroll,
                message: canEnroll ? 'Prerequisites met' : 'Prerequisites not met',
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=courses.js.map