import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';

const bcrypt = require('bcrypt');

const accountSid = 'ACb180490ec56aae49f9e66d21245e4abf';
const authToken = 'ffcc735a9c51aab68d6a0f5f1592b9b0';
const client = require('twilio')(accountSid, authToken);

export const userRouter = Router();

export interface User {
    _id: string,
    username: string,
    firstName: string,
    lastName: string,
    age: number,
    city: string,
}
userRouter.get('/users', async (req, res) => {
  const users = await User.find({});
  res.json(users);
}).get('/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId);
  res.json(user);
}).put('/admin/:userId', async (req, res) => {
  const form = req.body;
  const user = await User.findById(req.params.userId);
  await User.findByIdAndDelete(req.params.userId);

  const newUser = new User({
    ...user,
    ...form,

  });
  await newUser.save();
  res.end();
}).post('/search/:value', async (req, res) => {
  const users: User[] = await User.find({});
  const newUsers = users.filter((user) => user.username?.toLowerCase().trim().includes(req.body.value.toLowerCase()) || user.firstName?.toLowerCase().trim().includes(req.body.value) || user.lastName?.toLowerCase().trim().includes(req.body.value));
  if (!req.body.value) {
    res.json(users);
  } else {
    res.json(newUsers);
  }
})
  .put('/password', async (req, res) => {
    const user = await User.findById(`${req.body.id}`);
    const isSamePassword = await bcrypt.compare(req.body.currentPassword, user.password);
    if (isSamePassword) {
      if (req.body.newPassword === req.body.verifyPassword) {
        bcrypt.hash(req.body.verifyPassword, 10, async (err: string, hash: string) => {
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
  })
  .put('/:userId/avatar', async (req, res) => {
    const user = await User.findById(req.params.userId);
    await User.findByIdAndDelete(req.params.userId);
    const obj = user.toObject();
    const newUser = new User({
      ...obj,
      base64Avatar: req.body.preview,
    });
    await newUser.save();
    res.end();
  })
  .put('/:userId', async (req, res) => {
    const { userId } = req.params;
    const {
      email, password, _id, favorites, base64Avatar,
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
      base64Avatar,
    });
    await newUser.save();
    res.end();
  })
  .put('/:userId/favorite', async (req, res) => {
    const user = await User.findById(req.params.userId);
    user.favorites.push(req.body);
    await user.save();
    res.end();
  })
  .delete('/:userId/favorite', async (req, res) => {
    const { book } = req.body;
    const user = await User.findById(req.params.userId);
    const doc = await User.find({ favorites: req.body, id: req.params.userId }).populate('favorites');
    await User.findByIdAndDelete(req.params.userId);
    const filtered = doc[0].favorites.filter((value: any) => value.isbn !== req.body.isbn);
    const obj = user.toObject();
    const newUser = new User({
      ...obj,
      favorites: filtered,
    });
    await newUser.save();
    res.end();
  })
  .post('/:userId/sms', async (req, res) => {
    const user = await User.findById(req.params.userId);
    client.messages
      .create({ body: 'Hello from Twilio', from: '+16506632010', to: '+48513031628' })
      .then((message: any) => console.log(message.sid));
  })
  .get('/:userId/favorites', async (req, res) => {
    const user = await User.findById('63a615fe31cc812d2de9fdca').populate('favorites');
    res.json(user.favorites);
  })
  .delete('/:userId', async (req, res) => {
    await User.findByIdAndDelete(req.params.userId);
    res.end();
  });
