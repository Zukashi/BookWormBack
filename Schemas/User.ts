import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Book } from './Book';

const userSchema = new mongoose.Schema({
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
    ref: Book,
  }],
  refreshTokenId: String,
  role: String,
});

export const User = mongoose.model('User', userSchema);
