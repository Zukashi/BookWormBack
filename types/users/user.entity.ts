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
    shelves?:{
        read:Types.ObjectId[]
        wantToRead:Types.ObjectId[]
        currentlyReading:Types.ObjectId[]
    },
    refreshTokenId?:string,
}
export interface NewUserEntity extends Omit<UserEntity, 'id'> {
    id?: Types.ObjectId;
}
