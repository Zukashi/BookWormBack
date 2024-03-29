import {
  NextFunction, Request, Router, Response,
} from 'express';

import { HydratedDocument } from 'mongoose';
import { User } from '../Schemas/User';
import { RequestEntityWithUser } from '../types/request';
import { UserEntity } from '../types';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/prefer-default-export,no-undef
export const loginRouter = Router();
export async function setUser(req:RequestEntityWithUser, res:Response, next:NextFunction) {
  console.log(req.cookies);
  const user = await User.findOne({ refreshTokenId: req.cookies.refreshToken }).lean() as HydratedDocument<UserEntity>;
  if (user) {
    req.user = user;
  } else {
    res.status(404);
    throw new Error('User not found');
  }
  next();
}
export function authRole(role:string) {
  return async (req:RequestEntityWithUser, res:Response, next:NextFunction) => {
    const user = await User.findOne({ refreshTokenId: req.cookies.refreshToken });
    req.user = user;
    if (req.user.role === 'admin') {
      next();
      return;
    }
    if (req.user.role !== role) {
      res.status(401);
      return res.send('Not allowed');
    }
    next();
  };
}
loginRouter.post('/auth/refreshToken', setUser, async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log(req.cookies);
  const user2 = await User.findOne({ refreshTokenId: refreshToken });
  if (refreshToken === null) return res.sendStatus(403).redirect('/');
  if (!user2) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err:Error, user:UserEntity) => {
    if (err) return res.sendStatus(403);

    const accessToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
    const accessCookieExpiryDate = new Date(Date.now() + 60 * 15 * 1000);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      expires: accessCookieExpiryDate,
    }).status(201).json({ user: user2, token: accessToken });
  });
});

loginRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  console.log(user);
  if (!user) return res.sendStatus(401);
  const hash = user.password;
  await bcrypt.compare(password, hash, (err:Error, result:boolean) => {
    if (result) {
      const userJWT = { id: user._id };
      const accessToken = jwt.sign(userJWT, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign(userJWT, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
      });
      user.refreshTokenId = refreshToken;
      user.save();
      const accessCookieExpiryDate = new Date(Date.now() + 60 * 15 * 1000);
      const refreshCookieExpiryDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 7);
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: accessCookieExpiryDate,
      }).cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: refreshCookieExpiryDate,
      }).json({ user, accessToken });
    } else {
      res.sendStatus(401);
    }
  });
});

loginRouter.get('/demo/admin', async (req, res) => {
  let user = await User.findOne({ username: 'admin' });
  if (!user) {
    const user = new User({
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin',
      firstName: '',
      gender: '',
      city: '',
      age: 0,
      country: '',
      lastName: '',
      dateOfBirth: '',
      favorites: [],
      role: 'admin',
      lists: {},
      base64Avatar: 'data:image/png;base64,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',
    });
    await user.save();
  }
  user = await User.findOne({ username: 'admin' });

  const userJWT = { id: user._id };
  const accessToken = jwt.sign(userJWT, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(userJWT, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
  user.refreshTokenId = refreshToken;
  user.save();

  const accessCookieExpiryDate = new Date(Date.now() + 60 * 15 * 1000);
  const refreshCookieExpiryDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 7);
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,

    expires: accessCookieExpiryDate,
  }).cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: refreshCookieExpiryDate,
  }).json({ user, accessToken });
});

loginRouter.get('/demo/user', async (req, res) => {
  let user = await User.findOne({ username: 'user' });
  if (!user) {
    const user = new User({
      username: 'user',
      email: 'user@gmail.com',
      password: 'user',
      firstName: '',
      gender: '',
      city: '',
      age: 0,
      country: '',
      lastName: '',
      dateOfBirth: '',
      favorites: [],
      role: 'user',
      lists: {},
      base64Avatar: 'data:image/png;base64,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',
    });
    await user.save();
  }
  user = await User.findOne({ username: 'user' });

  const userJWT = { id: user._id };
  const accessToken = jwt.sign(userJWT, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(userJWT, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
  user.refreshTokenId = refreshToken;
  user.save();

  const accessCookieExpiryDate = new Date(Date.now() + 60 * 15 * 1000);
  const refreshCookieExpiryDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 7);
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,

    expires: accessCookieExpiryDate,
  }).cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: refreshCookieExpiryDate,
  }).json({ user, accessToken });
});
export function authenticateToken(req:Request, res:Response, next:NextFunction) {
  const { accessToken } = req.cookies;
  if (accessToken == null) return res.sendStatus(401);
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err:any, user:any) => {
    if (err) return res.sendStatus(403);
  });
  next();
}
