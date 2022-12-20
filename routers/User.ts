import { Router } from 'express';
import { User } from '../Schemas/User';

const bcrypt = require('bcrypt');

const accountSid = 'ACb180490ec56aae49f9e66d21245e4abf';
const authToken = 'ffcc735a9c51aab68d6a0f5f1592b9b0';
const client = require('twilio')(accountSid, authToken);

export const userRouter = Router();

userRouter
  .put('/password', async (req, res) => {
    const user = await User.findById(`${req.body.id}`);
    const isSamePassword = await bcrypt.compare(req.body.currentPassword, user.password);
    if (isSamePassword) {
      if (req.body.newPassword === req.body.verifyPassword) {
        bcrypt.hash(req.body.verifyPassword, 10, async (err:string, hash:string) => {
          user.password = hash;
          await user.save();
          res.end().status(200);
        });
      } else {
        res.json('Passwords dont match');
      }
    } else {
      res.json('Current Password Invalid');
    }
  }).put('/:userId', async (req, res) => {
    const { userId } = req.params;
    const {
      email, password, _id, favorites,
    } = await User.findById(`${userId}`);
    const {
      firstName, gender, lastName, city, age, country, dateOfBirth, username,
    } = req.body;
    await User.deleteOne({ id: userId });
    const newUser = new User({
      _id,
      username,
      favorites,
      email,
      password,
      firstName,
      gender,
      city,
      age,
      country,
      lastName,
      dateOfBirth,
    });
    await newUser.save();
    res.end();
  }).get('/:userId', async (req, res) => {
    const user = await User.findById(req.params.userId);
    res.json(user);
  }).put('/:userId/favorite', async (req, res) => {
    const user = await User.findById(req.params.userId);
    user.favorites.push(req.body.isbn);
    await user.save();
    res.end();
  })
  .delete('/:userId/favorite', async (req, res) => {
    const user = await User.findById(req.params.userId);
    const filtered = user.favorites.filter((value) => value !== req.body.isbn);
    user.favorites = [];
    user.favorites = [...filtered];
    await user.save();
    res.end();
  })
  .post('/:userId/sms', async (req, res) => {
    const user = await User.findById(req.params.userId);
    client.messages
      .create({ body: 'Hello from Twilio', from: '+16506632010', to: '+48513031628' })
      .then((message:any) => console.log(message.sid));
  })
  .get('/:userId/favorites', async (req, res) => {
    const user = await User.findById(req.params.userId);
    const result = user.favorites.map(async (isbn) => {
      const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
      const data = await response.json();
      return data;
    });
    const values = await Promise.all(result);
    console.log(values);
    res.json(values);
  });
