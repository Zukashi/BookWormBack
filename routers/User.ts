import { Request, Router } from 'express';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { HydratedDocument, Types, Document } from 'mongoose';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';
import { authenticateToken, setUser } from './Login';
import { UserRecord } from '../records/user.record';
import { RequestEntityWithUser } from '../types/request';
import { UserEntity } from '../types';

const bcrypt = require('bcrypt');
//

export const userRouter = Router();

userRouter.get('/users', authenticateToken, async (req, res) => {
  const users = await UserRecord.getAllUsers();
  res.json(users);
}).get('/:userId', setUser, authenticateToken, async (req:RequestEntityWithUser, res) => {
  res.json(req.user);
}).put('/admin/:userId', authenticateToken, async (req, res) => {
  const user = new UserRecord(req.body);
  await user.updateUser(user, res);
}).post('/search/:value', authenticateToken, async (req, res) => {
  await UserRecord.getSearchedUsers(req, res);
})
  .put('/password', authenticateToken, async (req, res) => {
    await UserRecord.updatePassword(req, res);
  })
  .put('/:userId/avatar', setUser, authenticateToken, async (req:RequestEntityWithUser, res) => {
    const user = await new UserRecord(req.user);
    user.base64Avatar = req.body.preview;
    await user.updateUser(user, res);
  })
  .put('/:userId', setUser, authenticateToken, async (req:RequestEntityWithUser, res) => {
    const user = new UserRecord(req.user);
    await user.updateUser(req.body, res);
  })
  .put('/:userId/favorite', authenticateToken, async (req, res) => {
    const user = await User.findById(req.params.userId);
    user.favorites.push(req.body);
    await user.save();
    res.sendStatus(201);
  })
  .delete('/:userId/book/:bookId/favorite', setUser, authenticateToken, async (req, res) => {
    const user = new UserRecord(req.body);
    await user.deleteBookFromFavorites(req, res);
  })
  .post('/:userId/sms', authenticateToken, async (req, res) => {
    await UserRecord.sendSmsForPinForPasswordReset(req, res);
  })
  .get('/:userId/favorites', setUser, authenticateToken, async (req:RequestEntityWithUser, res) => {
    await UserRecord.getFavoritesOfUser(req, res);
  })
  .delete('/:userId', authenticateToken, async (req, res) => {
    await User.findByIdAndDelete(req.params.userId);
    res.sendStatus(204);
  })
  .delete('/:userId/logout', async (req, res) => {
    res.clearCookie('accessToken').clearCookie('refreshToken').sendStatus(200);
  })
  .post('/reset-password', async (req, res) => {
    await UserRecord.resetPassword(req, res);
  })
  .put('/reset-password/confirm', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.sendStatus(404);
    const user = await User.findOne({ email });
    user.password = '';
    user.save();
    res.json(user);
  })
  .put('/:userId/newPassword', async (req, res) => {
    await UserRecord.newPassword(req, res);
  })
  .get('/:userId/book/:bookId', setUser, async (req:Request, res) => {
    await UserRecord.getReview(req, res);
  })
  .post('/:userId/book/:bookId', async (req, res) => {
    await UserRecord.addBookReview(req, res);
  })
  .put('/:userId/book/:bookId', async (req, res) => {
    await UserRecord.updateBookReview(req, res);
  })
  .get('/:userId/books', async (req, res) => {
    await UserRecord.getAllBooksFromShelves(req, res);
  })
  .get('/:userId/:bookId/status', async (req, res) => {
    await UserRecord.getStatusOfBook(req, res);
  })
  .patch('/:userId/:bookId/status', authenticateToken, async (req, res) => {
    await UserRecord.setStatusOfBook(req, res);
  });
