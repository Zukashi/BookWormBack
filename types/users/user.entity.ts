import { Types } from 'mongoose';
import { BookEntity } from '../book/book-entity';

export interface NewUserEntity extends Omit<UserEntity, 'id'> {
    id?: string;
}
export interface UserEntity {
    _id:Types.ObjectId,
    username:string,
    email:string,
    password:string,
    base64Avatar:string,
    firstName?:string,
    gender?:string,
    lastName?:string,
    city?:string,
    age:number,
    dateOfBirth?:string,
    favorites?: BookEntity[],
    role:string,
    shelves?:{
        read:string[]
        wantToRead:string[]
        currentlyReading:string[]
    },
    refreshTokenId?:string,
}
