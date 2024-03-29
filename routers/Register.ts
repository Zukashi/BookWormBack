import { Router } from 'express';
import { User } from '../Schemas/User';
import { UserRecord } from '../records/user.record';
import { validateRegister } from '../validators/validateRegister';
import { ValidationError } from '../utils/errors';

export const registerRouter = Router();

registerRouter.post('/register', validateRegister, async (req, res) => {
  try {
    const user = new UserRecord(req.body);
    if (await User.findOne({ email: req.body.email })) {
      res.status(400).json({ status: 'false', result: 'Email is taken', type: 'email' });
      throw new ValidationError('Email is taken', 400);
    }
    if (await User.findOne({ username: user.username })) {
      res.status(400).json({ status: 'false', result: 'Username is taken', type: 'username' });
      throw new ValidationError('Username is taken', 400);
    }
    await user.insert();
    res.sendStatus(201);
  } catch (e) {
    res.sendStatus(400);
  }
});
