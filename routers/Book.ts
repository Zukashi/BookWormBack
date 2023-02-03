import { Router } from 'express';
import axios from 'axios';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { HydratedDocument } from 'mongoose';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';
import { authenticateToken, authRole, setUser } from './Login';
import { BookRecord } from '../records/book.record';
import { BookEntity } from '../types';

export const bookRouter = Router();

bookRouter.get('/books', setUser, authenticateToken, authRole('user'), async (req, res) => {
  const books: HydratedDocument<BookEntity>[] = await BookRecord.getAllBooks();
  // const result = books.map(async (book) => {
  //   const response = await fetch(`https://openlibrary.org/isbn/${book.isbn}.json`);
  //   const data = await response.json();
  //   return data;
  // });
  // const values = await Promise.all(result);
  console.log(books[0].id);
  res.json(books).status(201);
}).get('/book/:id', async (req, res) => {
  const book:HydratedDocument<BookEntity> = await BookRecord.getOneBook(req.params.id);
  res.json(book);
}).post('/bookAdmin/search/:value', async (req, res) => {
  const searchedBooks = await BookRecord.filterBooks(req.body.value);
  res.json(searchedBooks);
})
  .post('/book', async (req, res) => {
    const book = new BookRecord(req.body);
    await book.insert(res);
    res.sendStatus(201);
  })
  .put('/book/:bookId', async (req, res) => {
    const book = new BookRecord(req.body);
    await book.updateBook(req.body, req);
    res.sendStatus(200);
  })
  .delete('/book/:bookId', async (req, res) => {
    const { bookId } = req.params;
    await Book.deleteOne({ _id: bookId });
    res.sendStatus(204);
  })
  .post('/book/:bookId/:rating', async (req, res) => {
    try {
      const book = await BookRecord.addRatingOfBook(req.params) as HydratedDocument<BookEntity>;
      res.status(201).json(book);
    } catch (e) {
      res.sendStatus(400);
    }
  })
  .put('/book/:bookId/:rating', async (req, res) => {
    const newBook:HydratedDocument<BookEntity> = await BookRecord.updateRatingOfBook(req, res);
    res.json(newBook);
  })
  .delete('/book/:bookId/:previousRating', async (req, res) => {
    await BookRecord.deleteRating(req, res);
  })
  .delete('/book/:bookId/user/:userId/review/:previousRating', async (req, res) => {
    await BookRecord.deleteRating2(req, res);
  })
  .get('/book/:bookId/reviews', async (req, res) => {
    const book: any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.user',
    });
    res.json(book.reviews);
  })
  .put('/book/:bookId/user/:userId/review/:reviewId/comment', async (req, res) => {
    await BookRecord.addCommentToReview(req, res);
  })
  .get('/book/:bookId/user/:userId/review/:reviewId', async (req, res) => {
    await BookRecord.getReview(req, res);
  })
  .delete('/book/:bookId/user/:userId/review/:reviewId/comment/:commentId', async (req, res) => {
    await BookRecord.deleteComment(req, res);
  })
  .put('/book/:bookId/user/:reviewUserId/review/:reviewId/user/:currentUser', async (req, res) => {
    await BookRecord.addUserThatLikedReview(req, res);
  })
  .get('/book/:bookId/user/:reviewUserId/review/:reviewId/user/:currentUser', async (req, res) => {
    await BookRecord.getUserThatLikedReview(req, res);
  })
  .delete('/book/:bookId/user/:reviewUserId/review/:reviewId/user/:currentUser', async (req, res) => {
    await BookRecord.deleteUserThatLikedFromLikedUsers(req, res);
  })
  .put('/book/:bookId/user/:userId/changeStatus', authenticateToken, async (req, res) => {
    await BookRecord.changeStatusOfBookFromUserBooks(req, res);
  });
