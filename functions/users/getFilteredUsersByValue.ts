import { UserEntity } from '../../types';

export const filterUsersByValue = (users:UserEntity[], value:string):UserEntity[] => users.filter((user):boolean => user.username?.toLowerCase().trim().includes(value.toLowerCase()) || user.firstName?.toLowerCase().trim().includes(value) || user.lastName?.toLowerCase().trim().includes(value));
