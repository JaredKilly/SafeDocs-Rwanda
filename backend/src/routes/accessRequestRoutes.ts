import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  submitAccessRequest,
  getPendingRequests,
  getMyRequests,
  approveRequest,
  denyRequest,
} from '../controllers/accessRequestController';

const router = Router();

router.use(authenticate);

router.post('/', submitAccessRequest);
router.get('/pending', getPendingRequests);
router.get('/mine', getMyRequests);
router.patch('/:id/approve', approveRequest);
router.patch('/:id/deny', denyRequest);

export default router;
