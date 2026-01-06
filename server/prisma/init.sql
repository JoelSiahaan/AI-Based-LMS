-- Initial database setup
-- This file is run when the PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just examples of what we might need

-- Performance indexes for common queries
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_email ON students(email);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_students_student_id ON students(student_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_enrollments_student_course ON enrollments(student_id, course_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_assignments_course_due_date ON assignments(course_id, due_date);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_submissions_assignment_student ON submissions(assignment_id, student_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_progress_student_course ON progress(student_id, course_id);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at);
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at);

-- Initial admin user will be created by seed script