import { Types } from 'mongoose';
import { BookEntity } from '../book/book-entity';

export interface UserEntity {
    id:Types.ObjectId,
    username:string,
    email:string,
    password:string,
    base64Avatar:string,
    firstName?:string,
    gender?:string,
    lastName?:string,
    city?:string,
    age:number,
    country:string,
    dateOfBirth?:string,
    favorites?: BookEntity[],
    role:string,
    lists:any,
    shelves:{
        [key:string]:any,
        read:{
            book:Types.ObjectId,
            progress:number,
        }[],
        wantToRead:{
            book:Types.ObjectId,
            progress:number,
        }[],
        currentlyReading:{
            book:Types.ObjectId,
            progress:number,
        }[],
    },
    refreshTokenId?:string,
}
export interface NewUserEntity extends Omit<UserEntity, 'id'> {
    id?: Types.ObjectId;
}
