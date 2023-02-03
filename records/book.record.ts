import axios from 'axios';
import { Response, Request } from 'express';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { BookEntity, NewBookEntity, UserEntity } from '../types';
import { Book } from '../Schemas/Book';

export class BookRecord implements BookEntity {
  private readonly isbn: string;

  private id:Types.ObjectId;

  private author?:string;

  private title?:string;

  constructor(obj:NewBookEntity) {
    this.id = obj.id;

    this.isbn = obj.isbn;
    this.author = obj.author;
    this.title = obj.title;
  }

  async insert(res:Response):Promise<void> {
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

  static async getAllBooks():Promise<HydratedDocument<BookEntity>[]> {
    const books:HydratedDocument<BookEntity>[] = await Book.find({});
    return books;
  }

  static async getOneBook(paramsId:string):Promise<BookEntity> {
    const book:BookEntity = await Book.findById(paramsId);
    return book;
  }

  static async filterBooks(value:string):Promise<BookEntity[]> {
    const books = await BookRecord.getAllBooks();
    if (value) {
      const newBooks = books.filter((book:BookEntity) => {
        book.author = book.author?.replace(/[.]/gi, '');
        return book.title?.toLowerCase().includes(value.toLowerCase()) || book.author?.toLowerCase().includes(value.toLowerCase()) || book.isbn?.includes(value.toLowerCase());
      });
      return newBooks;
    }
    return books;
  }

  async updateBook(form:BookEntity, req:Request) {
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

  static async addRatingOfBook(reqParams: {rating:string, bookId:string}):Promise<HydratedDocument<BookEntity>> {
    try {
      const book:HydratedDocument<BookEntity> = await Book.findById(reqParams.bookId);
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

  static async updateRatingOfBook(req:Request, res:Response):Promise<HydratedDocument<BookEntity>> {
    try {
      const book:BookEntity = await Book.findById(req.params.bookId);

      await Book.findByIdAndDelete(req.params.bookId);
      const obj:any = book.toObject();
      obj.ratingTypeAmount[(parseInt(req.params.rating, 10)) - 1] += 1;

      const newBook:HydratedDocument<BookEntity> = new Book({
        ...obj,
        sumOfRates: obj.sumOfRates + parseInt(req.params.rating, 10),
        rating: (obj.sumOfRates + parseInt(req.params.rating, 10)) / (obj.amountOfRates + 1),
        amountOfRates: obj.amountOfRates + 1,
      });
      await newBook.save();
      return newBook;
    } catch (e) {
      res.sendStatus(400);
    }
  }
}
