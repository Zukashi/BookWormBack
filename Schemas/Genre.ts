import mongoose, { Types } from 'mongoose';
import { User } from './User';
import { BookEntity } from '../types';

export const genreSchema = new mongoose.Schema<any>({
  genres: [String],
  years: [String],
  authors: [String],
});
export const Genre = mongoose.model<any>('Genre', genreSchema);
