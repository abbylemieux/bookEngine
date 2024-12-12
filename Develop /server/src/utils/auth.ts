import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import type { ExpressContextFunctionArgument } from '@apollo/server/express4';

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED'
      }
    });
  }
}

interface TokenUser {
  _id: string;
  email: string;
  username: string;
}

export const authMiddleware = async ({ req }: ExpressContextFunctionArgument) => {
  // Allow specific mutations without auth
  const publicOperations = ['login', 'addUser'];
  const operationName = req.body?.operationName;

  if (publicOperations.includes(operationName)) {
    return {};
  }

  let token = req.body?.token || req.query?.token || req.headers?.authorization;

  if (req.headers?.authorization) {
    token = token.split(' ').pop()?.trim();
  }

  if (!token) {
    return {};
  }

  try {
    const { data } = jwt.verify(token, process.env.JWT_SECRET || 'mysecretsshhhhh') as { data: TokenUser };
    return { user: data };
  } catch (error) {
    console.error('Token verification error:', error);
    return {};
  }
};

export const signToken = ({ username, email, _id }: TokenUser): string => {
  const payload = { username, email, _id };
  return jwt.sign({ data: payload }, process.env.JWT_SECRET || 'mysecretsshhhhh', { expiresIn: '2h' });
};