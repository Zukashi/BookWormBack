import { Router } from 'express';

export const authorRouter = Router();

authorRouter.get('/author', async (req, res) => {
  const query = req.query.q as string;
  const params = encodeURIComponent(query);
  console.log(params);
  const response = await fetch('https://openlibrary.org/search/authors.json?q=j%20k%20rowling');
  const data = await response.json();
  console.log(data);
  res.json(data);
});
