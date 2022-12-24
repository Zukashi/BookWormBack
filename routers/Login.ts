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
  console.log(user[0]);
  if (isSamePassword) {
    const userJWT = { name: user[0]._id };
    const accessToken = jwt.sign(userJWT, 'abc');
    res.json(user[0]);
  } else {
    res.json({ error: 'error 404' });
  }
});

// function authenticateToken(req:any, res:any, next:any) {
//   const authHeader = req.header.authorization;
//   const token = authHeader && authHeader.split(' ')[1];
//   if (token == null) return res.sendStatus(401);
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err:any, user:any) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// }
