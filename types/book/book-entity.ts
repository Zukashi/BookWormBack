import { Types } from 'mongoose';
import { UserEntity } from '../users/user.entity';

export interface OneReview {

    readonly _id:string,
    readonly user:UserEntity,
    description?:string,
    rating:number,
    status:string,
    date:Date,
    likes:{
        usersThatLiked:{
            user:UserEntity,
            _id:string,
        }[],
        amount:number,
    },
    spoilers:boolean,
    comments:{
        user:UserEntity,
        commentMsg:string,
        date:Date,
        _id:string,

    }
}
export interface BookEntity {
    _id:Types.ObjectId,
    author?:string,
    title?:string
    isbn:string,
    publish_date?:string,
    publishers?:string[],
    languages?:{key:string, _id:string}[],
    authors?:{key:string, _id:string}[],
    subjects?:string[],
    subject_people?:string[],
    description?:string,
    works:{key:string}[],
    number_of_pages:number,
    ratingTypeAmount?:number[],
    rating:number,
    amountOfRates:number,
    shelves:{
        want_to_read:number,
        currently_reading:number,
        already_read:number,
    }
    sumOfRates?:number,
    reviews?: OneReview[]
}

export interface NewBookEntity extends Omit<BookEntity, 'id'>{
    id?:Types.ObjectId,
}
