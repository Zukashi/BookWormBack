import { Router } from 'express';

export const searchRouter = Router();

searchRouter.get('/search/:category/:key', async (req, res) => {
  const { category, key } = req.params;
  const response = await fetch(`https://openlibrary.org/search.json?${category}=${key}`);
  const data = await response.json();
  console.log(data.docs);
  res.json(data.docs);
}).get('/works/:bookId', async (req, res) => {
  console.log(req.params.bookId);
  const response = await fetch(`https://openlibrary.org/works/${req.params.bookId}.json`);
  const data = await response.json();
  res.json(data);
});
