import { Router } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

// Placeholder routes for messages
// These will be implemented in later tasks

router.get('/', (req: AuthenticatedRequest, res) => {
  res.json({ message: 'List messages endpoint - to be implemented' });
});

router.post('/', (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Send message endpoint - to be implemented' });
});

export default router;