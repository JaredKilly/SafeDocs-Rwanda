import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getProfile,
  updateProfile,
  changePassword,
  searchUsers,
  getAllUsers,
  createUser,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
} from '../controllers/userController';

const router = Router();

// User profile routes (authenticated users)
router.get('/search', authenticate, searchUsers);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);

// Admin routes (admin only)
router.get('/all', authenticate, authorize('admin'), getAllUsers);
router.post('/', authenticate, authorize('admin'), createUser);
router.put('/:userId/role', authenticate, authorize('admin'), updateUserRole);
router.patch('/:userId/toggle-status', authenticate, authorize('admin'), toggleUserStatus);
router.delete('/:userId', authenticate, authorize('admin'), deleteUser);

export default router;
