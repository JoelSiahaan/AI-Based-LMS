import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

// Test database setup
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

export const testRedisClient = createClient({
  url: process.env.TEST_REDIS_URL || process.env.REDIS_URL,
});

// Setup function to run before all tests
beforeAll(async () => {
  // Connect to test database
  await testPrisma.$connect();
  
  // Connect to test Redis
  await testRedisClient.connect();
  
  // Clean up test database
  await cleanupDatabase();
});

// Cleanup function to run after all tests
afterAll(async () => {
  // Clean up test database
  await cleanupDatabase();
  
  // Disconnect from test database
  await testPrisma.$disconnect();
  
  // Disconnect from test Redis
  await testRedisClient.quit();
});

// Clean up database before each test
beforeEach(async () => {
  await cleanupDatabase();
});

// Helper function to clean up test database
async function cleanupDatabase() {
  // Delete all records in reverse dependency order
  await testPrisma.auditLog.deleteMany();
  await testPrisma.notification.deleteMany();
  await testPrisma.notificationPreference.deleteMany();
  await testPrisma.bookmark.deleteMany();
  await testPrisma.progress.deleteMany();
  await testPrisma.message.deleteMany();
  await testPrisma.grade.deleteMany();
  await testPrisma.uploadedFile.deleteMany();
  await testPrisma.submission.deleteMany();
  await testPrisma.assignment.deleteMany();
  await testPrisma.material.deleteMany();
  await testPrisma.lesson.deleteMany();
  await testPrisma.module.deleteMany();
  await testPrisma.enrollment.deleteMany();
  await testPrisma.course.deleteMany();
  await testPrisma.teacher.deleteMany();
  await testPrisma.student.deleteMany();
  
  // Clear Redis test data
  await testRedisClient.flushDb();
}

// Helper function to create test student
export async function createTestStudent(overrides: any = {}) {
  return testPrisma.student.create({
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

// Helper function to create test teacher
export async function createTestTeacher(overrides: any = {}) {
  return testPrisma.teacher.create({
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

// Helper function to create test course
export async function createTestCourse(teacherId: string, overrides: any = {}) {
  return testPrisma.course.create({
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