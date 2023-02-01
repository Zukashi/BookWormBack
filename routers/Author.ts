import { Router } from 'express';
import axios from 'axios';

export const authorRouter = Router();

authorRouter.get('/author', async (req, res) => {
  // Searching for author based on Search Bar Input
  const query = req.query.q as string;
  const encodedQuery = encodeURIComponent(query);
  const response = await axios.get(`https://openlibrary.org/search/authors.json?q=${encodedQuery}`);

  res.json(response.data);
}).get('/author/:authorId', async (req, res) => {
  console.log(req.params.authorId);
  // Searching for author through authorID
  const response = await axios.get(`https://openlibrary.org/authors/${req.params.authorId}.json`);

  res.json(response.data);
}).get('/author/authors/:olId', async (req, res) => {
  const response = await axios.get(`https://openlibrary.org/authors/${req.params.olId}.json`);

  res.json(response.data);
});
