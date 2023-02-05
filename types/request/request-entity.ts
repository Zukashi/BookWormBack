import express from 'express';
import { HydratedDocument } from 'mongoose';
import { UserRecord } from '../../records/user.record';
import { UserEntity } from '../users';

export interface RequestEntityWithUser extends express.Request {
    user:HydratedDocument<UserEntity>
}
