export interface UserSession {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}
