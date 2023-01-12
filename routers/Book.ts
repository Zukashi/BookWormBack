import { Router } from 'express';
import { User } from '../Schemas/User';
import { Book } from '../Schemas/Book';
import { authenticateToken, authRole, setUser } from './Login';

export const bookRouter = Router();

bookRouter.get('/books/:userId', setUser, authenticateToken, authRole('user'), async (req, res) => {
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
  const newBooks = books.filter((book) => {
    book.author = book.author?.replace(/[.]/gi, '');
    return book.title?.toLowerCase().includes(req.body.value.toLowerCase()) || book.author?.toLowerCase().includes(req.body.value) || book.isbn?.includes(req.body.value);
  });
  if (!req.body.value) {
    res.json(books);
  } else {
    res.json(newBooks);
  }
})
  .post('/book', async (req, res) => {
    const { title, author, isbn } = req.body;
    const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`);
    const data = await response.json();
    const response2 = await fetch(`https://openlibrary.org${data.works[0].key}.json`);
    const data2 = await response2.json();
    const response3 = await fetch(`http://localhost:3001/author${data.authors[0].key}`);
    const data3 = await response3.json();
    let description;
    if (data2.description.value) {
      description = data2.description.value;
    } else if (typeof data2.description === 'string') {
      description = data2.description;
    } else {
      description = '';
    }
    const book = new Book({

      title: data.title,
      description,
      subjects: data2.subjects,
      subject_people: data2.subject_people,
      author: data3.personal_name ? data3.personal_name : data3.name,
      isbn,
      ...data,
      authors: data.authors,
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
  .put('/book/:bookId/:rating', async (req, res) => {
    const book = await Book.findById(req.params.bookId);

    await Book.findByIdAndDelete(req.params.bookId);
    const obj = book.toObject();
    const newBook = new Book({
      ...obj,
      sumOfRates: obj.sumOfRates + parseInt(req.params.rating, 10),
      rating: (obj.sumOfRates + parseInt(req.params.rating, 10)) / (obj.amountOfRates + 1),
      amountOfRates: obj.amountOfRates + 1,
    });
    await newBook.save();
    res.json(newBook);
  });
