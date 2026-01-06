import { Router } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

// Placeholder routes for notifications
// These will be implemented in later tasks

router.get('/', (req: AuthenticatedRequest, res) => {
  res.json({ message: 'List notifications endpoint - to be implemented' });
});

router.put('/:id/read', (req: AuthenticatedRequest, res) => {
  res.json({ message: 'Mark notification as read endpoint - to be implemented' });
});

export default router;