import { Router } from 'express';
import { User } from '../Schemas/User';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/prefer-default-export,no-undef
export const loginRouter = Router();
let refreshTokens:any[] = [];
loginRouter.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.cookies.token);
});
loginRouter.post('/token', (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken === null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  res.clearCookie('token', { httpOnly: true, secure: true });
  jwt.verify(refreshToken, process.env.REFRESH, (err:any, user:any) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: true,
    });
  });
});
loginRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.find({ username });
  if (!user) return res.sendStatus(404).send('yo');
  const hash = user[0].password;
  const isSamePassword = await bcrypt.compare(password, hash);
  if (isSamePassword) {
    const userJWT = { name: user[0]._id };
    const accessToken = jwt.sign(userJWT, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
    const refreshToken = jwt.sgin(userJWT, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1h' });
    refreshTokens.push(refreshToken);
    res.json({ user: user[0], accessToken, refreshToken }).cookie('token', accessToken, { httpOnly: true, secure: true });
  } else {
    res.json({ error: 'error 404' });
  }
});

export function authenticateToken(req:any, res:any, next:any) {
  const { token } = req.cookies;
  console.log(token);
  if (token == null) return res.sendStatus(401);
  const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err:any, user:any) => {
    if (err) return res.sendStatus(403);
  });
  req.user = user;
  next();
}
