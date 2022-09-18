import { Router } from 'express';

export const searchRouter = Router();

searchRouter.get('/search/:category/:key', async (req, res) => {
  const { category, key } = req.params;
  const response = await fetch(`https://openlibrary.org/search.json?${category}=${key}`);
  const data = await response.json();
  console.log(data.docs[0].language);
  console.log(data);
  res.json(data);
});
