import { Request, Response } from 'express';
import Joi from 'joi';

export const validateRegister = async (req:Request, res:Response) => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(18).required(),
    email: Joi.string().required().email(),
    password: Joi.string().min(8).max(24),
  });
  try {
    await schema.validateAsync(req.body);
  } catch (e) {
    console.log(e.details[0].context.label);
    res.status(400).json({ status: 'false', message: e.details[0].message, type: e.details[0].context.label });
  }
};
