import { describe, it, expect } from 'vitest';
import { formatDistance, formatDuration } from '../../utils/formatters';

describe('Formatters', () => {
  describe('formatDistance', () => {
    it('should format meters correctly', () => {
      expect(formatDistance(500)).toBe('500 m');
      expect(formatDistance(50)).toBe('50 m');
    });

    it('should format kilometers correctly', () => {
      expect(formatDistance(1500)).toBe('1.5 km');
      expect(formatDistance(10000)).toBe('10.0 km');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes correctly', () => {
      expect(formatDuration(900)).toBe('15 min');
      expect(formatDuration(1800)).toBe('30 min');
    });

    it('should format hours correctly', () => {
      expect(formatDuration(3600)).toBe('1:00 hr');
      expect(formatDuration(5400)).toBe('1:30 hr');
    });

    it('should pad minutes with zeros in hour format', () => {
      expect(formatDuration(3660)).toBe('1:01 hr');
      expect(formatDuration(7200)).toBe('2:00 hr');
    });
  });
}); 