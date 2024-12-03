export class AuthService {
  async login(email: string, password: string) {
    // Implement login logic
    return { success: true, token: 'mock-token' };
  }

  async logout() {
    // Implement logout logic
    localStorage.removeItem('auth_token');
    return { success: true };
  }

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  }
} 