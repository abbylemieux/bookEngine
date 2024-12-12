import { Schema, model, Document, Types } from 'mongoose';
import bcryptjs from 'bcryptjs';
import bookSchema, { type BookDocument } from './Book.js';

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  savedBooks: BookDocument[];
  isCorrectPassword(password: string): Promise<boolean>;
  bookCount: number;
}

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address'],
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    savedBooks: [bookSchema],
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Add pre-save middleware for password hashing
userSchema.pre<UserDocument>('save', async function(next) {
  if (this.isNew || this.isModified('password')) {
    try {
      const saltRounds = 10;
      this.password = await bcryptjs.hash(this.password, saltRounds);
    } catch (error) {
      console.error('Error hashing password:', error);
      throw error;
    }
  }
  next();
});

// Method to compare passwords
userSchema.methods.isCorrectPassword = async function(this: UserDocument, password: string): Promise<boolean> {
  try {
    return await bcryptjs.compare(password, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

// Virtual for book count
userSchema.virtual('bookCount').get(function(this: UserDocument): number {
  return this.savedBooks.length;
});

const User = model<UserDocument>('User', userSchema);

export default User;