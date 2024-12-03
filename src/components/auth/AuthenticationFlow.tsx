import React, { useState } from 'react';

interface FormErrors {
  email?: string;
  password?: string;
}

export const AuthenticationFlow: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Always validate on submit
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate authentication
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (formData.email === 'test@example.com' && formData.password === 'password123') {
            resolve();
          } else {
            reject(new Error('Invalid credentials'));
          }
        }, 500);
      });
      
      setIsLoggedIn(true);
    } catch (error) {
      setErrors({
        password: 'Authentication failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn) {
    return <div>Dashboard</div>;
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            aria-label="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.email && (
            <div role="alert" className="error">
              {errors.email}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            aria-label="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.password && (
            <div role="alert" className="error">
              {errors.password}
            </div>
          )}
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}; 