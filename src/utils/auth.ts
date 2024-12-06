import { randomBytes, createHash } from 'crypto';

export async function generateToken(length: number = 32): Promise<string> {
  return new Promise((resolve, reject) => {
    randomBytes(length, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString('hex'));
      }
    });
  });
}

export function hashToken(token: string): string {
  return createHash('sha256')
    .update(`${token}${process.env.AUTH_SECRET}`)
    .digest('hex');
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isTokenExpired(timestamp: Date, expirationHours: number = 24): boolean {
  const now = new Date();
  const expirationTime = new Date(timestamp);
  expirationTime.setHours(expirationTime.getHours() + expirationHours);
  return now > expirationTime;
}

export function generateSessionToken(): string {
  return `${randomBytes(32).toString('hex')}${Date.now()}`;
}

export function sanitizeUser(user: any): any {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

export function generateApiKey(): string {
  return `rtp_${randomBytes(32).toString('hex')}`;
}

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hashedPassword);
} 