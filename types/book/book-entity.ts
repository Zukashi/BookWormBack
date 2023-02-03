import { Types } from 'mongoose';
import { UserEntity } from '../users/user.entity';

export interface NewBookEntity {
    isbn:string,
    author?:string,
    title?:string
    id?:Types.ObjectId,
}

export interface BookEntity extends NewBookEntity {
    author?:string,
    isbn:string,
    publish_date?:string,
    publishers?:string[],
    languages?:{key:string, _id:string}[],
    authors?:{key:string, _id:string}[],
    subjects?:string[],
    subject_people?:string[],
    description?:string,
    ratingTypeAmount?:number[],
    rating?:number,
    amountOfRates?:number,
    sumOfRates?:number,
    reviews?: {
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
    }[]
}
