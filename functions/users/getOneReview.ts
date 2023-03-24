import { Request } from 'express';
import { Book } from '../../Schemas/Book';
import { BookEntity } from '../../types';

export const getOneReview = (async (req:Request) => {
  const booksPopulated:any = await Book.findById(req.params.bookId)
    .populate({
      path: 'reviews.user',
    });
  const foundReview = booksPopulated.reviews.find((review:BookEntity) => {
    if (review.user.id === req.params.userId) {
      return true;
    }
  });
  return foundReview;
});
