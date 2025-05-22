import { LoginCredentials, RegisterCredentials, AuthResponse, AuthError } from '../types/Auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error: AuthError = {
          message: 'Ошибка авторизации',
          status: response.status,
        };
        throw error;
      }
      const data: AuthResponse = await response.json();
      this.token = data.access_token;
      localStorage.setItem('token', data.access_token);
    } catch (error) {
      throw error;
    }
  }

  public async register(credentials: RegisterCredentials): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error: AuthError = {
          message: 'Ошибка регистрации',
          status: response.status,
        };
        throw error;
      }

      const data: AuthResponse = await response.json();
      this.token = data.access_token;
      localStorage.setItem('token', data.access_token);
    } catch (error) {
      throw error;
    }
  }

  public logout(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  public getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = AuthService.getInstance(); 