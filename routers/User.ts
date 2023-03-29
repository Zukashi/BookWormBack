import { Request, Router } from 'express';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { HydratedDocument, Types, Document } from 'mongoose';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';
import { authenticateToken } from './Login';
import { UserRecord } from '../records/user.record';
import { RequestEntityWithUser } from '../types/request';
import { UserEntity } from '../types';
import { ValidationError } from '../utils/errors';

const bcrypt = require('bcrypt');
//

export const userRouter = Router();

userRouter.get('/users', authenticateToken, async (req, res) => {
  const users = await UserRecord.getAllUsers();
  res.json(users);
}).get('/:userId', authenticateToken, async (req:RequestEntityWithUser, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json(user);
  } catch (e) {
    res.sendStatus(404);
  }
}).put('/admin/:userId', authenticateToken, async (req, res) => {
  await UserRecord.updateUser(req.body, res, req.params.userId);
}).post('/search/:value', authenticateToken, async (req, res) => {
  await UserRecord.getSearchedUsers(req, res);
})
  .put('/password', async (req, res) => {
    await UserRecord.updatePassword(req, res);
  })
  .put('/:userId/avatar', authenticateToken, async (req, res) => {
    const user = await User.findById(req.params.userId);
    // @TODO doesn't save changes
    user.base64Avatar = req.body.preview;
    await user.save();
    res.sendStatus(201);
  })
  .put('/:userId', authenticateToken, async (req:RequestEntityWithUser, res) => {
    await UserRecord.updateUser(req.body, res, req.params.userId);
  })
  .put('/:userId/favorite', authenticateToken, async (req, res) => {
    try {
      await UserRecord.addToFavorites(req.body, req.params.userId);
      res.sendStatus(201);
    } catch (e) {
      res.status(e.statusCode).json(e.message);
    }
  })
  .delete('/:userId/book/:bookId/favorite', authenticateToken, async (req, res) => {
    try {
      const newUser = await UserRecord.deleteBookFromFavorites(req);
      res.status(200).json({ status: 'success', newUser });
    } catch (e) {
      res.status(e.statusCode).json(e.message);
    }
  })
  .get('/:userId/favorites', authenticateToken, async (req:RequestEntityWithUser, res) => {
    await UserRecord.getFavoritesOfUser(req, res);
  })
  .delete('/:userId', authenticateToken, async (req, res) => {
    await User.findByIdAndDelete(req.params.userId);
    res.sendStatus(204);
  })
  .delete('/:userId/logout', authenticateToken, async (req, res) => {
    res.clearCookie('accessToken').clearCookie('refreshToken').sendStatus(200);
  })
  .post('/reset-password', async (req, res) => {
    await UserRecord.resetPassword(req, res);
  })
  .put('/reset-password/confirm', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.sendStatus(404);
    const user = await User.findOne({ email });
    if (!user) res.sendStatus(404);
    user.password = '';
    user.save();
    res.json(user);
  })
  .put('/:userId/newPassword', async (req, res) => {
    await UserRecord.newPassword(req);
    res.sendStatus(204);
  })
  .get('/:userId/book/:bookId', authenticateToken, async (req:Request, res) => {
    await UserRecord.getReview(req, res);
  })
  .post('/:userId/book/:bookId', authenticateToken, async (req, res) => {
    try {
      await UserRecord.addBookReview(req);
      res.sendStatus(201);
    } catch (e) {
      res.status(e.statusCode).json(e.message);
    }
  })
  .put('/:userId/book/:bookId', authenticateToken, async (req, res) => {
    try {
      await UserRecord.updateBookReview(req);
      res.sendStatus(200);
    } catch (e) {
      res.status(e.statusCode);
      res.json(e.message);
    }
  })
  .get('/:userId/books', authenticateToken, async (req, res) => {
    await UserRecord.getAllBooksFromShelves(req, res);
  })
  .get('/:userId/:bookId/status', authenticateToken, async (req, res) => {
    try {
      const typeOfShelf = await UserRecord.getStatusOfBook(req);
      if (typeOfShelf) {
        res.status(200).json(typeOfShelf);
      } else {
        res.status(200).json('not found shelf');
      }
    } catch (e) {
      res.status(e.statusCode).json(e.message);
    }
  })
  .patch('/:userId/:bookId/:status/:oldStatus', authenticateToken, async (req, res) => {
    await UserRecord.setStatusOfBook(req, res);
  })
  .delete('/:userId/book/:bookId/status', authenticateToken, async (req, res) => {
    try {
      await UserRecord.clearStatus(req);
      res.sendStatus(204);
    } catch (e) {
      res.status(e.statusCode).json(e.message);
    }
  })
  .get('/:userId/book/:bookId/:status', authenticateToken, async (req, res) => {
    const bookWithProgress = await UserRecord.getBookWithUserProgress(req);
    res.json(bookWithProgress);
  })
  .patch('/:userId/book/:bookId/:status/:pageNumber', authenticateToken, async (req, res) => {
    console.log(req.params);
    await UserRecord.updateProgressOfBook(req);

    res.end();
  })
  .post('/:userId/list/:listName', authenticateToken, async (req, res) => {
    console.log(req.params);
    await UserRecord.addList(req);
    res.sendStatus(201);
  })
  .put('/:userId/list/:listName/book/:bookId', authenticateToken, async (req, res) => {
    await UserRecord.addEntityToList(req);
    res.sendStatus(201);
  })
  .delete('/:userId/list/:listName/book/:bookId', authenticateToken, async (req, res) => {
    await UserRecord.deleteEntityFromList(req);
    res.sendStatus(204);
  })
  .put('/:userId/list/:listName', authenticateToken, async (req, res) => {
    await UserRecord.updateListName(req);
    res.sendStatus(201);
  })
  .delete('/:userId/list/:listName', authenticateToken, async (req, res) => {
    await UserRecord.deleteList(req);
    res.end();
  })
  .get('/:userId/shelf/:status', authenticateToken, async (req, res) => {
    await UserRecord.getSpecifiedShelfOfUserBooks(req, res);
  })
  .get('/:userId/shelf/:status/:search/filtered', authenticateToken, async (req, res) => {
    await UserRecord.getSpecifiedFilteredBooksOfUserShelf(req, res);
  })
  .get('/:userId/favorites/filter/:search', authenticateToken, async (req, res) => {
    await UserRecord.getFilteredBooksOfUserFavorites(req, res);
  });
