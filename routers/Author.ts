import { Router } from 'express';

export const authorRouter = Router();

authorRouter.get('/author', async (req, res) => {
  // Searching for author based on Search Bar Input
  const query = req.query.q as string;
  const encodedQuery = encodeURIComponent(query);
  const response = await fetch(`https://openlibrary.org/search/authors.json?q=${encodedQuery}`);
  const data = await response.json();
  res.json(data);
}).get('/author/:authorId', async (req, res) => {
  console.log(req.params.authorId);
  // Searching for author through authorID
  const response = await fetch(`https://openlibrary.org/authors/${req.params.authorId}.json`);
  const authorInfo = await response.json();
  console.log(authorInfo);
  res.json(authorInfo);
});
