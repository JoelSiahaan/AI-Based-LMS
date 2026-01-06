import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test teacher
  const teacher = await prisma.teacher.create({
    data: {
      email: 'teacher@example.com',
      firstName: 'John',
      lastName: 'Smith',
      teacherId: 'TEACH001',
      passwordHash: await hashPassword('Teacher123!'),
    },
  });

  console.log('✅ Created teacher:', teacher.email);

  // Create test courses
  const mathCourse = await prisma.course.create({
    data: {
      title: 'Mathematics 101',
      description: 'Introduction to basic mathematics concepts',
      courseCode: 'MATH101',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15'),
      teacherId: teacher.id,
    },
  });

  const englishCourse = await prisma.course.create({
    data: {
      title: 'English Literature',
      description: 'Exploring classic and modern literature',
      courseCode: 'ENG201',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15'),
      teacherId: teacher.id,
    },
  });

  console.log('✅ Created courses:', mathCourse.title, englishCourse.title);

  // Create modules for Math course
  const mathModule1 = await prisma.module.create({
    data: {
      title: 'Algebra Basics',
      description: 'Introduction to algebraic concepts',
      order: 1,
      courseId: mathCourse.id,
    },
  });

  const mathModule2 = await prisma.module.create({
    data: {
      title: 'Geometry Fundamentals',
      description: 'Basic geometric shapes and calculations',
      order: 2,
      courseId: mathCourse.id,
    },
  });

  // Create lessons for Math modules
  await prisma.lesson.create({
    data: {
      title: 'Introduction to Variables',
      content: 'Learn about variables and their uses in algebra.',
      order: 1,
      estimatedDuration: 30,
      moduleId: mathModule1.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Solving Linear Equations',
      content: 'Step-by-step guide to solving linear equations.',
      order: 2,
      estimatedDuration: 45,
      moduleId: mathModule1.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Basic Shapes',
      content: 'Understanding circles, triangles, and rectangles.',
      order: 1,
      estimatedDuration: 25,
      moduleId: mathModule2.id,
    },
  });

  // Create modules for English course
  const englishModule1 = await prisma.module.create({
    data: {
      title: 'Poetry Analysis',
      description: 'Understanding and analyzing poetry',
      order: 1,
      courseId: englishCourse.id,
    },
  });

  await prisma.lesson.create({
    data: {
      title: 'Introduction to Poetry',
      content: 'Basic elements of poetry including rhythm, rhyme, and meter.',
      order: 1,
      estimatedDuration: 40,
      moduleId: englishModule1.id,
    },
  });

  // Create assignments
  await prisma.assignment.create({
    data: {
      title: 'Algebra Practice Problems',
      description: 'Complete the attached worksheet with algebra problems.',
      dueDate: new Date('2024-02-15'),
      maxPoints: 100,
      allowedFileTypes: ['pdf', 'doc', 'docx'],
      maxFileSize: 5242880, // 5MB
      courseId: mathCourse.id,
    },
  });

  await prisma.assignment.create({
    data: {
      title: 'Poetry Analysis Essay',
      description: 'Write a 500-word analysis of your chosen poem.',
      dueDate: new Date('2024-02-20'),
      maxPoints: 100,
      allowedFileTypes: ['pdf', 'doc', 'docx'],
      maxFileSize: 5242880, // 5MB
      courseId: englishCourse.id,
    },
  });

  console.log('✅ Created modules, lessons, and assignments');

  // Create a test student (optional - for testing)
  const testStudent = await prisma.student.create({
    data: {
      email: 'student@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      studentId: 'STU001',
      passwordHash: await hashPassword('Student123!'),
    },
  });

  // Create notification preferences for test student
  await prisma.notificationPreference.create({
    data: {
      studentId: testStudent.id,
    },
  });

  // Enroll test student in courses
  await prisma.enrollment.create({
    data: {
      studentId: testStudent.id,
      courseId: mathCourse.id,
    },
  });

  await prisma.enrollment.create({
    data: {
      studentId: testStudent.id,
      courseId: englishCourse.id,
    },
  });

  // Create initial progress records
  await prisma.progress.create({
    data: {
      studentId: testStudent.id,
      courseId: mathCourse.id,
      completionPercentage: 25,
      lastAccessed: new Date(),
    },
  });

  await prisma.progress.create({
    data: {
      studentId: testStudent.id,
      courseId: englishCourse.id,
      completionPercentage: 10,
      lastAccessed: new Date(),
    },
  });

  console.log('✅ Created test student and enrollments');
  console.log('🎉 Database seed completed successfully!');
  console.log('');
  console.log('Test accounts created:');
  console.log('📧 Teacher: teacher@example.com / Teacher123!');
  console.log('📧 Student: student@example.com / Student123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });