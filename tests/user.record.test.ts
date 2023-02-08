import mongoose, { HydratedDocument } from 'mongoose';
import { UserRecord } from '../records/user.record';
import { server } from '../index';
import { UserEntity } from '../types';

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
test('user should be exist', async () => {
  const user = await UserRecord.getUser('63dac1e49dcd4c2de18bdf5d');
  expect(user).toBeDefined();
});
