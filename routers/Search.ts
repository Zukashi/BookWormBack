import { Router } from 'express';
import axios from 'axios';
import { Book } from '../Schemas/Book';
import { authenticateToken } from './Login';

export const searchRouter = Router();

searchRouter.get('/search', authenticateToken, async (req, res) => {
  const regex = new RegExp(req.query.q as string, 'i');
  const books = await Book.find({ [req.query.category as string]: regex });
  res.json(books);
}).get('/searchOL', authenticateToken, async (req, res) => {
  const { q, page } = req.query;
  try {
    const response = await axios.get(`https://openlibrary.org/search.json?q=${q}&page=${page}`);
    res.json(response.data);
  } catch (e) {
  }
});
