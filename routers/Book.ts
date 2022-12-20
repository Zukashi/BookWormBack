import { Router } from 'express';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';

export const bookRouter = Router();

bookRouter.get('/books', async (req, res) => {
  const books = await Book.find({});
  // const result = books.map(async (book) => {
  //   const response = await fetch(`https://openlibrary.org/isbn/${book.isbn}.json`);
  //   const data = await response.json();
  //   return data;
  // });
  // const values = await Promise.all(result);
  console.log(books);
  res.json(books);
}).post('/book', async (req, res) => {
  const { isbn, title, author } = req.body;
}).post('/addBook', async (req, res) => {
  const { title, author, isbn } = req.body;
  console.log(req.body);
  const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
  const data = await response.json();
  const response2 = await fetch(`https://openlibrary.org${data.works[0].key}.json`);
  const data2 = await response2.json();
  console.log(data);
  const book = new Book({

    title: data.title,
    description: data2.description,
    subjects: data2.subjects,
    subject_people: data2.subject_people,
    author,
    isbn,
    ...data,
    authors: data.authors,
  });
  await book.save();
  res.end();
}).delete('/book/:bookId', async (req, res) => {
  const { bookId } = req.params;
  await Book.deleteOne({ _id: bookId });
  res.end();
});
