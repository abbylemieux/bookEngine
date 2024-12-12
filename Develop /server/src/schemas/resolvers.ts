import { GraphQLError } from 'graphql';
import { Types } from 'mongoose';
import { User } from '../models/index.js';
import { signToken } from '../utils/auth.js';

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: { user?: { _id: string } }) => {
      try {
        if (context.user) {
          const user = await User.findOne({ _id: new Types.ObjectId(context.user._id) });
          console.log('Found user:', user);
          return user;
        }
        throw new GraphQLError('Not logged in');
      } catch (error) {
        console.error('Error in me query:', error);
        throw error;
      }
    },
  },

  Mutation: {
    addUser: async (_: unknown, { username, email, password }: { username: string; email: string; password: string }) => {
      try {
        console.log('Creating user:', { username, email });
        const user = await User.create({ username, email, password });
        const token = signToken({ username, email, _id: user._id.toString() });
        return { token, user };
      } catch (error) {
        console.error('Error creating user:', error);
        throw new GraphQLError(error instanceof Error ? error.message : 'Failed to create user');
      }
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new GraphQLError('No user found with this email address');
        }
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new GraphQLError('Incorrect credentials');
        }
        const token = signToken({
          username: user.username,
          email: user.email,
          _id: user._id.toString()
        });
        return { token, user };
      } catch (error) {
        console.error('Error in login:', error);
        throw error;
      }
    },

    saveBook: async (_: unknown, { bookData }: any, context: { user?: { _id: string } }) => {
      try {
        if (context.user) {
          return await User.findOneAndUpdate(
            { _id: new Types.ObjectId(context.user._id) },
            { $addToSet: { savedBooks: bookData } },
            { new: true, runValidators: true }
          );
        }
        throw new GraphQLError('You need to be logged in!');
      } catch (error) {
        console.error('Error saving book:', error);
        throw error;
      }
    },

    removeBook: async (_: unknown, { bookId }: { bookId: string }, context: { user?: { _id: string } }) => {
      try {
        if (context.user) {
          return await User.findOneAndUpdate(
            { _id: new Types.ObjectId(context.user._id) },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );
        }
        throw new GraphQLError('You need to be logged in!');
      } catch (error) {
        console.error('Error removing book:', error);
        throw error;
      }
    },
  },
};