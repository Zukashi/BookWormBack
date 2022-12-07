import { Router } from 'express';
import { User } from '../Schemas/User';

const bcrypt = require('bcrypt');

export const userRouter = Router();

userRouter
  .put('/password', async (req, res) => {
    const user = await User.findById(`${req.body.id}`);
    console.log(req.body.currentPassword);
    const isSamePassword = await bcrypt.compare(req.body.currentPassword, user.password);
    console.log(isSamePassword);
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
      email, password, _id,
    } = await User.findById(`${userId}`);
    const {
      firstName, gender, lastName, city, age, country, dateOfBirth, username,
    } = req.body;
    await User.deleteOne({ id: userId });
    console.log(1);
    console.log(dateOfBirth);
    console.log(new Date(dateOfBirth));
    const newUser = new User({
      _id,
      username,
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
    console.log(2);
    await newUser.save();
    res.end();
  }).get('/:userId', async (req, res) => {
    const user = await User.findById(req.params.userId);
    res.json(user);
  }).put('/:userId/favorite', async (req, res) => {
    console.log(req.params, req.body);
    const user = await User.findById(req.params.userId);
    user.favorites.push(req.body.isbn);
    await user.save();
    console.log(user);
  })
  .delete('/:userId/favorite', async (req, res) => {
    const user = await User.findById(req.params.userId);
    const filtered = user.favorites.filter((value, index, arr) => value !== req.body.isbn);
    user.favorites = [...filtered];
    await user.save();
  });
