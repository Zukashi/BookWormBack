import express from 'express';
import { UserRecord } from '../../records/user.record';

export interface RequestEntityWithUser extends express.Request {
    user:UserRecord
}
