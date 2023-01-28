import { Router } from 'express';
import axios from 'axios';
import * as mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';
import { authenticateToken, authRole, setUser } from './Login';

export const bookRouter = Router();

bookRouter.get('/books', setUser, authenticateToken, authRole('user'), async (req, res) => {
  const books = await Book.find({});
  // const result = books.map(async (book) => {
  //   const response = await fetch(`https://openlibrary.org/isbn/${book.isbn}.json`);
  //   const data = await response.json();
  //   return data;
  // });
  // const values = await Promise.all(result);
  res.json(books).sendStatus(201);
}).get('/book/:id', async (req, res) => {
  const book = await Book.findById(req.params.id);
  res.json(book);
}).post('/bookAdmin/search/:value', async (req, res) => {
  const books = await Book.find({});
  const newBooks = books.filter((book:any) => {
    book.author = book.author?.replace(/[.]/gi, '');
    return book.title?.toLowerCase().includes(req.body.value.toLowerCase()) || book.author?.toLowerCase().includes(req.body.value.toLowerCase()) || book.isbn?.includes(req.body.value.toLowerCase());
  });
  if (!req.body.value) {
    res.json(books);
  } else {
    res.json(newBooks);
  }
})
  .post('/book', async (req, res) => {
    const { title, author, isbn } = req.body;
    const response = await axios.get(`https://openlibrary.org/isbn/${isbn}.json`);
    const response2 = await axios.get(`https://openlibrary.org${response.data.works[0].key}.json`);
    const response3 = await axios.get(`http://localhost:3001/author${response.data.authors[0].key}`);

    let description;
    if (response2.data.description?.value) {
      description = response2.data.description.value;
    } else if (typeof response2.data.description === 'string') {
      description = response2.data.description;
    } else {
      description = '';
    }
    const book = new Book({

      title: response.data.title,
      description,
      subjects: response2.data.subjects,
      subject_people: response2.data.subject_people,
      author: response3.data.personal_name ? response3.data.personal_name : response3.data.name,
      isbn,
      ...response.data,
      authors: response.data.authors,
      rating: 0,
      ratingTypeAmount: Array(5).fill(0),
      amountOfRates: 0,
      sumOfRates: 0,
    });
    await book.save();
    res.end();
  })
  .put('/book/:bookId', async (req, res) => {
    const form = req.body;
    const book = await Book.findById(req.params.bookId);
    await Book.findByIdAndDelete(req.params.bookId);
    const { subjects } = form;
    let newSubjects = [];
    if (!Array.isArray(subjects)) {
      newSubjects = subjects.split(' ');
    } else {
      newSubjects = [...subjects];
    }
    const newBook = new Book({
      ...book,
      ...form,
      subjects: newSubjects,
    });
    await newBook.save();
    res.end();
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
    console.log(req.params);
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
    book.reviews.forEach(async (review:any) => {
      if (review.user.id !== req.params.userId) {
        return;
      }
      const user: any = await User.findById(req.params.userId).populate({
        path: `shelves.${review.status}`,
      });
      if (!user) {
        res.sendStatus(404);
      }
      console.log(user.shelves.read);
      const newShelf = user.shelves[review.status].filter((shelf:any) => {
        console.log(req.params.bookId === shelf);
        console.log(shelf);
        return req.params.bookId !== shelf;
      });
      user.shelves[review.status] = [...newShelf];
      await user.save();
      console.log(user.shelves.read);
    });
    console.log(result);
    book.reviews = [...result];
    await book.save();
    console.log('end');
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
    book.reviews.forEach((review:any) => {
      const objectId = new ObjectId(req.params.reviewId);
      console.log(objectId);
      if (review._id.toString() === objectId.toString()) {
        console.log(1234);
        review.comments.push({
          user: req.params.userId,
          commentMsg: req.body.comment,
          date: Date.now(),
        });
      }
    });
    await book.save();
    res.sendStatus(201);
  })
  .get('/book/:bookId/user/:userId/review/:reviewId', async (req, res) => {
    const book :any = await Book.findById(req.params.bookId).populate({
      path: 'reviews.comments.user',
    });
    const foundReview = book.reviews.find((review:any) => review._id.toString() === req.params.reviewId);
    console.log(foundReview);
    res.json(foundReview.comments).status(200);
  });
