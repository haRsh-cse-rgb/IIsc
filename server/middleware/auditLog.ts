import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import { AuditLog } from '../models/AuditLog.js';

export const createAuditLog = (action: string, resourceType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any) {
      if (req.user && res.statusCode >= 200 && res.statusCode < 300) {
        const resourceId = body?.id || body?._id || req.params.id || 'unknown';

        AuditLog.create({
          userId: req.user.userId,
          action,
          resourceType,
          resourceId: String(resourceId),
          changes: req.body || {},
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }).catch(err => console.error('Audit log error:', err));
      }

      return originalJson(body);
    };

    next();
  };
};
