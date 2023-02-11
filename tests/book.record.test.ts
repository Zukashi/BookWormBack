import mongoose from 'mongoose';
import { server } from '../index';
import { BookRecord } from '../records/book.record';
import { BookEntity } from '../types';
import { Book } from '../Schemas/Book';
import { User } from '../Schemas/User';

afterAll(async () => {
  await mongoose.disconnect();
  await server.close();
});
let bookId:string;
test('insert book ', async () => {
  const req:any = {
    body: {
      isbn: '1619634465',
      title: '',
      author: '',
    },
  };
  const books:BookEntity[] = await BookRecord.getAllBooks();
  const book = new BookRecord(req.body);
  bookId = await book.insert(req.body);
  const insertedBook = await Book.findById(bookId);
  const fetchAfterInsertBooks:BookEntity[] = await BookRecord.getAllBooks();
  expect(insertedBook).toBeDefined();
  expect(books.length).toBeLessThan(fetchAfterInsertBooks.length);
  expect(books).not.toStrictEqual(fetchAfterInsertBooks);
});

test('book delete', async () => {
  await BookRecord.deleteOneBook('1619634465');
  const book = await Book.findOne({ isbn: '1619634465' });
  expect(book).toBeNull();
});
