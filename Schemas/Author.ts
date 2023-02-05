import mongoose, { Schema, Types } from 'mongoose';
import { User } from './User';
import { BookEntity } from '../types';
import { AuthorEntity } from '../types/author/author-entity';

export const authorSchema = new mongoose.Schema<AuthorEntity>({
  olId: String,
  wikipedia: String,
  personal_name: {
    type: String,
  },
  key: String,

  alternate_names: {
    type: [String],
  },
  links: Schema.Types.Mixed,
  publish_date: {
    type: String,
  },
  name: String,
  birth_date: String,
  photos: [String],
  bio: String,
  last_modified: Schema.Types.Mixed,

});
export const Author = mongoose.model<BookEntity>('Author', authorSchema);
