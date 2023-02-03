import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Book } from './Book';
import { UserEntity } from '../types';

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
  shelves: {
    read: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Book',
    }],
    wantToRead: [String],
    currentlyReading: [String],
  },
});

export const User = mongoose.model('User', userSchema);
