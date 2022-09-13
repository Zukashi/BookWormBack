import { Router } from 'express';

// eslint-disable-next-line import/prefer-default-export,no-undef
export const registerRouter = Router();

registerRouter.post('/register', (req, res) => {
  console.log(req.body);
});
