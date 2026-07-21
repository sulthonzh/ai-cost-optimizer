/**
 * Coverage Gap Tests Round 2 — tracker CRUD, analyzer recommendations, utils branches
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CostTrackerManager } from '../src/tracker';
import { CostAnalyzer } from '../src/analyzer';
import * as utils from '../src/utils';

// ============================================================
// tracker.ts — CRUD operations (largely uncovered)
// ============================================================

describe('Coverage Gap R2 — tracker.ts CRUD', () => {
  let tracker: CostTrackerManager;

  beforeEach(() => {
    tracker = new CostTrackerManager();
  });

  describe('createTracker + getTracker', () => {
    it('should create and retrieve a tracker', () => {
      const id = tracker.createTracker({
        name: 'GPT-4',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate'],
      });
      expect(typeof id).toBe('string');
      expect(id).toHaveLength(9);

      const retrieved = tracker.getTracker(id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.name).toBe('GPT-4');
      expect(retrieved!.model).toBe('gpt-4');
      expect(retrieved!.id).toBe(id);
      expect(retrieved!.createdAt).toBeGreaterThan(0);
      expect(retrieved!.updatedAt).toBe(retrieved!.createdAt);
    });

    it('should return undefined for non-existent tracker', () => {
      expect(tracker.getTracker('nonexistent')).toBeUndefined();
    });
  });

  describe('getAllTrackers', () => {
    it('should return empty array initially', () => {
      expect(tracker.getAllTrackers()).toEqual([]);
    });

    it('should return all created trackers', () => {
      const id1 = tracker.createTracker({
        name: 'GPT-4',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate'],
      });
      const id2 = tracker.createTracker({
        name: 'Claude',
        model: 'claude-3',
        costPerInputToken: 0.00001,
        costPerOutputToken: 0.00003,
        currency: 'USD',
        trackedOperations: ['analyze'],
      });

      const all = tracker.getAllTrackers();
      expect(all).toHaveLength(2);
      expect(all.map(t => t.id)).toContain(id1);
      expect(all.map(t => t.id)).toContain(id2);
    });
  });

  describe('updateTracker', () => {
    it('should update an existing tracker', () => {
      const id = tracker.createTracker({
        name: 'GPT-4',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      const result = tracker.updateTracker(id, { name: 'GPT-4 Turbo', costPerInputToken: 0.00001 });
      expect(result).toBe(true);

      const updated = tracker.getTracker(id);
      expect(updated!.name).toBe('GPT-4 Turbo');
      expect(updated!.costPerInputToken).toBe(0.00001);
      expect(updated!.updatedAt).toBeGreaterThanOrEqual(updated!.createdAt);
    });

    it('should return false for non-existent tracker', () => {
      expect(tracker.updateTracker('fake-id', { name: 'New' })).toBe(false);
    });
  });

  describe('deleteTracker', () => {
    it('should delete an existing tracker', () => {
      const id = tracker.createTracker({
        name: 'GPT-4',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      expect(tracker.deleteTracker(id)).toBe(true);
      expect(tracker.getTracker(id)).toBeUndefined();
    });

    it('should return false for non-existent tracker', () => {
      expect(tracker.deleteTracker('fake-id')).toBe(false);
    });
  });

  describe('getUsage with filters', () => {
    beforeEach(() => {
      tracker.trackUsage({ model: 'gpt-4', inputTokens: 100, outputTokens: 50, totalTokens: 150, operation: 'generate', cost: 0.01 });
      tracker.trackUsage({ model: 'claude-3', inputTokens: 200, outputTokens: 100, totalTokens: 300, operation: 'analyze', cost: 0.02 });
      tracker.trackUsage({ model: 'gpt-4', inputTokens: 50, outputTokens: 25, totalTokens: 75, operation: 'generate', cost: 0.005 });
    });

    it('should filter by model', () => {
      const gpt4 = tracker.getUsage('gpt-4');
      expect(gpt4).toHaveLength(2);
      expect(gpt4.every(u => u.model === 'gpt-4')).toBe(true);
    });

    it('should filter by operation', () => {
      const analyze = tracker.getUsage(undefined, 'analyze');
      expect(analyze).toHaveLength(1);
      expect(analyze[0].operation).toBe('analyze');
    });

    it('should filter by since', () => {
      const now = Date.now();
      const future = now + 100000;
      const result = tracker.getUsage(undefined, undefined, future);
      expect(result).toHaveLength(0);
    });

    it('should filter by model + operation', () => {
      const result = tracker.getUsage('gpt-4', 'generate');
      expect(result).toHaveLength(2);
    });

    it('should return all with no filters', () => {
      expect(tracker.getUsage()).toHaveLength(3);
    });
  });

  describe('getTotalUsage with filters', () => {
    beforeEach(() => {
      tracker.trackUsage({ model: 'gpt-4', inputTokens: 100, outputTokens: 50, totalTokens: 150, operation: 'generate', cost: 0.01 });
      tracker.trackUsage({ model: 'claude-3', inputTokens: 200, outputTokens: 100, totalTokens: 300, operation: 'analyze', cost: 0.02 });
    });

    it('should aggregate totals with model filter', () => {
      const total = tracker.getTotalUsage('gpt-4');
      expect(total.inputTokens).toBe(100);
      expect(total.outputTokens).toBe(50);
      expect(total.totalTokens).toBe(150);
      expect(total.cost).toBeCloseTo(0.01, 5);
    });

    it('should aggregate totals with operation filter', () => {
      const total = tracker.getTotalUsage(undefined, 'analyze');
      expect(total.totalTokens).toBe(300);
      expect(total.cost).toBeCloseTo(0.02, 5);
    });

    it('should aggregate totals with since filter', () => {
      const total = tracker.getTotalUsage(undefined, undefined, Date.now() + 100000);
      expect(total.totalTokens).toBe(0);
      expect(total.cost).toBe(0);
    });
  });
});

// ============================================================
// analyzer.ts — recommendation generation (uncovered lines)
// ============================================================

describe('Coverage Gap R2 — analyzer.ts recommendations', () => {
  let tracker: CostTrackerManager;
  let analyzer: CostAnalyzer;

  beforeEach(() => {
    tracker = new CostTrackerManager();
    analyzer = new CostAnalyzer(tracker);
  });

  describe('generateRecommendations — model_rightsize', () => {
    it('should generate model rightsize recommendation for expensive model', () => {
      tracker.createTracker({
        name: 'Expensive',
        model: 'gpt-4',
        costPerInputToken: 0.001,
        costPerOutputToken: 0.002,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.2, // 0.2/150 = 0.00133 > 0.001 → critical
      });

      const analysis = analyzer.analyzeCost();
      const rec = analysis.recommendations.find(r => r.type === 'model_rightsize');
      expect(rec).toBeDefined();
      expect(rec!.priority).toBe('high');
      expect(rec!.title).toContain('cheaper model');
      expect(rec!.estimatedSavings).toBeGreaterThan(0);
      expect(rec!.confidence).toBe(0.8);
    });
  });

  describe('generateRecommendations — prompt_optimize', () => {
    it('should generate prompt optimization recommendation', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 400, // ratio = 4 > 3 → high
        operation: 'summarize',
        cost: 0.05,
      });

      const analysis = analyzer.analyzeCost();
      const rec = analysis.recommendations.find(r => r.type === 'prompt_optimize');
      expect(rec).toBeDefined();
      expect(rec!.priority).toBe('medium');
      expect(rec!.title).toContain('Optimize prompts');
      expect(rec!.estimatedSavings).toBeGreaterThan(0);
      expect(rec!.confidence).toBe(0.6);
    });
  });

  describe('generateRecommendations — batch_operations', () => {
    it('should generate batch operations recommendation for high token usage', () => {
      // Need > 10000 average tokens for critical severity
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 8000,
        outputTokens: 4000, // total 12000 > 10000 → critical
        operation: 'big-batch',
        cost: 1.5,
      });

      const analysis = analyzer.analyzeCost();
      const rec = analysis.recommendations.find(r => r.type === 'batch_operations');
      expect(rec).toBeDefined();
      expect(rec!.priority).toBe('medium');
      expect(rec!.title).toContain('Batch');
      expect(rec!.estimatedSavings).toBeGreaterThan(0);
      expect(rec!.confidence).toBe(0.7);
    });
  });

  describe('generateRecommendations — sorting by estimatedSavings * confidence', () => {
    it('should sort recommendations by savings * confidence descending', () => {
      // Add two types of inefficiencies with different savings
      tracker.createTracker({
        name: 'Expensive',
        model: 'gpt-4',
        costPerInputToken: 0.001,
        costPerOutputToken: 0.002,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      // Expensive model (high savings, confidence 0.8)
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.5,
      });

      // Inefficient prompt (lower savings, confidence 0.6)
      tracker.trackUsage({
        model: 'gpt-3.5',
        inputTokens: 100,
        outputTokens: 400,
        operation: 'summarize',
        cost: 0.01,
      });

      const analysis = analyzer.analyzeCost();
      expect(analysis.recommendations.length).toBeGreaterThanOrEqual(2);
      // First recommendation should have higher savings * confidence
      const firstScore = analysis.recommendations[0].estimatedSavings * analysis.recommendations[0].confidence;
      const secondScore = analysis.recommendations[1].estimatedSavings * analysis.recommendations[1].confidence;
      expect(firstScore).toBeGreaterThanOrEqual(secondScore);
    });
  });

  describe('analyzeCost — empty usage', () => {
    it('should return zero totals with no usage', () => {
      const analysis = analyzer.analyzeCost();
      expect(analysis.totalCost).toBe(0);
      expect(analysis.totalTokens).toBe(0);
      expect(analysis.averageCostPerToken).toBe(0);
      expect(analysis.inefficiencies).toEqual([]);
      expect(analysis.recommendations).toEqual([]);
    });
  });

  describe('findHighUsageOperations — high severity (>5000 avg tokens)', () => {
    it('should detect high severity', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 4000,
        outputTokens: 2000, // total 6000 > 5000 → high
        operation: 'large-op',
        cost: 0.5,
      });

      const analysis = analyzer.analyzeCost();
      const highUsage = analysis.inefficiencies.find(i => i.type === 'high_token_usage');
      expect(highUsage).toBeDefined();
      expect(highUsage!.severity).toBe('high');
    });
  });

  describe('findHighUsageOperations — critical severity (>10000 avg tokens)', () => {
    it('should detect critical severity', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 8000,
        outputTokens: 5000, // total 13000 > 10000 → critical
        operation: 'huge-op',
        cost: 1.0,
      });

      const analysis = analyzer.analyzeCost();
      const highUsage = analysis.inefficiencies.find(i => i.type === 'high_token_usage');
      expect(highUsage).toBeDefined();
      expect(highUsage!.severity).toBe('critical');
    });
  });

  describe('findInefficientPrompts — high severity (ratio > 3)', () => {
    it('should detect high severity prompt inefficiency', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 500, // ratio = 5 > 3 → high
        operation: 'verbose',
        cost: 0.02,
      });

      const analysis = analyzer.analyzeCost();
      const promptIneff = analysis.inefficiencies.find(i => i.type === 'inefficient_prompt');
      expect(promptIneff).toBeDefined();
      expect(promptIneff!.severity).toBe('high');
    });
  });

  describe('recommendations — max 5 limit', () => {
    it('should cap recommendations at 5', () => {
      // Create many different inefficiencies
      for (let i = 0; i < 10; i++) {
        tracker.trackUsage({
          model: `model-${i}`,
          inputTokens: 100,
          outputTokens: 500, // high ratio → inefficient prompt
          operation: `op-${i}`,
          cost: 0.5,
        });
      }

      const analysis = analyzer.analyzeCost();
      expect(analysis.recommendations.length).toBeLessThanOrEqual(5);
    });
  });
});

// ============================================================
// utils.ts — additional branch coverage
// ============================================================

describe('Coverage Gap R2 — utils.ts branches', () => {
  describe('formatCurrency — branch coverage', () => {
    it('should format exactly 0 as $0.00', () => {
      expect(utils.formatCurrency(0)).toBe('$0.00');
    });

    it('should format exactly 1 (boundary for >= 1)', () => {
      expect(utils.formatCurrency(1)).toBe('$1');
    });

    it('should format 0.99 (sub-dollar branch)', () => {
      expect(utils.formatCurrency(0.999)).toBe('$0.999');
    });

    it('should format exactly 1000 (thousands boundary)', () => {
      expect(utils.formatCurrency(1000)).toBe('$1K');
    });

    it('should format exactly 1000000 (millions boundary)', () => {
      expect(utils.formatCurrency(1000000)).toBe('$1M');
    });

    it('should format negative small number', () => {
      expect(utils.formatCurrency(-0.5)).toBe('$-0.5');
    });

    it('should format negative million', () => {
      expect(utils.formatCurrency(-2000000)).toBe('$-2M');
    });

    it('should format EUR with negative', () => {
      expect(utils.formatCurrency(-1000, 'EUR')).toBe('€-1K');
    });

    it('should format EUR sub-dollar', () => {
      expect(utils.formatCurrency(0.5, 'EUR')).toBe('€0.5');
    });

    it('should strip trailing zeros from thousands', () => {
      expect(utils.formatCurrency(1000)).toBe('$1K'); // not $1.00K
      expect(utils.formatCurrency(1100)).toBe('$1.1K'); // not $1.10K
    });
  });

  describe('formatTokens — branch coverage', () => {
    it('should format exactly 0', () => {
      expect(utils.formatTokens(0)).toBe('0');
    });

    it('should format small number (< 1000) with toLocaleString', () => {
      // The else branch uses toLocaleString (not stripTrailingZeros)
      expect(utils.formatTokens(999)).toBe('999');
    });

    it('should format negative million', () => {
      expect(utils.formatTokens(-2000000)).toBe('-2M');
    });

    it('should format negative small number', () => {
      // abs(99) < 1000, so it goes to else: tokens.toLocaleString()
      // -99 .toLocaleString() → "-99"
      const result = utils.formatTokens(-99);
      expect(result).toBe('-99');
    });

    it('should use toLocaleString for sub-1000 numbers', () => {
      // This tests the else branch which calls toLocaleString
      expect(utils.formatTokens(500)).toBe('500');
    });
  });

  describe('formatBytes — additional branches', () => {
    it('should format 0 bytes', () => {
      expect(utils.formatBytes(0)).toBe('0 B');
    });

    it('should format KB', () => {
      expect(utils.formatBytes(1024)).toBe('1 KB');
    });

    it('should format MB', () => {
      expect(utils.formatBytes(1048576)).toBe('1 MB');
    });

    it('should format GB', () => {
      expect(utils.formatBytes(1073741824)).toBe('1 GB');
    });

    it('should handle 1 byte', () => {
      expect(utils.formatBytes(1)).toBe('1 B');
    });
  });

  describe('formatDuration — all branch combinations', () => {
    it('should format seconds only (< 60s)', () => {
      expect(utils.formatDuration(5000)).toBe('5s');
    });

    it('should format minutes only (exact)', () => {
      expect(utils.formatDuration(120000)).toBe('2m');
    });

    it('should format minutes with seconds', () => {
      expect(utils.formatDuration(150000)).toBe('2m 30s');
    });

    it('should format hours only (exact)', () => {
      expect(utils.formatDuration(7200000)).toBe('2h');
    });

    it('should format hours with minutes', () => {
      expect(utils.formatDuration(7800000)).toBe('2h 10m');
    });

    it('should format days only (exact)', () => {
      expect(utils.formatDuration(172800000)).toBe('2d');
    });

    it('should format days with hours', () => {
      expect(utils.formatDuration(93600000)).toBe('1d 2h');
    });

    it('should format zero', () => {
      expect(utils.formatDuration(0)).toBe('0s');
    });
  });

  describe('debounce — execution and clearing', () => {
    it('should execute debounced function after wait', async () => {
      const mockFn = vi.fn();
      const debounced = utils.debounce(mockFn, 50);

      debounced();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should reset timer on subsequent calls', async () => {
      const mockFn = vi.fn();
      const debounced = utils.debounce(mockFn, 50);

      debounced();
      await new Promise(resolve => setTimeout(resolve, 25));
      debounced(); // reset timer
      await new Promise(resolve => setTimeout(resolve, 25));
      expect(mockFn).not.toHaveBeenCalled();

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('throttle — leading edge + cooldown', () => {
    it('should call immediately on first call', () => {
      const mockFn = vi.fn();
      const throttled = utils.throttle(mockFn, 50);

      throttled();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should block during throttle window', async () => {
      const mockFn = vi.fn();
      const throttled = utils.throttle(mockFn, 50);

      throttled(); // calls
      throttled(); // blocked
      throttled(); // blocked
      expect(mockFn).toHaveBeenCalledTimes(1);

      await new Promise(resolve => setTimeout(resolve, 60));
      throttled(); // calls again after cooldown
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('deepClone — edge cases', () => {
    it('should handle nested objects deeply', () => {
      const original = { a: { b: { c: { d: 1 } } } };
      const cloned = utils.deepClone(original);
      expect(cloned).toEqual(original);
      expect(cloned.a.b.c).not.toBe(original.a.b.c);
    });

    it('should handle mixed nested structures', () => {
      const original = {
        arr: [1, { x: 2 }, [3, 4]],
        obj: { date: new Date('2023-01-01') },
        num: 42,
      };
      const cloned = utils.deepClone(original);
      expect(cloned).toEqual(original);
      expect(cloned.arr).not.toBe(original.arr);
      expect(cloned.arr[1]).not.toBe(original.arr[1]);
      expect(cloned.obj).not.toBe(original.obj);
      expect(cloned.obj.date).not.toBe(original.obj.date);
    });

    it('should handle empty object', () => {
      const cloned = utils.deepClone({});
      expect(cloned).toEqual({});
    });

    it('should handle empty array', () => {
      const cloned = utils.deepClone([]);
      expect(cloned).toEqual([]);
    });
  });

  describe('isValidUrl — protocol branches', () => {
    it('should accept http URLs', () => {
      expect(utils.isValidUrl('http://example.com')).toBe(true);
    });

    it('should accept https URLs', () => {
      expect(utils.isValidUrl('https://example.com')).toBe(true);
    });

    it('should reject ftp URLs', () => {
      expect(utils.isValidUrl('ftp://example.com')).toBe(false);
    });

    it('should reject malformed URLs', () => {
      expect(utils.isValidUrl('not-a-url')).toBe(false);
      expect(utils.isValidUrl('')).toBe(false);
    });
  });

  describe('isValidEmail — additional cases', () => {
    it('should accept various valid emails', () => {
      expect(utils.isValidEmail('a@b.co')).toBe(true);
      expect(utils.isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject various invalid emails', () => {
      expect(utils.isValidEmail('no-at-sign')).toBe(false);
      expect(utils.isValidEmail('no-tld@domain')).toBe(false);
      expect(utils.isValidEmail('')).toBe(false);
      expect(utils.isValidEmail('spaces in@email.com')).toBe(false);
    });
  });

  describe('roundToDecimal — edge cases', () => {
    it('should handle negative numbers', () => {
      expect(utils.roundToDecimal(-1.234, 2)).toBe(-1.23);
    });

    it('should handle zero decimal places', () => {
      expect(utils.roundToDecimal(3.7, 0)).toBe(4);
      expect(utils.roundToDecimal(3.2, 0)).toBe(3);
    });

    it('should handle already round numbers', () => {
      expect(utils.roundToDecimal(5, 2)).toBe(5);
    });
  });

  describe('formatNumber — edge cases', () => {
    it('should format zero', () => {
      expect(utils.formatNumber(0)).toBe('0');
    });

    it('should format negative numbers', () => {
      expect(utils.formatNumber(-1234)).toBe('-1,234');
    });

    it('should format large numbers', () => {
      expect(utils.formatNumber(1000000)).toBe('1,000,000');
    });
  });

  describe('formatTable — edge cases', () => {
    it('should handle single column', () => {
      const result = utils.formatTable(['Only'], [['Val1'], ['Val2']]);
      expect(result).toContain('Only');
      expect(result).toContain('Val1');
      expect(result).toContain('Val2');
    });

    it('should handle rows with missing cells', () => {
      const result = utils.formatTable(['A', 'B'], [['x']]);
      expect(result).toContain('A');
      expect(result).toContain('B');
      expect(result).toContain('x');
    });
  });
});
