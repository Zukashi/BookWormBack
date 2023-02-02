import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';
import { authenticateToken, setUser } from './Login';
import { UserRecord } from '../records/user.record';
import { RequestEntityWithUser } from '../types/request';

const bcrypt = require('bcrypt');
//
// const accountSid = 'ACb180490ec56aae49f9e66d21245e4abf';
// const authToken = 'ffcc735a9c51aab68d6a0f5f1592b9b0';
// const client = require('twilio')(accountSid, authToken);

export const userRouter = Router();

export interface User {
    _id: string,
    username: string,
    firstName: string,
    lastName: string,
    age: number,
    city: string,
}
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
  .delete('/:userId/book/:bookId/favorite', authenticateToken, async (req:RequestEntityWithUser, res) => {
    const user = new UserRecord(req.user);
    await user.deleteBookFromFavorites(req, res);
  })
  // .post('/:userId/sms', authenticateToken, async (req, res) => {
  //   const user = await User.findById(req.params.userId);
  //   client.messages
  //     .create({ body: 'Hello from Twilio', from: '+16506632010', to: '+48513031628' })
  //     .then((message: any) => console.log(message.sid));
  // })
  .get('/:userId/favorites', authenticateToken, async (req:RequestEntityWithUser, res) => {
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
    console.log(req.body);
    const code = uuidv4();
    const details = {
      from: 'testBookWorm@gmail.com',
      to: `${req.body.email}`,
      subject: 'testing',
      text: 'testing nodemail',
      html: `${code}`,
    };
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'testBookWorm@gmail.com',
        pass: 'tyjbqihrcxkagpwc',
      },
    });

    transporter.sendMail(details, (err) => {
      if (err) {
        console.log('it has an error', err);
      } else {
        console.log('works');
        res.json({ code });
      }
    });
  })
  .put('/reset-password/confirm', async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    user.password = '';
    user.save();
    res.json(user);
  })
  .put('/:userId/newPassword', async (req, res) => {
    const saltAmount = 10;
    const user = await User.findById(req.params.userId);
    bcrypt.hash(req.body.newPassword, saltAmount, async (err:string, hash:string) => {
      user.password = hash;
      user.save();
      res.end();
    });
  })
  .get('/:userId/book/:bookId', async (req, res) => {
    const booksPopulated = await Book.findById(req.params.bookId)
      .populate({
        path: 'reviews.user',
      });
    let reviewFound;

    booksPopulated.reviews.forEach((review) => {
      if (review.user.id === req.params.userId) {
        reviewFound = {
          userId: review.user.id,
          description: review.description,
          rating: review.rating,
          status: review.status,
          date: review.date,
          spoilers: review.spoilers,
        };
      }
    });
    if (!reviewFound) {
      res.sendStatus(404).end();
    } else {
      res.status(200).json(reviewFound);
    }
  })
  .post('/:userId/book/:bookId', async (req, res) => {
    const book = await Book.findById(req.params.bookId)
      .populate({
        path: 'reviews.user',
      });
    const user:any = await User.findById(req.params.userId);
    user.shelves[req.body.status].push(req.params.bookId);
    await user.save();
    book.reviews.push({
      user: req.params.userId,
      description: req.body.description,
      rating: req.body.rating,
      status: req.body.status,
      spoilers: req.body.spoilers,
      comments: req.body.comments,
      likes: {
        usersThatLiked: [],
        amount: 0,
      },
    });
    await book.save();
    res.json(book).status(201);
  })
  .put('/:userId/book/:bookId', async (req, res) => {
    const book = await Book.findById(req.params.bookId)
      .populate({
        path: 'reviews.user',
      });
    book.reviews.forEach((review, i) => {
      if (review.user.id === req.params.userId) {
        book.reviews.splice(i, 1);
      }
    });

    book.reviews.push({
      user: req.params.userId,
      description: req.body.description,
      rating: req.body.rating,
      status: req.body.status,
      spoilers: req.body.spoilers,
      date: Date.now(),
      comments: [],
    });
    book.save();

    res.sendStatus(201);
  })
  .get('/:userId/books', async (req, res) => {
    const user:any = await User.findById(req.params.userId);
    res.json(user.shelves).status(200);
  });
