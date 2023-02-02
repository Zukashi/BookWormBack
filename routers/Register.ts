import { Router } from 'express';
import nodemailer from 'nodemailer';
import Joi from 'joi';
import { User } from '../Schemas/User';
import { UserRecord } from '../records/user.record';

const schemaRegister = Joi.object({
  username: Joi.string().max(18).min(6).required(),
  password: Joi.string().min(8).max(24).required(),
  email: Joi.string().email().required(),

});
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/prefer-default-export,no-undef
export const registerRouter = Router();

registerRouter.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const value = await schemaRegister.validateAsync({ username, email, password });
  } catch (err) {
    res.status(400).json({ status: false, result: 'Incorrect data provided' });
  }
  try {
    const user = new UserRecord(req.body);
    await user.insert(res);
  } catch (e) {
    console.log(e);
  }
  res.end();
}).post('/send', (req, res) => {

});
