import { Router } from 'express';

export const authorRouter = Router();

authorRouter.get('/author', async (req, res) => {
  // Searching for author based on Input
  const query = req.query.q as string;
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(`https://openlibrary.org/search/authors.json?q=${encodedQuery}`);
  const data = await response.json();
  res.json(data);
}).get('/author/:authorId', async (req, res) => {

});
