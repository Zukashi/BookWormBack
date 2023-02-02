import { NextFunction, Request, Response } from 'express';

export class ValidationError extends Error {
}

export const handleError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  res
    .json({
      message: err instanceof Error ? err.message : 'Sorry, please try again later.',
    });
};
