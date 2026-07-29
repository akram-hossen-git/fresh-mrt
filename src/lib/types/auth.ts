export interface User {
  id: number;
  type: string;
  name: string;
  email: string;
  avatar: string;
  avatar_original: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  login_by: 'email' | 'phone';
}

export interface SignupPayload {
  name: string;
  email_or_phone: string;
  password: string;
  password_confirmation: string;
  register_by: 'email' | 'phone';
}

export interface LoginResponse {
  result: boolean;
  message: string;
  access_token: string;
  token_type: string;
  expires_at: string | null;
  user: User;
}
