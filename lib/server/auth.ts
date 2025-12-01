import { NextRequest } from 'next/server';
import { verifyToken, TokenPayload } from './jwt';

export interface AuthRequest extends NextRequest {
  user?: TokenPayload;
}

export const getAuthUser = (request: NextRequest): TokenPayload | null => {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    return payload;
  } catch (error) {
    return null;
  }
};

export const requireAuth = (request: NextRequest): TokenPayload => {
  const user = getAuthUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
};

export const requireRole = (request: NextRequest, ...allowedRoles: string[]): TokenPayload => {
  const user = requireAuth(request);
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
};

