import { Router } from 'express';

export const userRouter = Router();

userRouter.put('/:userId', (req, res) => {
  console.log(req.body);
});
