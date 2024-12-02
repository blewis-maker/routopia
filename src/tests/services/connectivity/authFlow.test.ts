import { beforeAll, afterAll, describe, it, expect } from 'vitest';

interface MockUser {
  id: string;
  email: string;
  password: string;
}

class MockAuthService {
  private users: Map<string, MockUser> = new Map();
  private sessions: Map<string, string> = new Map(); // token -> userId

  async register(email: string, password: string): Promise<MockUser> {
    const id = Math.random().toString(36).substring(7);
    const user = { id, email, password };
    this.users.set(email, user);
    return user;
  }

  async login(email: string, password: string): Promise<string> {
    const user = this.users.get(email);
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }
    const token = Math.random().toString(36).substring(7);
    this.sessions.set(token, user.id);
    return token;
  }

  async validateToken(token: string): Promise<boolean> {
    return this.sessions.has(token);
  }

  async logout(token: string): Promise<void> {
    this.sessions.delete(token);
  }
}

describe('Authentication Flow', () => {
  let authService: MockAuthService;
  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  beforeAll(() => {
    authService = new MockAuthService();
  });

  it('should register new users', async () => {
    const user = await authService.register(testEmail, testPassword);
    expect(user.email).toBe(testEmail);
    expect(user.id).toBeDefined();
  });

  it('should authenticate valid users', async () => {
    const token = await authService.login(testEmail, testPassword);
    expect(token).toBeDefined();
    const isValid = await authService.validateToken(token);
    expect(isValid).toBe(true);
  });

  it('should reject invalid credentials', async () => {
    await expect(
      authService.login(testEmail, 'wrongpassword')
    ).rejects.toThrow('Invalid credentials');
  });

  it('should handle logout correctly', async () => {
    const token = await authService.login(testEmail, testPassword);
    await authService.logout(token);
    const isValid = await authService.validateToken(token);
    expect(isValid).toBe(false);
  });
}); 