import { Router } from 'express';
import axios from 'axios';
import { Book } from '../Schemas/Book';

export const searchRouter = Router();

searchRouter.get('/search', async (req, res) => {
  const regex = new RegExp(req.query.q as string, 'i');
  const books = await Book.find({ [req.query.category as string]: regex });
  res.json(books);
}).get('/searchOL', async (req, res) => {
  const { q, page } = req.query;
  try {
    const response = await axios.get('https://openlibrary.org/search.json', {
      params: { q, page },
    });
    console.log(1);
    const seen = new Set();
    const uniqueTitles = response.data.docs.filter((item:any) => {
      const duplicate = seen.has(item.title);
      seen.add(item.title);
      return !duplicate;
    });
    const hasAuthor = response.data.docs.filter((item:any) => {
      if (item.author_name) {
        return true;
      }
      return false;
    });
    response.data.docs = [
      ...uniqueTitles,
      ...hasAuthor,
    ];
    console.log(response.data.docs);
    res.json(response.data);
  } catch (e) {
  }
});
