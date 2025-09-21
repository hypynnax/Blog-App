export interface BaseUser {
  id: string;
  email: string;
  username: string;
  name: string;
  surname: string;
  phone: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  avatar: string | null;
  bgImage: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser extends BaseUser {
  _count?: {
    posts: number;
    comments: number;
    views: number;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
  name: string;
  surname: string;
  phone?: string;
}

export interface SignInData {
  emailOrUsername: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export type UserRole = "USER" | "ADMIN" | "MODERATOR";

export interface UserCardProps {
  id: string;
  username: string;
  name: string;
  surname: string;
  avatar?: string;
  bio?: string;
}
