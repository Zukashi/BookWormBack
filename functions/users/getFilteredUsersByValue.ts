import { UserEntity } from '../../types';

export const filteredUsersByValue = (users:UserEntity[], value:string) => { users.filter((user) => user.username?.toLowerCase().trim().includes(value.toLowerCase()) || user.firstName?.toLowerCase().trim().includes(value) || user.lastName?.toLowerCase().trim().includes(value)); };
