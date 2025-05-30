export type UserRole = 'admin' | 'provider' | 'consumer';

export interface User {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  isEmailVerified?: boolean;
} 