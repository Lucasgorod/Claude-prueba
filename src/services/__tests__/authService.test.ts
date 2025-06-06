import { describe, it, expect } from 'vitest';
import { authService } from '../authService';

describe('AuthService validation', () => {
  it('validates email addresses', () => {
    expect(authService.isValidEmail('test@example.com')).toBe(true);
    expect(authService.isValidEmail('invalid-email')).toBe(false);
  });

  it('validates password strength', () => {
    expect(authService.isValidPassword('Aa1bbb')).toEqual({
      isValid: true,
      message: 'Password is valid',
    });
    expect(authService.isValidPassword('short')).toEqual({
      isValid: false,
      message: 'Password must be at least 6 characters long',
    });
  });
});
