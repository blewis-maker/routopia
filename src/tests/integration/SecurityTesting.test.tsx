import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestContextProvider } from '../utils/TestContextProvider';
import { MockAPIClient } from '../services/connectivity/apiEndpoints.test';
import { MockAuthService } from '../services/connectivity/authFlow.test';
import { SecurityMonitor } from '@/services/monitoring/SecurityMonitor';
import { AppRouter } from '@/components/routing/AppRouter';
import { XSSValidator } from '@/services/security/XSSValidator';
import { CSRFProtection } from '@/services/security/CSRFProtection';

describe('Security Testing', () => {
  let apiClient: MockAPIClient;
  let authService: MockAuthService;
  let securityMonitor: SecurityMonitor;
  let xssValidator: XSSValidator;
  let csrfProtection: CSRFProtection;

  beforeEach(() => {
    apiClient = new MockAPIClient();
    authService = new MockAuthService();
    securityMonitor = new SecurityMonitor();
    xssValidator = new XSSValidator();
    csrfProtection = new CSRFProtection();
    vi.clearAllMocks();
  });

  describe('Authentication Security', () => {
    test('should prevent unauthorized access to protected routes', async () => {
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Attempt to access protected route
      window.history.pushState({}, '', '/dashboard');

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
        expect(screen.getByText('Please log in to continue')).toBeInTheDocument();
      });
    });

    test('should handle token expiration securely', async () => {
      const expiredToken = 'expired.jwt.token';
      vi.spyOn(authService, 'validateToken').mockResolvedValue(false);

      render(
        <TestContextProvider initialToken={expiredToken}>
          <AppRouter />
        </TestContextProvider>
      );

      await waitFor(() => {
        expect(window.location.pathname).toBe('/login');
        expect(localStorage.getItem('auth_token')).toBeNull();
      });
    });
  });

  describe('Input Validation', () => {
    test('should prevent XSS attacks', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const sanitizedInput = xssValidator.sanitize(maliciousInput);

      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      const input = screen.getByLabelText('Route Name');
      fireEvent.change(input, { target: { value: maliciousInput } });

      expect(input.value).toBe(sanitizedInput);
      expect(input.value).not.toContain('<script>');
    });

    test('should validate file uploads securely', async () => {
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const maliciousFile = new File(['<?php ?>'], 'malicious.php', { type: 'text/php' });

      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      const upload = screen.getByLabelText('Upload GPX');
      
      // Valid file
      fireEvent.change(upload, { target: { files: [file] } });
      expect(await securityMonitor.validateFileUpload(file)).toBe(true);

      // Malicious file
      fireEvent.change(upload, { target: { files: [maliciousFile] } });
      expect(await securityMonitor.validateFileUpload(maliciousFile)).toBe(false);
    });
  });

  describe('Data Protection', () => {
    test('should enforce CSRF protection', async () => {
      const csrfToken = csrfProtection.generateToken();
      
      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Attempt request without CSRF token
      const response1 = await apiClient.post('/api/routes', {});
      expect(response1.status).toBe(403);

      // Request with valid CSRF token
      const response2 = await apiClient.post('/api/routes', {}, {
        headers: { 'X-CSRF-Token': csrfToken }
      });
      expect(response2.status).toBe(201);
    });

    test('should handle sensitive data securely', async () => {
      const sensitiveData = {
        email: 'user@example.com',
        location: [51.5074, -0.1278]
      };

      render(
        <TestContextProvider>
          <AppRouter />
        </TestContextProvider>
      );

      // Verify data masking in logs
      const loggedData = securityMonitor.maskSensitiveData(sensitiveData);
      expect(loggedData.email).toBe('u***@example.com');
      expect(loggedData.location).toEqual(['**.**', '**.**']);

      // Verify secure storage
      localStorage.setItem('user_data', JSON.stringify(sensitiveData));
      expect(securityMonitor.detectSensitiveDataExposure()).toBe(false);
    });
  });

  describe('API Security', () => {
    test('should handle rate limiting', async () => {
      const requests = Array(10).fill(null).map(() => 
        apiClient.get('/api/routes')
      );

      const responses = await Promise.all(requests);
      const tooManyRequests = responses.filter(r => r.status === 429);
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });

    test('should validate API responses', async () => {
      const response = await apiClient.get('/api/routes');
      
      // Check response structure
      expect(response.headers['content-type']).toBe('application/json');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      
      // Validate response data
      expect(securityMonitor.validateResponseStructure(response.data)).toBe(true);
    });
  });
}); 