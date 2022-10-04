import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
  firstName: String,
  gender: String,
  lastName: String,
  city: String,
  age: Number,
  dateOfBirth: Date,
  country: String,
});

export const User = mongoose.model('User', userSchema);
