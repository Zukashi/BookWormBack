import axios from 'axios';
import mongoose, { Types } from 'mongoose';
import { BookEntity, NewBookEntity, UserEntity } from '../types';
import { Book } from '../Schemas/Book';

export class BookRecord implements BookEntity {
  private isbn: string;

  private _id:Types.ObjectId;

  private author?:string;

  private title?:string;

  constructor(obj:NewBookEntity) {
    this._id = obj._id;

    this.isbn = obj.isbn;
    this.author = obj.author;
    this.title = obj.title;
  }

  async insert(res:any):Promise<void> {
    if (Book.findOne({ isbn: this.isbn })) {
      res.status(409).json({ status: false, result: 'Isbn is already in the database' });
    } else {
      this._id = new mongoose.Types.ObjectId();
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

  static async getAllBooks():Promise<BookEntity[]> {
    const books = await Book.find({});
    return books;
  }

  static async getOneBook(paramsId:string):Promise<BookEntity> {
    const book:BookEntity = await Book.findById(paramsId);
    return book;
  }

  static async filterBooks(value:string):Promise<BookEntity[]> {
    const books = await BookRecord.getAllBooks();
    console.log(value);
    if (value) {
      const newBooks = books.filter((book:BookEntity) => {
        book.author = book.author?.replace(/[.]/gi, '');
        return book.title?.toLowerCase().includes(value.toLowerCase()) || book.author?.toLowerCase().includes(value.toLowerCase()) || book.isbn?.includes(value.toLowerCase());
      });
      return newBooks;
    }
    return books;
  }
}
