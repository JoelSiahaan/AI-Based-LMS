"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRedisClient = exports.testPrisma = void 0;
exports.createTestStudent = createTestStudent;
exports.createTestTeacher = createTestTeacher;
exports.createTestCourse = createTestCourse;
const client_1 = require("@prisma/client");
const redis_1 = require("redis");
exports.testPrisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
    },
});
exports.testRedisClient = (0, redis_1.createClient)({
    url: process.env.TEST_REDIS_URL || process.env.REDIS_URL,
});
beforeAll(async () => {
    await exports.testPrisma.$connect();
    await exports.testRedisClient.connect();
    await cleanupDatabase();
});
afterAll(async () => {
    await cleanupDatabase();
    await exports.testPrisma.$disconnect();
    await exports.testRedisClient.quit();
});
beforeEach(async () => {
    await cleanupDatabase();
});
async function cleanupDatabase() {
    await exports.testPrisma.auditLog.deleteMany();
    await exports.testPrisma.notification.deleteMany();
    await exports.testPrisma.notificationPreference.deleteMany();
    await exports.testPrisma.bookmark.deleteMany();
    await exports.testPrisma.progress.deleteMany();
    await exports.testPrisma.message.deleteMany();
    await exports.testPrisma.grade.deleteMany();
    await exports.testPrisma.uploadedFile.deleteMany();
    await exports.testPrisma.submission.deleteMany();
    await exports.testPrisma.assignment.deleteMany();
    await exports.testPrisma.material.deleteMany();
    await exports.testPrisma.lesson.deleteMany();
    await exports.testPrisma.module.deleteMany();
    await exports.testPrisma.enrollment.deleteMany();
    await exports.testPrisma.course.deleteMany();
    await exports.testPrisma.teacher.deleteMany();
    await exports.testPrisma.student.deleteMany();
    await exports.testRedisClient.flushDb();
}
async function createTestStudent(overrides = {}) {
    return exports.testPrisma.student.create({
        data: {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'Student',
            studentId: 'TEST001',
            passwordHash: '$2a$12$test.hash.for.testing.purposes.only',
            ...overrides,
        },
    });
}
async function createTestTeacher(overrides = {}) {
    return exports.testPrisma.teacher.create({
        data: {
            email: 'teacher@example.com',
            firstName: 'Test',
            lastName: 'Teacher',
            teacherId: 'TEACH001',
            passwordHash: '$2a$12$test.hash.for.testing.purposes.only',
            ...overrides,
        },
    });
}
async function createTestCourse(teacherId, overrides = {}) {
    return exports.testPrisma.course.create({
        data: {
            title: 'Test Course',
            description: 'A test course',
            courseCode: 'TEST101',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            teacherId,
            ...overrides,
        },
    });
}
//# sourceMappingURL=setup.js.map