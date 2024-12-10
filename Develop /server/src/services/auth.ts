import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

export const authenticateToken = (authHeader?: string) => {
  if (!authHeader) {
    throw new Error('Unauthorized');
  }

  const token = authHeader.split(' ')[1];
  const secretKey = process.env.JWT_SECRET_KEY || '';

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    return decoded; // Return user payload
  } catch (err) {
    throw new Error('Forbidden');
  }
};

// GraphQL Context Setup
export const contextMiddleware = ({ req }: { req: Request }) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const user = authenticateToken(authHeader);
    return { user }; // Attach user to the context
  }

  return {};
};

// Token Sign Function (Unchanged)
export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
