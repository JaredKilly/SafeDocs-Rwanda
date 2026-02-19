import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { joinWaitlist } from '../controllers/waitlistController';

const router = Router();

const waitlistLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 signups per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', waitlistLimiter, joinWaitlist);

export default router;
