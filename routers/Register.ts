import { Router } from 'express';
import { User } from '../Schemas/User';
import { UserRecord } from '../records/user.record';
import { validateRegister } from '../validators/validateRegister';

export const registerRouter = Router();

registerRouter.post('/register', validateRegister, async (req, res) => {
  try {
    const user = new UserRecord(req.body);
    if (await User.findOne({ email: user.email })) res.status(400).json({ status: 'false', result: 'Email is taken', type: 'email' });
    if (await User.findOne({ username: user.username })) res.status(400).json({ status: 'false', result: 'Username is taken', type: 'username' });
    await user.insert();
  } catch (e) {
    console.log(e);
  }
  res.end();
});
