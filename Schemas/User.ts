import mongoose, { Schema } from 'mongoose';
import { ObjectId } from 'mongodb';
import { Book } from './Book';
import { UserEntity } from '../types';
import { UserRecord } from '../records/user.record';

const userSchema = new mongoose.Schema<UserEntity>({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    min: 3,
    max: 20,
  },
  base64Avatar: String,
  firstName: String,
  gender: String,
  lastName: String,
  city: String,
  age: Number,
  dateOfBirth: String,
  country: String,
  favorites: [{
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Book',
  }],
  refreshTokenId: String,
  role: String,
  lists: Schema.Types.Mixed,
  shelves: {
    read: [{
      book: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Book',
      },
      progress: Number,
    }],
    wantToRead: [{
      book: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Book',
      },
      progress: Number,
    }],
    currentlyReading: [{
      book: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Book',
      },
      progress: Number,
    }],
  },
}, {
  minimize: false,
});

export const User = mongoose.model<UserEntity>('User', userSchema);
