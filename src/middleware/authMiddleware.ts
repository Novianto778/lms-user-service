import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { AuthenticationError } from '../model/errorModel';
import { JWTPayload } from '../types/express';
import { env } from '../config/env';
import { Role } from '@prisma/client';
import { UserActivityManager } from '../utils/userActivity';
import { UserStatusManager } from '../utils/userStatus';

export const authenticateToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('No token provided', StatusCodes.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // Check if user has been idle for too long
    const isActive = await UserActivityManager.checkAndUpdateActivity(decoded.id);
    if (!isActive) {
      throw new AuthenticationError('Session expired due to inactivity', StatusCodes.UNAUTHORIZED);
    }

    // Update online status
    await UserStatusManager.setOnline(decoded.id);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Forward all errors to the global error handler
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token', StatusCodes.UNAUTHORIZED));
    } else {
      next(error);
    }
  }
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        throw new AuthenticationError('Unauthorized access', StatusCodes.FORBIDDEN);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
