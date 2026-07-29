import { apiFetch } from '../api-client';
import type { LoginPayload, SignupPayload, LoginResponse, User } from '../types/auth';
import type { ActionResponse } from '../types/common';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signup(payload: SignupPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getUser(): Promise<{ data: User }> {
  const user = await apiFetch<User>('/auth/user');
  return { data: user };
}

export async function logout(): Promise<ActionResponse> {
  return apiFetch<ActionResponse>('/auth/logout');
}

export async function socialLogin(provider: string, accessToken: string) {
  return apiFetch<LoginResponse>('/auth/social-login', {
    method: 'POST',
    body: JSON.stringify({ provider, access_token: accessToken }),
  });
}

export async function forgotPassword(emailOrPhone: string, sendCodeBy: 'email' | 'phone' = 'email') {
  return apiFetch<ActionResponse>('/auth/password/forget_request', {
    method: 'POST',
    body: JSON.stringify({ email_or_phone: emailOrPhone, send_code_by: sendCodeBy }),
  });
}

export async function confirmReset(verificationCode: string, password: string) {
  return apiFetch<ActionResponse>('/auth/password/confirm_reset', {
    method: 'POST',
    body: JSON.stringify({ verification_code: verificationCode, password }),
  });
}
