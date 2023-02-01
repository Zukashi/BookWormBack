import { Router } from 'express';
import { User } from '../Schemas/User';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/prefer-default-export,no-undef
export const loginRouter = Router();
export async function setUser(req:any, res:any, next:any) {
  const user = await User.findOne({ refreshTokenId: req.cookies.refreshToken });
  if (user) {
    req.user = user;
  }
  next();
}
export function authRole(role:string) {
  return async (req:any, res:any, next:any) => {
    console.log(req.user.role);
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
loginRouter.post('/auth/refreshToken', async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log(refreshToken);
  const user2 = await User.findOne({ refreshTokenId: refreshToken });
  if (refreshToken === null) return res.sendStatus(403).redirect('/');
  if (!user2) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err:any, user:any) => {
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
  if (!user) return res.sendStatus(401);
  const hash = user.password;
  console.log(typeof hash);
  const isSamePassword = await bcrypt.compare('VasdirHisaki2', hash);
  console.log(isSamePassword);
  if (isSamePassword) {
    console.log(999);
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
      sameSite: 'strict',
      secure: true,
      expires: accessCookieExpiryDate,
    }).cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
      expires: refreshCookieExpiryDate,
    }).json({ user, accessToken });
  } else {
    res.status(401);
  }
});

export function authenticateToken(req:any, res:any, next:any) {
  const { accessToken } = req.cookies;
  if (accessToken == null) return res.sendStatus(401);
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err:any, user:any) => {
    if (err) return res.sendStatus(403);
  });
  next();
}
