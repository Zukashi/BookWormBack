import express, { json } from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import 'express-async-errors';
import mongoose from 'mongoose';
import { registerRouter } from './routers/Register';
import { loginRouter } from './routers/Login';
import { authorRouter } from './routers/Author';
import { searchRouter } from './routers/Search';
import { userRouter } from './routers/User';
import { bookRouter } from './routers/Book';
// see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
}));
(async function () {
  await mongoose.connect('mongodb://0.0.0.0:27017/BookWorm');
}());
app.use(json());
app.use('/', registerRouter);
app.use('/', authorRouter);
app.use('/', loginRouter);
app.use('/', searchRouter);
app.use('/user', userRouter);
app.use('', bookRouter);
app.listen(3001, '0.0.0.0', () => {
  console.log('Listening on port http://localhost:3000');
});
