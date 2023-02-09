import mongoose, { HydratedDocument, Types } from 'mongoose';
import request from 'supertest';

import express from 'express';
import { UserRecord } from '../records/user.record';
import { app, server } from '../index';
import { BookEntity, UserEntity } from '../types';
import { filterUsersByValue } from '../functions/users/getFilteredUsersByValue';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';

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
  const req:any = {
    params: {
      userId: '63dac1e49dcd4c2de18bdf5d',
      bookId: '63e18520707b083af13c97c7',
    },
  };
  const formerUser:UserEntity = await User.findById(req.params.userId);
  const book:BookEntity = await Book.findById(req.params.bookId);
  const newUser = await UserRecord.addToFavorites(book, req.params.userId);
  const result = newUser.favorites.find((bookFavorite) => bookFavorite.id.toString() === req.params.bookId);
  expect(result).toBeTruthy();
});

test('was book removed from favorites of user', async () => {
  const req:any = {
    params: {
      userId: '63dac1e49dcd4c2de18bdf5d',
      bookId: '63e18520707b083af13c97c7',
    },
  };
  const formerUser:UserEntity = await User.findById(req.params.userId);
  const book:BookEntity = await Book.findById(req.params.bookId);
  const formerLength = formerUser.favorites.length;
  const user = await UserRecord.deleteBookFromFavorites(req);
  expect(formerLength).toBeGreaterThan(user.favorites.length);
  expect(user).toBeDefined();
  expect(user.favorites.find((bookEntity) => bookEntity.id === req.params.bookId)).toBeUndefined();
});
