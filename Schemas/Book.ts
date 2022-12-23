import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
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
  rating: Number,
  amountOfRates: Number,
  sumOfRates: Number,
});
export const Book = mongoose.model('Book', bookSchema);
