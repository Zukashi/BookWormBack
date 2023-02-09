import mongoose from 'mongoose';
import { server } from '../index';
import { BookRecord } from '../records/book.record';
import { BookEntity } from '../types';

afterAll(async () => {
  await mongoose.disconnect();
  await server.close();
});

test('insert book ', async () => {
  const req:any = {
    body: {
      isbn: '1619634464',
      title: '',
      author: '',
    },
  };
  const books:BookEntity[] = await BookRecord.getAllBooks();
  const book = new BookRecord(req.body);
  const insertedBook = await book.insert(req.body);
  const fetchAfterInsertBooks:BookEntity[] = await BookRecord.getAllBooks();
  expect(insertedBook).toBeDefined();
  expect(books.length).toBeLessThan(fetchAfterInsertBooks.length);
});
