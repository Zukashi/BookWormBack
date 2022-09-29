import { Router } from 'express';

export const bookRouter = Router();

bookRouter.get('/book', async (req, res) => {
  // Searching for author based on Input
  const query = req.query.q as string;
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(`https://openlibrary.org/search/authors.json?q=${encodedQuery}`);
  const data = await response.json();
  res.json(data);
});
