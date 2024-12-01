import React from 'react';

// Button Component
export function Button({ 
  variant = 'primary',
  size = 'medium',
  children,
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant} btn-${size}`}
      {...props}
    >
      {children}
    </button>
  );
}

// Card Component
export function Card({
  title,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div className={`card ${className}`} {...props}>
      {title && <div className="card-header">{title}</div>}
      <div className="card-content">{children}</div>
    </div>
  );
}

// Input Component
export function Input({
  label,
  error,
  ...props
}: InputProps) {
  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <input {...props} className="input" />
      {error && <span className="error">{error}</span>}
    </div>
  );
}

// Loading Component
export function Loading({ size = 'medium' }: LoadingProps) {
  return (
    <div className={`loading loading-${size}`}>
      <div className="spinner"></div>
    </div>
  );
} 