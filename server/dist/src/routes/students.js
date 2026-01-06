"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const studentService_1 = require("@/services/studentService");
const server_1 = require("@/server");
const validation_1 = require("@/utils/validation");
const validation_2 = require("@/utils/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const studentService = new studentService_1.StudentService(server_1.prisma);
const updateProfileSchema = joi_1.default.object({
    firstName: validation_2.nameSchema.optional(),
    lastName: validation_2.nameSchema.optional(),
    email: validation_2.emailSchema.optional(),
    studentId: validation_2.studentIdSchema.optional(),
});
router.get('/profile', auth_1.requireStudent, async (req, res, next) => {
    try {
        const student = await studentService.getStudentById(req.user.id);
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
    }
    catch (error) {
        next(error);
    }
});
router.put('/profile', auth_1.requireStudent, (0, validation_1.validate)(updateProfileSchema), async (req, res, next) => {
    try {
        const updatedStudent = await studentService.updateStudent(req.user.id, req.body);
        res.json({
            success: true,
            data: updatedStudent,
            message: 'Profile updated successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/courses', auth_1.requireStudent, (0, validation_1.validateQuery)(validation_2.paginationSchema), async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const courses = await studentService.getEnrolledCourses(req.user.id, page, limit);
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
router.post('/courses/:courseId/enroll', auth_1.requireStudent, async (req, res, next) => {
    try {
        await studentService.enrollInCourse(req.user.id, req.params.courseId);
        res.json({
            success: true,
            message: 'Successfully enrolled in course',
        });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/courses/:courseId/enroll', auth_1.requireStudent, async (req, res, next) => {
    try {
        await studentService.unenrollFromCourse(req.user.id, req.params.courseId);
        res.json({
            success: true,
            message: 'Successfully unenrolled from course',
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/gpa', auth_1.requireStudent, async (req, res, next) => {
    try {
        const gpa = await studentService.calculateGPA(req.user.id);
        res.json({
            success: true,
            data: {
                gpa: Math.round(gpa * 100) / 100,
                scale: '4.0',
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=students.js.map