import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  updateMemberRole
} from '../controllers/groupController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Group CRUD
router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:id', getGroupById);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Member management
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.put('/:id/members/:userId/role', updateMemberRole);

export default router;
