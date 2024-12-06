import { signIn, signOut, getSession } from 'next-auth/react';
import { sendVerificationEmail, sendPasswordResetEmail } from './EmailService';

export interface AuthenticationResult {
  success: boolean;
  user?: any;
  error?: string;
  verificationRequired?: boolean;
}

export interface SignUpData {
  email: string;
  password?: string;
  name?: string;
  provider?: 'google' | 'apple' | 'email';
}

export interface SignInData {
  email: string;
  password?: string;
  provider?: 'google' | 'apple' | 'email';
}

export class AuthenticationService {
  async signUp(data: SignUpData): Promise<AuthenticationResult> {
    try {
      if (data.provider === 'email' && (!data.password || !data.email)) {
        throw new Error('Email and password are required for email signup');
      }

      let result;
      switch (data.provider) {
        case 'google':
          result = await signIn('google', { redirect: false });
          break;
        case 'apple':
          result = await signIn('apple', { redirect: false });
          break;
        case 'email':
          // Create user with email/password
          result = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
              name: data.name
            })
          }).then(res => res.json());

          // Send verification email
          if (result.success) {
            await sendVerificationEmail(data.email);
            return {
              success: true,
              verificationRequired: true
            };
          }
          break;
        default:
          throw new Error('Invalid authentication provider');
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      return {
        success: true,
        user: result?.user
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign up'
      };
    }
  }

  async signIn(data: SignInData): Promise<AuthenticationResult> {
    try {
      if (data.provider === 'email' && (!data.password || !data.email)) {
        throw new Error('Email and password are required for email signin');
      }

      let result;
      switch (data.provider) {
        case 'google':
          result = await signIn('google', { redirect: false });
          break;
        case 'apple':
          result = await signIn('apple', { redirect: false });
          break;
        case 'email':
          result = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password
          });
          break;
        default:
          throw new Error('Invalid authentication provider');
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      return {
        success: true,
        user: result?.user
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sign in'
      };
    }
  }

  async signOut(): Promise<void> {
    await signOut({ redirect: false });
  }

  async resetPassword(email: string): Promise<AuthenticationResult> {
    try {
      await sendPasswordResetEmail(email);
      return {
        success: true
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password'
      };
    }
  }

  async verifyEmail(token: string): Promise<AuthenticationResult> {
    try {
      const result = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }).then(res => res.json());

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify email'
      };
    }
  }

  async getCurrentSession() {
    return await getSession();
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
    avatar?: string;
  }): Promise<AuthenticationResult> {
    try {
      const result = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json());

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        user: result.user
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  }
} 