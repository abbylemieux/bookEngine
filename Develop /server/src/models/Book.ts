import { Schema, type Document } from 'mongoose';

export interface BookDocument extends Document {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image?: string;  // Making these optional since they're not required
  link?: string;
}

export interface BookInput {
  bookId: string;
  title: string;
  authors: string[];
  description: string;
  image?: string;
  link?: string;
}

const bookSchema = new Schema<BookDocument>({
  authors: [{
    type: String,
  }],
  description: {
    type: String,
    required: true,
  },
  bookId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  link: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: true,
  },
});

export default bookSchema;