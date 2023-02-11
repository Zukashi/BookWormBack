import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { Response, Request } from 'express';
import nodemailer from 'nodemailer';
import Joi from 'joi';
import { BookEntity, NewUserEntity, UserEntity } from '../types';
import { User } from '../Schemas/User';
import { ValidationError } from '../utils/errors';
import { Book } from '../Schemas/Book';
import { RequestEntityWithUser } from '../types/request';
import { client } from '../index';
import { filterUsersByValue } from '../functions/users/getFilteredUsersByValue';
import { getOneReview } from '../functions/users/getOneReview';
import { OneReview } from '../types/book/book-entity';

const bcrypt = require('bcrypt');

export class UserRecord implements UserEntity {
  id:Types.ObjectId;

  age: number;

  base64Avatar: string;

  city: string;

  dateOfBirth: string;

  email: string;

  favorites: BookEntity[];

  firstName: string;

  country:string;

  gender: string;

  lastName: string;

  password: string;

  refreshTokenId: string;

  role: string;

  shelves: { read: Types.ObjectId[]; wantToRead: Types.ObjectId[]; currentlyReading: Types.ObjectId[] };

  username: string;

  constructor(obj: UserEntity) {
    Object.assign(this, obj);
  }

  async insert():Promise<void> {
    const saltAmount = 10;
    if (this.id) {
      return;
    }
    bcrypt.hash(this.password, saltAmount, async (err:string, hash:string) => {
      const user = new User({
        username: this.username.trim(),
        email: this.email.trim(),
        password: hash,
        firstName: '',
        gender: '',
        city: '',
        age: 0,
        country: '',
        lastName: '',
        dateOfBirth: '',
        favorites: [],
        role: 'user',
        base64Avatar: 'data:image/png;base64,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',
      });
      await user.save();
    });
  }

  static async getAllUsers():Promise<UserRecord[]> {
    const users:UserEntity[] = await User.find({}).lean();
    return users.map((user:UserEntity) => new UserRecord(user));
  }

  static async getUser(id:string):Promise<UserRecord> {
    const user:HydratedDocument<UserEntity> = await User.findById(id);
    return new UserRecord(user);
  }

  async updateUser(newUser:UserEntity, res:Response):Promise<void> {
    const oldUser = User.findById(this.id);
    if (!oldUser) { res.status(500); throw new Error('We are sorry something went wrong'); }
    await User.findByIdAndDelete(this.id);
    const userNew = new User({
      ...oldUser,
      ...newUser,

    });
    await userNew.save();
    res.sendStatus(204);
  }

  static async getSearchedUsers(req:Request, res:Response) {
    const users: UserEntity[] = await User.find({});
    const newUsers = filterUsersByValue(users, req.body.value);
    console.log(newUsers);
    if (!req.body.value) {
      res.status(200).json(users);
    } else {
      res.status(200).json(newUsers);
    }
  }

  static async updatePassword(req:Request, res:Response):Promise<UserEntity> {
    const user = await User.findById(`${req.body.id}`);
    const isSamePassword = await bcrypt.compare(req.body.currentPassword, user.password);
    if (isSamePassword) {
      if (req.body.newPassword === req.body.verifyPassword) {
        bcrypt.hash(req.body.verifyPassword, 10, async (err: string, hash: string) => {
          user.password = hash;
          await user.save();
          res.end().status(200);
        });
      } else {
        res.status(400).json("Passwords don't match");
      }
    } else {
      res.status(400).json('Current Password Invalid');
    }
    return user;
  }

  static async deleteBookFromFavorites(req:Request) {
    const userPopulated = await User.findById(req.params.userId).populate('favorites');
    const bookIndex = userPopulated.favorites.findIndex((bookInFavorites) => bookInFavorites.id.toString() === req.params.bookId);
    if (bookIndex === -1) throw new ValidationError('Book not found in favorites', 404);

    userPopulated.favorites.splice(bookIndex, 1);
    await userPopulated.save();
    return userPopulated;
  }

  static async getFavoritesOfUser(req:RequestEntityWithUser, res:Response) {
    const user = await User.findById(req.params.userId).populate('favorites');
    res.json(user.favorites);
  }

  static async resetPassword(req:Request, res:Response) {
    const code = Math.floor(1000 + Math.random() * 9000);
    const details = {
      from: 'testBookWorm@gmail.com',
      to: `${req.body.email}`,
      subject: 'testing',
      text: 'testing nodemail',
      html: `${code}`,
    };
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'testBookWorm@gmail.com',
        pass: 'tyjbqihrcxkagpwc',
      },
    });

    transporter.sendMail(details, (err) => {
      if (err) {
        console.log('it has an error', err);
      } else {
        console.log('works');
        res.json({ code });
      }
    });
  }

  static async newPassword(req:Request) {
    const saltAmount = 10;
    const user = await User.findById(req.params.userId);
    bcrypt.hash(req.body.newPassword, saltAmount, async (err:string, hash:string) => {
      user.password = hash;
      user.save();
    });
  }

  static async getReview(req:Request, res:Response) {
    const reviewFound = await getOneReview(req);
    if (!reviewFound) {
      res.sendStatus(500);
    } else {
      res.status(200).json(reviewFound);
    }
  }

  static async addBookReview(req: Request) {
    const book:HydratedDocument<BookEntity> = await Book.findById(req.params.bookId)
      .populate({
        path: 'reviews.user',
      });
    const schemaNewReview = Joi.object({
      description: Joi.string().valid(''),
      rating: Joi.number().min(1).max(5).required(),
      status: Joi.string().valid('wantToRead', 'currentlyReading', 'read'),
      spoilers: Joi.boolean(),
      comments: Joi.array().empty(),
    });
    try {
      await schemaNewReview.validateAsync(req.body);
    } catch (e) {
      throw new ValidationError('Incorrect data provided to review form', 400);
    }
    const user = await User.findById(req.params.userId);
    if (book.reviews.some((review:OneReview) => review.user.id === user.id)) throw new Error('Review already exists');
    for (const [key, value] of Object.entries(user.shelves)) {
      const filtered = user.shelves[key].filter((id) => req.params.bookId !== id.toString());
      user.shelves[key] = [...filtered];
    }
    user.shelves[req.body.status].push(new Types.ObjectId(req.params.bookId));
    await user.save();
    console.log(5555);
    book.reviews.push({
      user: req.params.userId,
      description: req.body.description,
      rating: req.body.rating,
      status: req.body.status,
      spoilers: req.body.spoilers,
      comments: req.body.comments,
      likes: {
        usersThatLiked: [],
        amount: 0,
      },
    });
    await book.save();
  }

  static async updateBookReview(req:Request) {
    const book = await Book.findById(req.params.bookId)
      .populate({
        path: 'reviews.user',
      })as HydratedDocument<BookEntity>;
    if (!book) throw new ValidationError('Book not found', 404);
    let oldReview:OneReview | undefined;
    book.reviews.forEach((review:OneReview, i:number) => {
      if (review.user.id.toString() === req.params.userId) {
        oldReview = review;
        book.reviews.splice(i, 1);
      }
    });
    book.reviews.push({
      user: req.params.userId,
      description: req.body.description,
      rating: req.body.rating,
      status: req.body.status,
      spoilers: req.body.spoilers,
      date: Date.now(),
      comments: oldReview.comments,
    });
    await book.save();
  }

  static async getAllBooksFromShelves(req:Request, res:Response) {
    const user = await User.findById(req.params.userId);
    res.json(user.shelves).status(200);
  }

  static async sendSmsForPinForPasswordReset(req:Request, res:Response) {
    client.messages
      .create({ body: 'Hello from Twilio', from: '+16506632010', to: '+48513031628' })
      .then((message: any) => console.log(message.sid));
    res.end();
  }

  static async getStatusOfBook(req:Request):Promise<string | undefined> {
    const user:HydratedDocument<UserEntity> = await User.findById(req.params.userId);
    let typeOfShelf;
    for (const [key, valueBookIdArr] of Object.entries(user.shelves)) {
      console.log(valueBookIdArr);
      const foundId = valueBookIdArr.find((id) => {
        console.log(req.params.bookId);
        return id.toString() === req.params.bookId;
      });
      console.log(valueBookIdArr[0], 2222);
      if (foundId) {
        typeOfShelf = key;
      }
    }
    console.log(typeOfShelf);
    return typeOfShelf;
  }

  static async setStatusOfBook(req:Request, res:Response) {
    const { userId, bookId, status } = req.params;
    const user:HydratedDocument<UserEntity> = await User.findById(userId);
    console.log(req.params);
    for (const [key, valueBookIdArr] of Object.entries(user.shelves)) {
      const filtered = user.shelves[key].filter((id) => id.toString() !== bookId);
      user.shelves[key] = [...filtered];
    }

    user.shelves[status] = [...user.shelves[status], new Types.ObjectId(bookId)];
    await user.save();
    res.sendStatus(201);
  }

  static async addToFavorites(bookId:string, userId:string) {
    const user = await User.findById(userId);
    const book:BookEntity = await Book.findById(bookId);
    if (!user) throw new ValidationError('User not found', 404);
    user.favorites.push(book);
    await user.save();
    return user;
  }

  static async clearStatus(req: Request) {
    const user = await User.findById(req.params.userId);
    if (!user) throw new ValidationError('user unidentified', 404);
    for (const [status, bookObjectIds] of Object.entries(user.shelves)) {
      const filtered = bookObjectIds.filter((objectId) => objectId.toString() !== req.params.bookId);
      user.shelves[status] = [...filtered];
    }
    await user.save();
  }
}
