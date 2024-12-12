import { Types } from 'mongoose';

export interface BookInput {
  authors: string[];
  description: string;
  title: string;
  bookId: string;
  image?: string;
  link?: string;
}

export interface DbUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  isCorrectPassword(password: string): Promise<boolean>;
  savedBooks: BookInput[];
  bookCount: number;
}

export interface UserContext {
  _id: string;
  email: string;
  username: string;
}

export interface Context {
  user?: UserContext | null;
}