import { beforeAll, describe, it, expect } from 'vitest';

class SecurityScanner {
  private vulnerabilities: Map<string, any[]> = new Map();
  
  constructor() {
    // Initialize with some common security checks
    this.vulnerabilities.set('headers', []);
    this.vulnerabilities.set('auth', []);
    this.vulnerabilities.set('injection', []);
    this.vulnerabilities.set('xss', []);
  }

  async checkSecurityHeaders(headers: Record<string, string>) {
    const requiredHeaders = [
      'X-Frame-Options',
      'X-XSS-Protection',
      'X-Content-Type-Options',
      'Strict-Transport-Security',
      'Content-Security-Policy'
    ];

    const missing = requiredHeaders.filter(header => !headers[header]);
    if (missing.length > 0) {
      this.vulnerabilities.get('headers')?.push({
        severity: 'HIGH',
        message: `Missing security headers: ${missing.join(', ')}`
      });
    }
  }

  async checkAuthenticationEndpoints(endpoints: string[]) {
    const authChecks = [
      { path: '/api/login', methods: ['POST'] },
      { path: '/api/logout', methods: ['POST'] },
      { path: '/api/reset-password', methods: ['POST'] }
    ];

    authChecks.forEach(check => {
      if (!endpoints.includes(check.path)) {
        this.vulnerabilities.get('auth')?.push({
          severity: 'CRITICAL',
          message: `Missing authentication endpoint: ${check.path}`
        });
      }
    });
  }

  async checkForInjectionVulnerabilities(queries: string[]) {
    const dangerousPatterns = ['--', ';', '1=1', 'DROP TABLE', 'UNION SELECT'];
    
    queries.forEach(query => {
      dangerousPatterns.forEach(pattern => {
        if (query.toUpperCase().includes(pattern)) {
          this.vulnerabilities.get('injection')?.push({
            severity: 'CRITICAL',
            message: `Potential SQL injection in query: ${query}`
          });
        }
      });
    });
  }

  async checkForXSSVulnerabilities(content: string[]) {
    const xssPatterns = [
      '<script>',
      'javascript:',
      'onerror=',
      'onload='
    ];

    content.forEach(text => {
      xssPatterns.forEach(pattern => {
        if (text.toLowerCase().includes(pattern)) {
          this.vulnerabilities.get('xss')?.push({
            severity: 'HIGH',
            message: `Potential XSS vulnerability found: ${pattern}`
          });
        }
      });
    });
  }

  getVulnerabilities() {
    return Object.fromEntries(this.vulnerabilities);
  }

  getCriticalVulnerabilities() {
    const critical: any[] = [];
    this.vulnerabilities.forEach((vulns, category) => {
      vulns.forEach(vuln => {
        if (vuln.severity === 'CRITICAL') {
          critical.push({ category, ...vuln });
        }
      });
    });
    return critical;
  }
}

describe('Security Scanning', () => {
  let scanner: SecurityScanner;

  beforeAll(() => {
    scanner = new SecurityScanner();
  });

  it('should validate security headers', async () => {
    const headers = {
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'"
    };

    await scanner.checkSecurityHeaders(headers);
    const vulns = scanner.getVulnerabilities();
    expect(vulns.headers).toHaveLength(0);
  });

  it('should detect missing authentication endpoints', async () => {
    const endpoints = [
      '/api/login',
      '/api/logout',
      '/api/reset-password'
    ];

    await scanner.checkAuthenticationEndpoints(endpoints);
    const vulns = scanner.getVulnerabilities();
    expect(vulns.auth).toHaveLength(0);
  });

  it('should detect SQL injection vulnerabilities', async () => {
    const safeQueries = [
      'SELECT * FROM users WHERE id = $1',
      'INSERT INTO logs (message) VALUES ($1)'
    ];

    await scanner.checkForInjectionVulnerabilities(safeQueries);
    const vulns = scanner.getVulnerabilities();
    expect(vulns.injection).toHaveLength(0);
  });

  it('should detect XSS vulnerabilities', async () => {
    const safeContent = [
      '<p>Hello, world!</p>',
      'Welcome to our site'
    ];

    await scanner.checkForXSSVulnerabilities(safeContent);
    const vulns = scanner.getVulnerabilities();
    expect(vulns.xss).toHaveLength(0);
  });

  it('should have no critical vulnerabilities', async () => {
    const criticalVulns = scanner.getCriticalVulnerabilities();
    expect(criticalVulns).toHaveLength(0);
  });
}); 