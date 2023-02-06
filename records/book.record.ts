import axios from 'axios';
import { Response, Request } from 'express';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { BookEntity, NewBookEntity, UserEntity } from '../types';
import { Book } from '../Schemas/Book';
import { User } from '../Schemas/User';
import { Author } from '../Schemas/Author';
import { Genre } from '../Schemas/Genre';

export class BookRecord implements BookEntity {
  private readonly isbn: string;

  private id: Types.ObjectId;

  private author?: string;

  private title?: string;

  constructor(obj: NewBookEntity) {
    this.id = obj.id;

    this.isbn = obj.isbn;
    this.author = obj.author;
    this.title = obj.title;
  }

  async insert(res: Response): Promise<void> {
    if (await Book.findOne({ isbn: this.isbn })) {
      res.status(409);
      throw new Error('Book is already in the database');
    } else {
      this.id = new mongoose.Types.ObjectId();
      let response;
      try {
        response = await axios.get(`https://openlibrary.org/isbn/${this.isbn}.json`);
      } catch (e) {
        res.sendStatus(404);
        return;
      }

      const response2 = await axios.get(`https://openlibrary.org${response.data.works[0].key}.json`);
      const response3 = await axios.get(`http://localhost:3001/author${response.data.authors[0].key}`);
      const bookDetails:HydratedDocument<BookEntity> = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${this.isbn}&jscmd=details&format=json`);
      const newAuthor = new Author(response3.data);
      await newAuthor.save();

      let description;
      if (response2.data.description?.value) {
        description = response2.data.description.value;
      } else if (typeof response2.data.description === 'string') {
        description = response2.data.description;
      } else {
        description = '';
      }
      const { details } = bookDetails.data[`ISBN:${this.isbn}`];
      const genre:any = await Genre.find({});
      console.log(genre);
      details.subjects?.forEach((subject:string) => {
        if (genre[0].genres.length === 0) {
          genre[0].genres = details.subjects;
          return;
        }
        genre[0].genres.forEach((oneGenre:any) => {
          if (oneGenre !== subject) {
            genre[0].genres.push(subject);
          }
        });
      });
      details.publish_date && genre[0].years.push(details.publish_date);
      response3.data.personal_name ? genre[0].authors.push(response3.data.personal_name) : genre[0].authors.push(response3.data.name);
      await genre[0].save();
      const book = new Book({
        publish_date: details?.publish_date ? details.publish_date : null,
        subjects: genre[0].genres,
        title: response.data.title,
        description,
        subject_people: response2.data.subject_people,
        author: response3.data.personal_name ? response3.data.personal_name : response3.data.name,
        isbn: this.isbn,
        ...response.data,
        authors: response.data.authors,
        rating: 0,
        ratingTypeAmount: Array(5).fill(0),
        amountOfRates: 0,
        sumOfRates: 0,
      });
      await book.save();
    }
  }

  static async getAllBooks(): Promise<HydratedDocument<BookEntity>[]> {
    const books = await Book.find({}) as HydratedDocument<BookEntity>[];
    console.log(books);
    return books;
  }

  static async getOneBook(paramsId: string): Promise<BookEntity> {
    const book: BookEntity = await Book.findById(paramsId);
    return book;
  }

  static async filterBooks(value: string): Promise<BookEntity[]> {
    const books = await BookRecord.getAllBooks();
    if (value) {
      const newBooks = books.filter((book: BookEntity) => {
        book.author = book.author?.replace(/[.]/gi, '');
        return book.title?.toLowerCase().includes(value.toLowerCase()) || book.author?.toLowerCase().includes(value.toLowerCase()) || book.isbn?.includes(value.toLowerCase());
      });
      return newBooks;
    }
    return books;
  }

  async updateBook(form: BookEntity, req: Request) {
    const bookDb = await Book.findById(req.params.bookId);
    await Book.findByIdAndDelete(req.params.bookId);
    const { subjects } = req.body;
    let newSubjects = [];
    if (!Array.isArray(subjects)) {
      newSubjects = subjects.split(' ');
    } else {
      newSubjects = [...subjects];
    }
    const newBook = new Book({
      ...bookDb,
      ...req.body,
      subjects: newSubjects,
    });
    await newBook.save();
  }

  static async addRatingOfBook(reqParams: { rating: string, bookId: string }): Promise<HydratedDocument<BookEntity>> {
    try {
      const book: HydratedDocument<BookEntity> = await Book.findById(reqParams.bookId);
      book.ratingTypeAmount[(parseInt(reqParams.rating, 10)) - 1] += 1;
      book.rating = (book.sumOfRates + parseInt(reqParams.rating, 10)) / (book.amountOfRates + 1);
      book.sumOfRates += parseInt(reqParams.rating, 10);
      book.amountOfRates += 1;
      await book.save();
      return book;
    } catch (e) {
      throw new Error('Rating add failed');
    }
  }

  static async updateRatingOfBook(req: Request, res: Response): Promise<HydratedDocument<BookEntity>> {
    const book: HydratedDocument<BookEntity> = await Book.findById(req.params.bookId);

    await Book.findByIdAndDelete(req.params.bookId);
    const obj: any = book.toObject();
    obj.ratingTypeAmount[(parseInt(req.params.rating, 10)) - 1] += 1;

    const newBook: HydratedDocument<BookEntity> = new Book({
      ...obj,
      sumOfRates: obj.sumOfRates + parseInt(req.params.rating, 10),
      rating: (obj.sumOfRates + parseInt(req.params.rating, 10)) / (obj.amountOfRates + 1),
      amountOfRates: obj.amountOfRates + 1,
    });
    await newBook.save();
    return newBook;
  }

  static async deleteRating(req:Request, res:Response) {
    try {
      const book: HydratedDocument<BookEntity> = await Book.findById(req.params.bookId);
      book.ratingTypeAmount[(parseInt(req.params.previousRating, 10)) - 1] -= 1;
      book.sumOfRates -= parseInt(req.params.previousRating, 10);
      book.amountOfRates -= 1;
      book.rating = (book.sumOfRates + parseInt(req.params.previousRating, 10)) / book.amountOfRates;
      await book.save();
      res.sendStatus(200);
    } catch (e) {
      res.status(400);
      throw new Error('Deletion of rating unsuccessful');
    }
  }

  // @TODO SEARCH FOR DELETE RATING AND MAKE ONE FUNCTION INSTEAD OF 2
  static async deleteRating2(req:Request, res:Response) {
    const book: HydratedDocument<BookEntity> = await Book.findById(req.params.bookId).populate({
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
      const newShelf = user.shelves[review.status].filter((book:BookEntity) => req.params.bookId !== book.id.toString());
      user.shelves[review.status] = [...newShelf];
      await user.save();
    });
    console.log(result);
    book.reviews = [...result];
    await book.save();
    res.end();
  }

  static async addCommentToReview(req:Request, res:Response) {
    const book:HydratedDocument<BookEntity> = await Book.findById(req.params.bookId).populate({
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
  }

  static async getReview(req: Request, res: Response) {
    try {
      const book :BookEntity = await Book.findById(req.params.bookId).populate({
        path: 'reviews.comments.user',
      });
      const foundReview = book.reviews
        .find((review:any) => review._id.toString() === req.params.reviewId);
      res.json(foundReview).status(200);
    } catch (e) {
      res.status(400);
      throw new Error('Not found Review');
    }
  }

  static async deleteComment(req:Request, res:Response) {
    const book :HydratedDocument<BookEntity> = await Book.findById(req.params.bookId).populate({
      path: 'reviews.comments.user',
    });
    const foundReview = book.reviews
      .find((review:any) => review._id.toString() === req.params.reviewId);
    const filteredComments = foundReview.comments
      .filter((comment:any) => comment._id.toString() !== req.params.commentId);
    foundReview.comments = filteredComments;
    await book.save();
    res.sendStatus(200);
  }

  static async addUserThatLikedReview(req:Request, res:Response) {
    const book: HydratedDocument<BookEntity> = await Book.findById(req.params.bookId).populate({
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
  }

  static async getUserThatLikedReview(req:Request, res:Response) {
    const book: HydratedDocument<BookEntity> = await Book.findById(req.params.bookId).populate({
      path: 'reviews.likes.usersThatLiked.user',
    });
    let foundUser = {};
    book.reviews.forEach((review: any) => {
      const objectId = new ObjectId(req.params.reviewId);
      if (review._id.toString() === objectId.toString()) {
        foundUser = review.likes.usersThatLiked.find((user:any, i:number) => {
          if (user.user._id.toString() === req.params.currentUser) {
            return true;
          }
          return false;
        });
      }
    });
    res.status(200).json(foundUser);
  }

  static async deleteUserThatLikedFromLikedUsers(req:Request, res:Response) {
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
  }

  static async changeStatusOfBookFromUserBooks(req:Request, res:Response) {
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
  }

  static async getAllGenres(req:Request, res:Response) {
    const genres:any = await Genre.find({});
    res.status(200).json(genres[0]);
  }

  static async filterBooksByYearAuthorOrSubject(req:Request, res:Response) {
    const books: HydratedDocument<BookEntity> = await Book.find({});
    const newBooks = books.filter((book:BookEntity) => {
      let result = true;
      if (req.body.author) {
        result = result && (book.author === req.body.author);
      }

      if (req.body.genres) {
        result = result && (book.subjects.includes(req.body.genres));
      }

      if (req.body.year) {
        result = result && (req.body.year === book.publish_date);
      }
      return result;
    });
    res.status(200).json(newBooks);
  }
}
