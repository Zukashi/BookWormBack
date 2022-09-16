import { Router } from 'express';

export const authorRouter = Router();

authorRouter.get('/author', async (req, res) => {
  const query = req.query.q as string;
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(`https://openlibrary.org/search/authors.json?q=${encodedQuery}`);
  const data = await response.json();
  console.log(data);
  res.json(data);
});
