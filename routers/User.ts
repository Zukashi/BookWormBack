import { Router } from 'express';
import { User } from '../Schemas/User';

const bcrypt = require('bcrypt');

export const userRouter = Router();

userRouter
  .put('/password', async (req, res) => {
    const user = await User.findById(`${req.body.id}`);
    console.log(req.body.currentPassword);
    const isSamePassword = await bcrypt.compare(req.body.currentPassword, user.password);
    if (isSamePassword) {
      if (req.body.newPassword === req.body.verifyPassword) {
        bcrypt.hash(req.body.verifyPassword, 10, async (err:string, hash:string) => {
          user.password = hash;
          await user.save();
        });
      }
    } else {
      res.json('Passwords dont match');
    }
  });
