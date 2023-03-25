import axios from 'axios';
import { Response, Request } from 'express';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import Joi from 'joi';
import { BookEntity, NewBookEntity, UserEntity } from '../types';
import { Book } from '../Schemas/Book';
import { User } from '../Schemas/User';
import { Author } from '../Schemas/Author';
import { Genre } from '../Schemas/Genre';
import { OneReview } from '../types/book/book-entity';
import { ValidationError } from '../utils/errors';

export class BookRecord implements BookEntity {
  private readonly isbn: string;

  private _id: Types.ObjectId;

  private author?: string;

  private title?: string;

  constructor(obj: NewBookEntity) {
    this._id = obj.id;

    this.isbn = obj.isbn;
    this.author = obj.author;
    this.title = obj.title;
  }

  async insert(req:Request): Promise<string> {
    const newBookSchema = Joi.object({
      isbn: Joi.string().min(10).max(13).required(),
      title: Joi.string().allow(''),
      author: Joi.string().allow(''),
    });

    try {
      await newBookSchema.validateAsync(req.body);
    } catch (e) {
      throw new ValidationError('Incorrect data', 400);
    }
    if (await Book.findOne({ isbn: this.isbn })) {
      throw new ValidationError('Book is already in the database', 409);
    } else {
      this._id = new mongoose.Types.ObjectId();
      let response;
      try {
        response = await axios.get(`https://openlibrary.org/isbn/${this.isbn}.json`);// dziala;
      } catch (e) {
        throw new ValidationError('book with given isbn doesnt exist', 404);
      }
      const response2 = await axios.get(`https://openlibrary.org${response.data.works[0].key}.json`);// dziala
      let response3;
      if (response.data.authors) {
        response3 = await axios.get(`http://localhost:3001/author${response.data.authors[0].key}`);
      }
      const ratingsResponseGet = await axios.get(`https://openlibrary.org${response.data.works[0].key}/ratings.json`);// dziala

      const shelvesResponseGet = await axios.get(`https://openlibrary.org${response.data.works[0].key}/bookshelves.json`);// dziala
      const bookDetails:HydratedDocument<BookEntity> = await axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${this.isbn}&jscmd=details&format=json`);// dziala
      if (response3?.data) {
        try {
          response3.data.bio = response3.data.bio ? response3.data.bio : '';
          response3.data.bio = response3.data.bio.value ? response3.data.bio.value : '';
          const newAuthor = new Author(response3.data);
          await newAuthor.save();
        } catch (e) {
          console.log(e);
          throw new Error(e);
        }
      }
      let description;
      if (response2.data.description?.value) {
        description = response2.data.description.value;
      } else if (typeof response2.data.description === 'string') {
        description = response2.data.description;
      } else {
        description = '';
      }
      const { details } = bookDetails.data[`ISBN:${this.isbn}`];
      console.log(333);
      const subjects = [...new Set(details.subjects)] as string[];

      const oldGenre:any = await Genre.find({});
      if (oldGenre.length === 0) {
        const newGenre = new Genre({
          authors: [],
          years: [],
          genres: [],
        });
        await newGenre.save();
      }
      const genre = await Genre.find({});
      subjects?.forEach((subject:string) => {
        if (genre[0].genres.length === 0) {
          genre[0].genres = subjects;
          return;
        }
        if (!genre[0].genres.includes(subject)) {
          genre[0].genres.push(subject);
        }
      });
      details.publish_date && genre[0].years.push(details.publish_date);
      genre[0].years = [...new Set(genre[0].years)];

      response3?.data?.personal_name ? genre[0].authors.push(response3.data.personal_name) : genre[0].authors.push(response3?.data?.name);
      genre[0].authors = [...new Set(genre[0].authors)];
      function getSum(counts: { [key: string]: number }): number {
        let sum = 0;
        for (const key in counts) {
          sum += parseInt(key, 10) * counts[key];
        }
        return sum;
      }

      const genreSet = new Set(genre[0].genres);
      genre[0].genres = [...genreSet];
      const newRatingCounts = Array(5).fill(0);
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 5; i++) {
        newRatingCounts[i] = parseInt(ratingsResponseGet.data.counts[`${i + 1}`], 10);
      }
      await genre[0].save();
      const book:HydratedDocument<BookEntity> = new Book({
        publish_date: details?.publish_date ? details.publish_date : null,
        subjects,
        title: response.data.title,
        description: typeof description === 'object' ? description.value : description,
        subject_people: response2.data.subject_people,
        author: response3?.data?.personal_name ? response3.data.personal_name : '',
        isbn: this.isbn,
        number_of_pages: response.data.number_of_pages,
        works: response.data.works[0].key,
        ...response.data,
        authors: response.data.authors,
        rating: ratingsResponseGet.data.summary.average ? ratingsResponseGet.data.summary.average : 0,
        ratingTypeAmount: newRatingCounts,
        shelves: shelvesResponseGet.data.counts,
        amountOfRates: ratingsResponseGet.data.summary.count ? ratingsResponseGet.data.summary.count : 0,
        sumOfRates: getSum(ratingsResponseGet.data.counts),
      });
      await book.save();
      return book.id;
    }
  }

  static async getAllBooks(): Promise<HydratedDocument<BookEntity>[]> {
    const books = await Book.find({}) as HydratedDocument<BookEntity>[];

    return books;
  }

  static async getOneBook(paramsId: string): Promise<BookEntity> {
    const book: BookEntity = await Book.findById(new Types.ObjectId(paramsId));

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

  static async addRatingOfBook(reqParams: {bookId:string, rating:string}) {
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

  static async updateRatingOfBook(req: Request): Promise<HydratedDocument<BookEntity>> {
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

  // @TODO SEARCH FOR DELETE RATING AND MAKE ONE FUNCTION INSTEAD OF 2
  static async deleteRating2(req:Request) {
    const book: HydratedDocument<BookEntity> = await Book.findById(req.params.bookId).populate({
      path: 'reviews.user',
    });

    if (!book) {
      throw new ValidationError(
        'Book not found',
        404,
      );
    }

    const oldReview:OneReview = book.reviews.find((review:OneReview) => review.user.id.toString() === req.params.userId);

    book.ratingTypeAmount[(oldReview.rating) - 1] -= 1;
    book.sumOfRates -= oldReview.rating;
    book.amountOfRates -= 1;
    if (book.amountOfRates > 0 && book.sumOfRates > 0) {
      book.rating = book.sumOfRates / book.amountOfRates;
    } else {
      book.rating = 0;
    }

    const result:OneReview[] = book.reviews.filter((review:OneReview):boolean => review.user.id.toString() !== req.params.userId);
    book.reviews.forEach(async (review:OneReview):Promise<void> => {
      if (review.user.id.toString() !== req.params.userId) {
        return null;
      }
      const user: HydratedDocument<UserEntity> = await User.findById(req.params.userId).populate({
        path: `shelves.${review.status}.book`,
      });
      if (!user) {
        throw new ValidationError('User not found', 404);
      }

      const newShelf = user.shelves[review.status].filter((book:BookEntity) => req.params.bookId !== book.id.toString());
      user.shelves[review.status] = [...newShelf];
      await user.save();
    });

    book.reviews = [...result];
    await book.save();
  }

  static async addCommentToReview(req:Request, res:Response) {
    const book:HydratedDocument<BookEntity> = await Book.findById(req.params.bookId).populate({
      path: 'reviews.user',
    });
    const newId = new mongoose.Types.ObjectId();
    book.reviews.forEach((review:any) => {
      const objectId = new ObjectId(req.params.reviewId);

      if (review._id.toString() === objectId.toString()) {
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
    let hasLiked = false;
    book.reviews.forEach((review: any) => {
      const objectId = new ObjectId(req.params.reviewId);
      if (review._id.toString() === objectId.toString()) {
        foundUser = review.likes.usersThatLiked.find((user:any, i:number) => {
          if (user.user._id.toString() === req.params.currentUser) {
            hasLiked = true;
            return true;
          }
          return false;
        });
      }
    });
    res.status(200).json({
      foundUser,
      hasLiked,
    });
  }

  static async deleteUserThatLikedFromLikedUsers(req:Request, res:Response) {
    const book: HydratedDocument<BookEntity> = await Book.findById(req.params.bookId).populate({
      path: 'reviews.likes.usersThatLiked.user',
    });
    let newUsersThatLiked = [];
    book.reviews.forEach((review: any) => {
      const objectId = new ObjectId(req.params.reviewId);

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
      const user:HydratedDocument<UserEntity> = await User.findById(req.params.userId).populate(`shelves.${req.body.statuses.oldStatus}`);

      const filteredShelves = user.shelves[req.body.statuses.oldStatus]
        .filter((oneBook:BookEntity) => oneBook._id.toString() !== req.params.bookId);
      user.shelves[req.body.statuses.oldStatus] = filteredShelves;
      user.shelves[req.body.statuses.newStatus].push(req.params.bookId);
      await user.save();
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
    console.log(books);
    const filterBySearch = newBooks.filter((book:BookEntity) => {
      if (book.title.toLowerCase().includes(req.body.search.toLowerCase())) {
        return book;
      }
      if (book.author.toLowerCase().includes(req.body.search.toLowerCase())) {
        return book;
      }
    });
    res.status(200).json(filterBySearch);
  }

  static async deleteOneBook(bookId: string) {
    const book:HydratedDocument<BookEntity> = await Book.findById(bookId);
    console.log(book._id.toString(), bookId);
    if (book._id.toString() !== bookId) throw new ValidationError('Book which you want to delete doesnt exist already', 404);
    try {
      await Book.deleteOne({ isbn: book.isbn });
    } catch (e) {
      throw new ValidationError('id doesnt exist in database', 400);
    }
  }

  static async deletePreviousRatings(req:Request) {
    const book:HydratedDocument<BookEntity> = await Book.findById(req.params.bookId);
    book.ratingTypeAmount[(parseInt(req.params.previousRating, 10)) - 1] -= 1;
    book.sumOfRates -= parseInt(req.params.previousRating, 10);
    book.rating = (book.sumOfRates + parseInt(req.params.previousRating, 10)) / (book.amountOfRates - 1);
    book.amountOfRates -= 1;
    await book.save();
  }

  static async getBooksSpecifiedByPageAndNumberFromQueryParamsAndOptionallyFilteredBySearchValue(req: Request) {
    let books:HydratedDocument<BookEntity>[] = await Book.find({}).skip((Number(req.query.page) * Number(req.query.booksPerPage)) - Number(req.query.booksPerPage)).limit(Number(req.query.booksPerPage));
    if (req.query.searchValue) {
      books = books.filter((book:BookEntity) => {
        const result = (book.author.toLowerCase().includes((req.query.searchValue as string).toLowerCase()))
            || book.title.toLowerCase().includes((req.query.searchValue as string).toLowerCase());

        return result;
      });
    }
    console.log(3333);
    return books;
  }

  static async getBookLists(req: Request, res:Response) {
    console.log(req.query);
    const user:HydratedDocument<UserEntity> = await User.findById(req.query.id);
    const listOfIdsOfBooks = user.lists[req.query.list as string];
    const populatedBooks = await Promise.all(listOfIdsOfBooks.map(async (id:string) => {
      const book:HydratedDocument<BookEntity> = await Book.findById(id);
      return book;
    }));
    console.log(parseInt(req.query.page as string, 10) - 1);
    console.log(parseInt(req.query.booksPerPage as string, 10));
    console.log((parseInt(req.query.page as string, 10)));
    const pagedBooks = populatedBooks.slice((parseInt(req.query.booksPerPage as string, 10) * parseInt(req.query.page as string, 10)) - parseInt(req.query.booksPerPage as string, 10), parseInt(req.query.booksPerPage as string, 10) * (parseInt(req.query.page as string, 10)));
    res.json(pagedBooks);
    // if (req.query.searchValue) {
    //   books = books.filter((book:BookEntity) => {
    //     const result = (book.author.toLowerCase().includes((req.query.searchValue as string).toLowerCase()))
    //         || book.title.toLowerCase().includes((req.query.searchValue as string).toLowerCase());
    //
    //     return result;
    //   });
    // }
    // console.log(books);
    // console.log(3333);
  }
}
