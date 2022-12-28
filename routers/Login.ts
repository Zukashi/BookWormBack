import { Router } from 'express';
import { User } from '../Schemas/User';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/prefer-default-export,no-undef
export const loginRouter = Router();

loginRouter.post('/auth/refreshToken', async (req, res) => {
  const { refreshToken } = req.cookies;
  const user2 = await User.where('refreshTokenId').equals(refreshToken);
  if (refreshToken === null) return res.sendStatus(401).redirect('/');
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
  const user = await User.find({ username });
  if (!user) return res.sendStatus(404).send('yo');
  const hash = user[0].password;
  const isSamePassword = await bcrypt.compare(password, hash);
  if (isSamePassword) {
    const userJWT = { id: user[0]._id };
    const accessToken = jwt.sign(userJWT, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(userJWT, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
    });
    user[0].refreshTokenId = refreshToken;
    user[0].save();
    const accessCookieExpiryDate = new Date(Date.now() + 60 * 15 * 1000);
    const refreshCookieExpiryDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 7);
    console.log(accessCookieExpiryDate.getTime(), refreshCookieExpiryDate.getTime());
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
    }).json({ user: user[0], accessToken });
  } else {
    res.json({ error: 'error 404' });
  }
});

export function authenticateToken(req:any, res:any, next:any) {
  const { accessToken } = req.cookies;
  console.log(req.cookies.accessToken, 123);
  if (accessToken == null) return res.sendStatus(401);
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err:any, user:any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
  });
  next();
}
