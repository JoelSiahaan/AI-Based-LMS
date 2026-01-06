import { Router } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

// Placeholder routes for grades
// These will be implemented in later tasks

router.get('/', (req: AuthenticatedRequest, res) => {
  res.json({ message: 'List grades endpoint - to be implemented' });
});

router.get('/gpa', (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Calculate GPA endpoint - to be implemented' });
});

export default router;