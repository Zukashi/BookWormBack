import { Router } from 'express';
import axios from 'axios';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';
import { authenticateToken, authRole, setUser } from './Login';
import { BookRecord } from '../records/book.record';
import { BookEntity } from '../types';

export const bookRouter = Router();

bookRouter.get('/books', setUser, authenticateToken, authRole('user'), async (req, res) => {
  const books = await BookRecord.getAllBooks();
  // const result = books.map(async (book) => {
  //   const response = await fetch(`https://openlibrary.org/isbn/${book.isbn}.json`);
  //   const data = await response.json();
  //   return data;
  // });
  // const values = await Promise.all(result);
  res.json(books).status(201);
}).get('/book/:id', async (req, res) => {
  const book = await BookRecord.getOneBook(req.params.id);
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
    res.end();
  })
  .post('/book/:bookId/:rating', async (req, res) => {
    const book:any = await Book.findById(req.params.bookId);
    book.ratingTypeAmount[(parseInt(req.params.rating, 10)) - 1] += 1;
    book.rating = (book.sumOfRates + parseInt(req.params.rating, 10)) / (book.amountOfRates + 1);
    book.sumOfRates += parseInt(req.params.rating, 10);
    book.amountOfRates += 1;
    await book.save();
    res.status(201).json(book);
  })
  .put('/book/:bookId/:rating', async (req, res) => {
    const book = await Book.findById(req.params.bookId);

    await Book.findByIdAndDelete(req.params.bookId);
    const obj:any = book.toObject();
    obj.ratingTypeAmount[(parseInt(req.params.rating, 10)) - 1] += 1;

    const newBook = new Book({
      ...obj,
      sumOfRates: obj.sumOfRates + parseInt(req.params.rating, 10),
      rating: (obj.sumOfRates + parseInt(req.params.rating, 10)) / (obj.amountOfRates + 1),
      amountOfRates: obj.amountOfRates + 1,
    });
    await newBook.save();
    res.json(newBook);
  })
  .delete('/book/:bookId/:previousRating', async (req, res) => {
    const book: any = await Book.findById(req.params.bookId);
    book.ratingTypeAmount[(parseInt(req.params.previousRating, 10)) - 1] -= 1;
    book.sumOfRates -= parseInt(req.params.previousRating, 10);
    book.amountOfRates -= 1;
    book.rating = (book.sumOfRates + parseInt(req.params.previousRating, 10)) / book.amountOfRates;
    book.save();
    res.sendStatus(200);
  })
  .delete('/book/:bookId/user/:userId/review/:previousRating', async (req, res) => {
    const book: any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.user',
    });

    if (!book) {
      res.sendStatus(404);
    }
    book.ratingTypeAmount[(parseInt(req.params.previousRating, 10)) - 1] -= 1;
    book.sumOfRates -= parseInt(req.params.previousRating, 10);
    book.amountOfRates -= 1;
    if (book.amountOfRates > 0 && book.sumOfRates > 0) {
      book.rating = book.sumOfRates / book.amountOfRates;
    } else {
      book.rating = 0;
    }
    const result = book.reviews.filter((review:any):any => review.user.id !== req.params.userId);
    book.reviews.forEach(async (review:any):Promise<null> => {
      if (review.user.id !== req.params.userId) {
        return null;
      }
      const user: any = await User.findById(req.params.userId).populate({
        path: `shelves.${review.status}`,
      });
      if (!user) {
        res.sendStatus(404);
      }
      console.log(user.shelves.read);
      const newShelf = user.shelves[review.status].filter((book:BookEntity) => req.params.bookId !== book._id.toString());
      user.shelves[review.status] = [...newShelf];
      await user.save();
    });
    console.log(result);
    book.reviews = [...result];
    await book.save();
    res.end();
  })
  .get('/book/:bookId/reviews', async (req, res) => {
    const book: any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.user',
    });
    res.json(book.reviews);
  })
  .put('/book/:bookId/user/:userId/review/:reviewId/comment', async (req, res) => {
    const book:any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.user',
    });
    const newId = new mongoose.Types.ObjectId();
    book.reviews.forEach((review:any) => {
      const objectId = new ObjectId(req.params.reviewId);
      console.log(objectId);
      if (review._id.toString() === objectId.toString()) {
        console.log(1234);
        review.comments.push({
          _id: newId,
          user: req.params.userId,
          commentMsg: req.body.comment,
          date: Date.now(),
        });
      }
    });
    await book.save();
    res.json(newId).status(201);
  })
  .get('/book/:bookId/user/:userId/review/:reviewId', async (req, res) => {
    const book :any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.comments.user',
    });
    const foundReview = book.reviews.find((review:any) => review._id.toString() === req.params.reviewId);
    console.log(foundReview);
    res.json(foundReview).status(200);
  })
  .delete('/book/:bookId/user/:userId/review/:reviewId/comment/:commentId', async (req, res) => {
    const book :any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.comments.user',
    });
    const foundReview = book.reviews.find((review:any) => review._id.toString() === req.params.reviewId);
    const filteredComments = foundReview.comments.filter((comment:any) => comment._id.toString() !== req.params.commentId);
    foundReview.comments = filteredComments;
    await book.save();
    res.sendStatus(200);
  })
  .put('/book/:bookId/user/:reviewUserId/review/:reviewId/user/:currentUser', async (req, res) => {
    const book: any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.likes.usersThatLiked.user',
    });
    book.reviews.forEach((review: any) => {
      const objectId = new ObjectId(req.params.reviewId);
      if (review._id.toString() === objectId.toString()) {
        review.likes.usersThatLiked.push({
          user: req.params.currentUser,
        });
        review.likes.amount = review.likes.amount + 1;
      }
    });
    await book.save();
    res.sendStatus(200);
  })
  .get('/book/:bookId/user/:reviewUserId/review/:reviewId/user/:currentUser', async (req, res) => {
    const book: any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.likes.usersThatLiked.user',
    });
    let foundUser = {};
    book.reviews.forEach((review: any) => {
      const objectId = new ObjectId(req.params.reviewId);
      console.log(objectId);
      if (review._id.toString() === objectId.toString()) {
        console.log(1234);
        foundUser = review.likes.usersThatLiked.find((user:any, i:number) => {
          console.log(user);
          if (user.user._id.toString() === req.params.currentUser) {
            return true;
          }
          return false;
        });
        console.log(foundUser, 12345);
      }
    });
    res.json(foundUser);
  })
  .delete('/book/:bookId/user/:reviewUserId/review/:reviewId/user/:currentUser', async (req, res) => {
    const book: any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.likes.usersThatLiked.user',
    });
    let newUsersThatLiked = [];
    book.reviews.forEach((review: any) => {
      const objectId = new ObjectId(req.params.reviewId);
      console.log(objectId);
      if (review._id.toString() === objectId.toString()) {
        newUsersThatLiked = review.likes.usersThatLiked
          .filter((user:any, i:number) => user.user._id.toString() !== req.params.currentUser);
        review.likes.usersThatLiked = [...newUsersThatLiked];
        review.likes.amount = review.likes.amount - 1;
      }
    });
    await book.save();
    res.sendStatus(200);
  })
  .put('/book/:bookId/user/:userId/changeStatus', authenticateToken, async (req, res) => {
    try {
      const user:any = await User.findById(req.params.userId).populate(`shelves.${req.body.statuses.oldStatus}`);
      console.log(user.shelves);
      const filteredShelves = user.shelves[req.body.statuses.oldStatus]
        .filter((oneBook:BookEntity) => oneBook._id.toString() !== req.params.bookId);
      user.shelves[req.body.statuses.oldStatus] = filteredShelves;
      user.shelves[req.body.statuses.newStatus].push(req.params.bookId);
      user.save();
      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(404);
    }
  });
