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
}

export interface SetPassword {
  password: string;
  confirmPassword: string;
}
