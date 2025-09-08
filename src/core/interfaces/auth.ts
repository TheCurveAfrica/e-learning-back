export interface LoginResponse {
  firstname: string;
  lastname: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}

export interface UserProfileData {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  gender: string;
  role?: string;
  isEmailVerified: boolean;
  stack?: string;
  status?: string;
  bio?: string;
  profilePicture?: string;
}

export interface TokenPayload {
  id: string;
  email: string;
}

export interface RefreshTokenPayload {
  id: string;
}

export interface ResendVerificationEmailResponse {
  email: string;
  nextResendDuration: number;
}

export interface IUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  isEmailVerified: boolean;
  stack: string;
  status: string;
  role: string;
  bio: string;
  profilePicture: string;
}

export interface SetPassword {
  password: string;
  confirmPassword: string;
}

export interface IAdmin {
  _id?: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  profilePicture?: string;
}
