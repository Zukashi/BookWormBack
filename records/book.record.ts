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

  private async insert(res:any):Promise<void> {
    if (this._id) {
      this._id = new mongoose.Types.ObjectId();
      throw new Error('Book with this id already inserted');
    } else {
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
}

const newBook:NewBookEntity = new BookRecord('9781975345631');
console.log(newBook.isbn);
