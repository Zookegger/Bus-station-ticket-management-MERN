import { role } from "../models/users";
// Data transfer object

export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
    role: role;
}

export interface LoginDTO {
    username: string;
    password: string;
}

export interface UpdateProfileDTO {
    username?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    avatar?: string;
}