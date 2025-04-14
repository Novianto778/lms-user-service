import { Role } from '@prisma/client';
import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateMiddleware';
import { getUserByIdParamsSchema } from './user.schema';
import { userController } from './user.controller';

const router = Router();

// // Auth routes
// router.post(
//   '/auth/register',
//   validateRequest({
//     body: registerUserSchema,
//   }),
//   userController.register,
// );

// router.post(
//   '/auth/login',
//   validateRequest({
//     body: loginUserSchema,
//   }),
//   userController.login,
// );

// User routes
router.get('/', authenticateToken, authorizeRoles(Role.admin), userController.getAllUsers);

router.get('/me', authenticateToken, userController.getProfile);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles(Role.admin),
  validateRequest({
    params: getUserByIdParamsSchema,
  }),
  userController.getUserById,
);

router.get('/:id/status', authenticateToken, userController.getUserStatus);
router.post('/status/bulk', authenticateToken, userController.getBulkUserStatus);

export default router;
