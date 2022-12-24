import mongoose from 'mongoose';
import { Book } from './Book';

const userSchema = new mongoose.Schema({
  _id: String,
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
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
});

export const User = mongoose.model('User', userSchema);
