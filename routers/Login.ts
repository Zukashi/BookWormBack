import { Router } from 'express';
import { User } from '../Schemas/User';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/prefer-default-export,no-undef
export const loginRouter = Router();

loginRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.find({ username });
  if (!user) return res.sendStatus(404).send('yo');
  const hash = user[0].password;
  const isSamePassword = await bcrypt.compare(password, hash);
  if (isSamePassword) {
    const userJWT = { name: user[0]._id };
    const accessToken = jwt.sign(userJWT, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.cookie('sessionId', accessToken, {
      httpOnly: true,
    }).json({ user: user[0], accessToken });
  } else {
    res.json({ error: 'error 404' });
  }
});

export function authenticateToken(req:any, res:any, next:any) {
  const { sessionId } = req.cookies;
  console.log(sessionId);
  if (sessionId == null) return res.sendStatus(401);
  const user = jwt.verify(sessionId, process.env.ACCESS_TOKEN_SECRET, (err:any, user:any) => {
    if (err) return res.sendStatus(403);
  });
  req.user = user;
  next();
}
