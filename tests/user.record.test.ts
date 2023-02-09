import mongoose, { HydratedDocument, Types } from 'mongoose';
import request from 'supertest';

import express from 'express';
import { UserRecord } from '../records/user.record';
import { app, server } from '../index';
import { BookEntity, UserEntity } from '../types';
import { filterUsersByValue } from '../functions/users/getFilteredUsersByValue';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';
import { getOneReview } from '../functions/users/getOneReview';
import { OneReview } from '../types/book/book-entity';
import { BookRecord } from '../records/book.record';

let userNew:UserRecord;

beforeAll(() => {
  userNew = new UserRecord({
    id: undefined,
    firstName: 'Test',
    age: 16,
    base64Avatar: '',
    country: '',
    email: '',
    password: '123',
    role: '',
    username: '',
  });
});
const req:any = {
  params: {
    userId: '63dac1e49dcd4c2de18bdf5d',
    bookId: '63e18520707b083af13c97c7',
  },
};
afterAll(async () => {
  await mongoose.disconnect();
  await server.close();
});
test('user password should exist', () => {
  expect(userNew.password).toBeTruthy();
});

test('is  instance of userRecord', async () => {
  const users = await UserRecord.getAllUsers();
  expect(users[0]).toBeInstanceOf(UserRecord);
  expect(users[0]).toBeDefined();
});
test('user should exist', async () => {
  const user = await UserRecord.getUser('63dac1e49dcd4c2de18bdf5d');
  expect(user).toBeDefined();
});

test('test if filtering users is correct', async () => {
  const users:UserRecord[] = await UserRecord.getAllUsers();
  const user = await User.findOne({ username: 'Zukashi_' }).lean();

  const filteredUsers = filterUsersByValue(users, 'Zukashi');

  expect(filteredUsers).toHaveLength(1);
  expect(new UserRecord(user)).toStrictEqual(filteredUsers[0]);
});
test('is book added to favorites', async () => {
  const formerUser:UserEntity = await User.findById(req.params.userId);
  const book:BookEntity = await Book.findById(req.params.bookId);
  const newUser = await UserRecord.addToFavorites(book, req.params.userId);
  const result = newUser.favorites.find((bookFavorite) => bookFavorite.id.toString() === req.params.bookId);
  expect(result).toBeTruthy();
});

test('was book removed from favorites of user', async () => {
  const formerUser:UserEntity = await User.findById(req.params.userId);
  const book:BookEntity = await Book.findById(req.params.bookId);
  const formerLength = formerUser.favorites.length;
  const user = await UserRecord.deleteBookFromFavorites(req);
  expect(formerLength).toBeGreaterThan(user.favorites.length);
  expect(user).toBeDefined();
  expect(user.favorites.find((bookEntity) => bookEntity.id === req.params.bookId)).toBeUndefined();
});

test('add review', async () => {
  const reqReview:any = {
    body: {
      rating: 3,
      description: '',
      status: 'read',
      spoilers: false,
      comments: [],
    },
    params: {
      userId: '63dac1e49dcd4c2de18bdf5d',
      bookId: '63e18520707b083af13c97c7',
    },
  };
  await UserRecord.addBookReview(reqReview);
});

test('get one review ', async () => {
  const review:OneReview = await getOneReview(req);
  expect(review).toBeDefined();
});

test('update review ', async () => {
  const reqReview:any = {
    body: {
      rating: 4,
      description: '',
      status: 'wantToRead',
      spoilers: false,
      comments: [],
    },
    params: {
      userId: '63dac1e49dcd4c2de18bdf5d',
      bookId: '63e18520707b083af13c97c7',
    },
  };
  const oldReview = await getOneReview(reqReview);
  await UserRecord.updateBookReview(reqReview);
  const review = await getOneReview(reqReview);

  expect(oldReview).not.toStrictEqual(review);
});
test('remove one review', async () => {
  const reqParams:any = {
    params: {
      userId: '63dac1e49dcd4c2de18bdf5d',
      bookId: '63e18520707b083af13c97c7',
      previousRating: 3,
    },
  };
  await BookRecord.deleteRating2(reqParams);
  const review:OneReview = await getOneReview(req);
  expect(review).toBeUndefined();
});
