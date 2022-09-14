import { Router } from 'express';
import { User } from '../Schemas/User';

const bcrypt = require('bcrypt');
// eslint-disable-next-line import/prefer-default-export,no-undef
export const registerRouter = Router();

registerRouter.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const saltAmount = 10;
  bcrypt.hash(password, saltAmount, async (err:string, hash:string) => {
    const user = new User({
      username,
      email,
      password: hash,
    });
    await user.save();
  });
  res.end();
});
