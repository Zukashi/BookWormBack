import mongoose from 'mongoose';
import { User } from './User';

export const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },
  isbn: {
    type: String,
    required: true,
    min: 10,
    max: 13,
  },
  imageSrc: String,
  publish_date: {
    type: String,
  },
  publishers: {
    type: [String],
  },
  languages: {
    type: [{ key: String }],
  },
  authors: {
    type: [{ key: String }],
  },
  subjects: {
    type: [String],
  },
  subject_people: {
    type: [String],
  },
  description: String,
  ratingTypeAmount: [Number],
  rating: Number,
  amountOfRates: Number,
  sumOfRates: Number,
  reviews: [{
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    description: String,
    rating: Number,
    status: String,
    date: {
      type: Date,
      default: Date.now(),
    },
    spoilers: Boolean,
    comments: [
      {
        user: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'User',
        },
        commentMsg: String,
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  }],
});
export const Book = mongoose.model('Book', bookSchema);
