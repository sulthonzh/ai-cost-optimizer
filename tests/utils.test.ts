import { describe, it, expect } from 'vitest';
import * as utils from '../src/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('should format zero correctly', () => {
      expect(utils.formatCurrency(0)).toBe('$0.00');
    });

    it('should format small numbers correctly', () => {
      expect(utils.formatCurrency(0.001)).toBe('$0.001');
      expect(utils.formatCurrency(0.0001)).toBe('$0.0001');
      expect(utils.formatCurrency(0.000001)).toBe('$0.000001');
    });

    it('should format regular numbers correctly', () => {
      expect(utils.formatCurrency(1.5)).toBe('$1.5');
      expect(utils.formatCurrency(123.456)).toBe('$123.456');
    });

    it('should format thousands correctly', () => {
      expect(utils.formatCurrency(1500)).toBe('$1.5K');
      expect(utils.formatCurrency(123456)).toBe('$123.46K');
    });

    it('should format millions correctly', () => {
      expect(utils.formatCurrency(1500000)).toBe('$1.5M');
      expect(utils.formatCurrency(123456789)).toBe('$123.46M');
    });

    it('should handle negative numbers', () => {
      expect(utils.formatCurrency(-1.5)).toBe('$-1.5');
      expect(utils.formatCurrency(-1500)).toBe('$-1.5K');
    });

    it('should use custom currency', () => {
      expect(utils.formatCurrency(1000, 'EUR')).toBe('€1K');
    });
  });

  describe('formatTokens', () => {
    it('should format zero correctly', () => {
      expect(utils.formatTokens(0)).toBe('0');
    });

    it('should format small numbers correctly', () => {
      expect(utils.formatTokens(123)).toBe('123');
      expect(utils.formatTokens(1)).toBe('1');
    });

    it('should format thousands correctly', () => {
      expect(utils.formatTokens(1500)).toBe('1.5K');
      expect(utils.formatTokens(123456)).toBe('123.46K');
    });

    it('should format millions correctly', () => {
      expect(utils.formatTokens(1500000)).toBe('1.5M');
      expect(utils.formatTokens(123456789)).toBe('123.46M');
    });

    it('should handle negative numbers', () => {
      expect(utils.formatTokens(-1500)).toBe('-1.5K');
    });

    it('should format large numbers with M suffix', () => {
      // 1234567 is >= 1M so it uses the M suffix
      expect(utils.formatTokens(1234567)).toBe('1.23M');
      // Numbers below 1K use locale string with commas
      expect(utils.formatTokens(999)).toBe('999');
    });
  });

  describe('formatTable', () => {
    it('should format table with headers and rows', () => {
      const headers = ['Name', 'Age', 'City'];
      const rows = [
        ['Alice', '25', 'New York'],
        ['Bob', '30', 'Los Angeles'],
        ['Charlie', '35', 'Chicago']
      ];

      const table = utils.formatTable(headers, rows);
      
      expect(table).toContain('Name');
      expect(table).toContain('Age');
      expect(table).toContain('City');
      expect(table).toContain('Alice');
      expect(table).toContain('Bob');
      expect(table).toContain('Charlie');
    });

    it('should handle empty rows', () => {
      const headers = ['Header1', 'Header2'];
      const rows = [];
      
      const table = utils.formatTable(headers, rows);
      expect(table).toContain('Header1');
      expect(table).toContain('Header2');
    });

    it('should handle different column widths', () => {
      const headers = ['Short', 'VeryLongHeaderName'];
      const rows = [
        ['Value1', 'Value2']
      ];

      const table = utils.formatTable(headers, rows);
      expect(table).toContain('Short');
      expect(table).toContain('VeryLongHeaderName');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(utils.formatPercentage(0.5)).toBe('50.0%');
      expect(utils.formatPercentage(0.1234)).toBe('12.3%');
      expect(utils.formatPercentage(0.9999)).toBe('100.0%');
      expect(utils.formatPercentage(0)).toBe('0.0%');
      expect(utils.formatPercentage(1)).toBe('100.0%');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(utils.formatBytes(0)).toBe('0 B');
      expect(utils.formatBytes(1024)).toBe('1 KB');
      expect(utils.formatBytes(1048576)).toBe('1 MB');
      expect(utils.formatBytes(1073741824)).toBe('1 GB');
    });

    it('should handle fractional bytes', () => {
      expect(utils.formatBytes(1536)).toBe('1.5 KB');
      expect(utils.formatBytes(1572864)).toBe('1.5 MB');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds correctly', () => {
      expect(utils.formatDuration(1000)).toBe('1s');
      expect(utils.formatDuration(60000)).toBe('1m');
      expect(utils.formatDuration(3600000)).toBe('1h');
      expect(utils.formatDuration(86400000)).toBe('1d');
    });

    it('should format complex durations', () => {
      expect(utils.formatDuration(90000)).toBe('1m 30s');
      expect(utils.formatDuration(3661000)).toBe('1h 1m');
      expect(utils.formatDuration(90061000)).toBe('1d 1h');
    });

    it('should handle zero duration', () => {
      expect(utils.formatDuration(0)).toBe('0s');
    });
  });

  describe('generateId', () => {
    it('should generate valid IDs', () => {
      const id1 = utils.generateId();
      const id2 = utils.generateId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).toHaveLength(9);
      expect(id2).toHaveLength(9);
      expect(id1).not.toBe(id2);
    });
  });

  describe('validation functions', () => {
    describe('isValidEmail', () => {
      it('should validate emails correctly', () => {
        expect(utils.isValidEmail('test@example.com')).toBe(true);
        expect(utils.isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(utils.isValidEmail('test123@test.io')).toBe(true);
        
        expect(utils.isValidEmail('invalid-email')).toBe(false);
        expect(utils.isValidEmail('test@')).toBe(false);
        expect(utils.isValidEmail('@example.com')).toBe(false);
        expect(utils.isValidEmail('test.test')).toBe(false);
        expect(utils.isValidEmail('')).toBe(false);
      });
    });

    describe('isValidUrl', () => {
      it('should validate URLs correctly', () => {
        expect(utils.isValidUrl('https://example.com')).toBe(true);
        expect(utils.isValidUrl('http://test.org/path')).toBe(true);
        expect(utils.isValidUrl('https://sub.domain.co.uk:8080/path?query=value')).toBe(true);
        
        expect(utils.isValidUrl('not-a-url')).toBe(false);
        expect(utils.isValidUrl('ftp://example.com')).toBe(false);
        expect(utils.isValidUrl('')).toBe(false);
        expect(utils.isValidUrl('https://')).toBe(false);
      });
    });
  });

  describe('utility functions', () => {
    describe('roundToDecimal', () => {
      it('should round to specified decimal places', () => {
        expect(utils.roundToDecimal(1.23456, 2)).toBe(1.23);
        expect(utils.roundToDecimal(1.235, 2)).toBe(1.24);
        expect(utils.roundToDecimal(1.2, 0)).toBe(1);
        expect(utils.roundToDecimal(1.8, 0)).toBe(2);
      });
    });

    describe('formatNumber', () => {
      it('should format numbers with locale', () => {
        expect(utils.formatNumber(1000)).toBe('1,000');
        expect(utils.formatNumber(1234567.89)).toBe('1,234,568');
        expect(utils.formatNumber(1234.5)).toBe('1,235');
      });
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', () => {
      let callCount = 0;
      const debouncedFn = utils.debounce(() => {
        callCount++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      expect(callCount).toBe(0);

      // Wait for debounce timeout
      setTimeout(() => {
        expect(callCount).toBe(1);
      }, 150);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', () => {
      let callCount = 0;
      const throttledFn = utils.throttle(() => {
        callCount++;
      }, 100);

      throttledFn(); // Should call
      throttledFn(); // Should be throttled
      throttledFn(); // Should be throttled

      expect(callCount).toBe(1);

      // Wait for throttle timeout
      setTimeout(() => {
        throttledFn(); // Should call again
        expect(callCount).toBe(2);
      }, 150);
    });
  });

  describe('deepClone', () => {
    it('should clone primitive values', () => {
      expect(utils.deepClone(42)).toBe(42);
      expect(utils.deepClone('string')).toBe('string');
      expect(utils.deepClone(true)).toBe(true);
      expect(utils.deepClone(null)).toBe(null);
      expect(utils.deepClone(undefined)).toBe(undefined);
    });

    it('should clone arrays', () => {
      const original = [1, 2, { a: 3 }, [4, 5]];
      const cloned = utils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned[2]).not.toBe(original[2]);
      expect(cloned[3]).not.toBe(original[3]);
    });

    it('should clone objects', () => {
      const original = { a: 1, b: { c: 2, d: [3, 4] } };
      const cloned = utils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    it('should clone dates', () => {
      const original = new Date('2023-01-01T00:00:00.000Z');
      const cloned = utils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned instanceof Date).toBe(true);
    });
  });
});