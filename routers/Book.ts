import { Router } from 'express';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';

export const bookRouter = Router();

bookRouter.get('/books', async (req, res) => {
  const books = await Book.find({});
  const result = books.map(async (book) => {
    const response = await fetch(`https://openlibrary.org/isbn/${book.isbn}.json`);
    const data = await response.json();
    return data;
  });
  const values = await Promise.all(result);
  res.json(values);
}).post('/book', async (req, res) => {
  const { isbn, title, author } = req.body;
}).post('/addBook', async (req, res) => {
  const { title, author, isbn } = req.body;
  console.log(req.body);
  const book = new Book({
    title,
    author,
    isbn,
  });
  await book.save();
  res.end();
});
