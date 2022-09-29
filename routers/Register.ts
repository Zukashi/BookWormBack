import { Router } from 'express';
import nodemailer from 'nodemailer';
import { User } from '../Schemas/User';

const bcrypt = require('bcrypt');
// eslint-disable-next-line import/prefer-default-export,no-undef
export const registerRouter = Router();

registerRouter.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const saltAmount = 10;
  // const mailTransporter = nodemailer.createTransport({
  //   service: 'gmail',
  //   auth: {
  //     user: 'ziomski40@gmail.com',
  //     pass: 'ZukashiHisaki2',
  //   },
  // });
  // const details = {
  //   from: 'ziomski40@gmail.com',
  //   to: 'bartek.kaszowski@spoko.pl',
  //   subject: 'testing our nodemailer',
  //   text: 'testing',
  // };
  //
  // mailTransporter.sendMail(details, (err) => {
  //   if (err) {
  //     console.log('error of ', err);
  //   } else {
  //     console.log('email has been sent');
  //   }
  // });
  bcrypt.hash(password, saltAmount, async (err:string, hash:string) => {
    const user = new User({
      username,
      email,
      password: hash,
    });
    await user.save();
  });
  res.end();
}).post('/send', (req, res) => {

});
