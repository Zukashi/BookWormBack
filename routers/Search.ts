import { Router } from 'express';
import { Book } from '../Schemas/Book';

export const searchRouter = Router();

searchRouter.get('/search', async (req, res) => {
  const q = req.query.q as string;
  const regex = new RegExp(q, 'i');
  const books = await Book.find({ [req.query.category as string]: regex });
  res.json(books);
});
