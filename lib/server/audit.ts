import { NextRequest, NextResponse } from 'next/server';
import { AuditLog } from './models/AuditLog';
import { TokenPayload } from './jwt';

export const createAuditLog = async (
  request: NextRequest,
  response: NextResponse,
  user: TokenPayload | null,
  action: string,
  resourceType: string,
  resourceId: string,
  changes: any
) => {
  if (user && response.status >= 200 && response.status < 300) {
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';

      await AuditLog.create({
        userId: user.userId,
        action,
        resourceType,
        resourceId,
        changes,
        ipAddress,
        userAgent
      });
    } catch (err) {
      console.error('Audit log error:', err);
    }
  }
};

