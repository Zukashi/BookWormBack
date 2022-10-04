import { Router } from 'express';
import { User } from '../Schemas/User';

const bcrypt = require('bcrypt');
// eslint-disable-next-line import/prefer-default-export,no-undef
export const loginRouter = Router();

loginRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.find({ username });
  const hash = user[0].password;
  const isSamePassword = await bcrypt.compare(password, hash);
  console.log(user[0]);
  if (isSamePassword) {
    res.json(user[0]);
  } else {
    res.json({ error: 'error 404' });
  }
});
