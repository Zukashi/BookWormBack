import mongoose from 'mongoose';
import { UserRecord } from '../records/user.record';
import { server } from '../index';

let user:UserRecord;
beforeAll(() => {
  user = new UserRecord({
    firstName: 'Test',
    age: 16,
    base64Avatar: '',
    country: '',
    email: '',
    password: '123',
    role: '',
    username: '',
  });
  user.insert();
});

afterAll(async () => {
  await mongoose.disconnect();
  await server.close();
});
test('user password should exist', () => {
  expect(user.password).toBeTruthy();
});

test('is user inserted correctly', () => {

});
test('user should be exist');
