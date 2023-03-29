import express, { json } from 'express';
import * as dotenv from 'dotenv';
import 'express-async-errors';
import mongoose, { ConnectOptions } from 'mongoose';
import { registerRouter } from './routers/Register';
import { loginRouter } from './routers/Login';
import { authorRouter } from './routers/Author';
import { searchRouter } from './routers/Search';
import { userRouter } from './routers/User';
import { bookRouter } from './routers/Book';
import { handleError } from './utils/errors';
import { corsOptions } from './config/corsOptions';

dotenv.config();

(async function () {
  await mongoose.connect(process.env.MONGODB_URL as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions);
}());
const cookieParser = require('cookie-parser');

export const app = express();
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Pass to next layer of middleware
  next();
});

app.use(cookieParser());
app.use(json());
app.use('/', registerRouter);
app.use('/', authorRouter);
app.use('/', loginRouter);
app.use('/', searchRouter);
app.use('/user', userRouter);
app.use('', bookRouter);
app.use(handleError);
export const server = app.listen(process.env.PORT || 3001, () => {
  console.log('Listening on port http://localhost:3000');
});
