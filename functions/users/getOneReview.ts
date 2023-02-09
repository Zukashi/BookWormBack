import { Request } from 'express';
import { Book } from '../../Schemas/Book';
import { BookEntity } from '../../types';

export const getOneReview = (async (req:Request) => {
  let reviewFound;
  const booksPopulated:any = await Book.findById(req.params.bookId)
    .populate({
      path: 'reviews.user',
    });
  booksPopulated.reviews.forEach((review:BookEntity) => {
    if (review.user.id === req.params.userId) {
      reviewFound = {
        userId: review.user.id,
        description: review.description,
        rating: review.rating,
        status: review.status,
        date: review.date,
        spoilers: review.spoilers,
      };
    }
  });
  return reviewFound;
});
