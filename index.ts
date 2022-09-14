import express, { json } from 'express';
import cors from 'cors';
import 'express-async-errors';
import mongoose from 'mongoose';
import { registerRouter } from './routers/Register';
import { loginRouter } from './routers/Login';

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
}));
(async function () {
  await mongoose.connect('mongodb://localhost:27017/BookWorm');
}());
app.use(json());
app.use('/', registerRouter);
app.use('/', loginRouter);
app.listen(3001, '0.0.0.0', () => {
  console.log('Listening on port http://localhost:3001');
});
