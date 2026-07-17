import { describe, it, expect, beforeEach } from 'vitest';
import { CostAnalyzer } from '../src/analyzer';
import { CostTrackerManager } from '../src/tracker';
import * as utils from '../src/utils';

describe('Coverage Gap Tests — analyzer.ts', () => {
  let analyzer: CostAnalyzer;
  let tracker: CostTrackerManager;

  beforeEach(() => {
    tracker = new CostTrackerManager();
    analyzer = new CostAnalyzer(tracker);
  });

  describe('analyzeCost — cost fallback (|| 0) branches', () => {
    it('should handle usage entries with cost = undefined (falsy cost fallback)', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: undefined as unknown as number,
      });

      const analysis = analyzer.analyzeCost();
      // cost || 0 kicks in for costByModel, costByOperation, costByHour, totalCost
      expect(analysis.totalCost).toBe(0);
      expect(analysis.costByModel['gpt-4']).toBe(0);
      expect(analysis.costByOperation['generate']).toBe(0);
      // Should still have hour entries
      const hours = Object.keys(analysis.costByHour);
      expect(hours.length).toBeGreaterThan(0);
    });

    it('should handle usage entries with cost = 0', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0,
      });

      const analysis = analyzer.analyzeCost();
      expect(analysis.totalCost).toBe(0);
    });
  });

  describe('findExpensiveModels — no matching tracker', () => {
    it('should skip usage entries whose model has no tracker', () => {
      // Create a tracker for gpt-4 only
      tracker.createTracker({
        name: 'GPT-4',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      // Track usage for a model that has no tracker
      tracker.trackUsage({
        model: 'unknown-model',
        inputTokens: 1000,
        outputTokens: 500,
        operation: 'generate',
        cost: 0.5,
      });

      const analysis = analyzer.analyzeCost();
      // No expensive_model inefficiency because the model had no tracker
      const expensiveIneff = analysis.inefficiencies.find(i => i.type === 'expensive_model');
      expect(expensiveIneff).toBeUndefined();
    });
  });

  describe('findExpensiveModels — severity thresholds', () => {
    it('should detect critical severity (>0.001 per token)', () => {
      tracker.createTracker({
        name: 'Critical',
        model: 'crit-model',
        costPerInputToken: 0.001,
        costPerOutputToken: 0.002,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      tracker.trackUsage({
        model: 'crit-model',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.2, // 0.2 / 150 = 0.00133 > 0.001
      });

      const analysis = analyzer.analyzeCost();
      const expensiveIneff = analysis.inefficiencies.find(i => i.type === 'expensive_model');
      expect(expensiveIneff).toBeDefined();
      expect(expensiveIneff!.severity).toBe('critical');
    });

    it('should detect high severity (>0.0005 per token)', () => {
      tracker.createTracker({
        name: 'High',
        model: 'high-model',
        costPerInputToken: 0.0005,
        costPerOutputToken: 0.001,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      tracker.trackUsage({
        model: 'high-model',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.1, // 0.1 / 150 = 0.000667 > 0.0005
      });

      const analysis = analyzer.analyzeCost();
      const expensiveIneff = analysis.inefficiencies.find(i => i.type === 'expensive_model');
      expect(expensiveIneff).toBeDefined();
      expect(expensiveIneff!.severity).toBe('high');
    });

    it('should detect medium severity (>0.0001 per token)', () => {
      tracker.createTracker({
        name: 'Medium',
        model: 'med-model',
        costPerInputToken: 0.0001,
        costPerOutputToken: 0.0002,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      tracker.trackUsage({
        model: 'med-model',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.02, // 0.02 / 150 = 0.000133 > 0.0001
      });

      const analysis = analyzer.analyzeCost();
      const expensiveIneff = analysis.inefficiencies.find(i => i.type === 'expensive_model');
      expect(expensiveIneff).toBeDefined();
      expect(expensiveIneff!.severity).toBe('medium');
    });
  });

  describe('findExpensiveModels — cost fallback inside model stats', () => {
    it('should handle cost = undefined in expensive model detection', () => {
      tracker.createTracker({
        name: 'Test',
        model: 'test-model',
        costPerInputToken: 0.0001,
        costPerOutputToken: 0.0002,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      tracker.trackUsage({
        model: 'test-model',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: undefined as unknown as number,
      });

      const analysis = analyzer.analyzeCost();
      // Should not crash; totalCost should be 0 for this model
      const expensiveIneff = analysis.inefficiencies.find(i => i.type === 'expensive_model');
      // avg cost = 0 / 150 = 0, severity = low, filtered out
      expect(expensiveIneff).toBeUndefined();
    });
  });

  describe('findExpensiveModels — zero totalTokens guard', () => {
    it('should handle model with zero total tokens (averageCostPerToken = 0)', () => {
      tracker.createTracker({
        name: 'Zero',
        model: 'zero-model',
        costPerInputToken: 0.0001,
        costPerOutputToken: 0.0002,
        currency: 'USD',
        trackedOperations: ['generate'],
      });

      tracker.trackUsage({
        model: 'zero-model',
        inputTokens: 0,
        outputTokens: 0,
        operation: 'generate',
        cost: 0.5,
      });

      // Should not crash, averageCostPerToken should be 0 (severity = low, filtered out)
      const analysis = analyzer.analyzeCost();
      const expensiveIneff = analysis.inefficiencies.find(i => i.type === 'expensive_model');
      expect(expensiveIneff).toBeUndefined();
    });
  });

  describe('findInefficientPrompts — edge cases', () => {
    it('should detect medium severity for outputRatio between 2 and 3', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 250, // ratio = 2.5, medium
        operation: 'summarize',
        cost: 0.01,
      });

      const analysis = analyzer.analyzeCost();
      const promptIneff = analysis.inefficiencies.find(i => i.type === 'inefficient_prompt');
      expect(promptIneff).toBeDefined();
      expect(promptIneff!.severity).toBe('medium');
    });

    it('should handle cost = undefined in inefficient prompts (potentialSavings = 0)', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 400, // ratio = 4, high
        operation: 'summarize',
        cost: undefined as unknown as number,
      });

      const analysis = analyzer.analyzeCost();
      const promptIneff = analysis.inefficiencies.find(i => i.type === 'inefficient_prompt');
      expect(promptIneff).toBeDefined();
      expect(promptIneff!.suggestedSavings).toBe(0);
      expect(promptIneff!.impact).toBe(0);
    });
  });

  describe('findHighUsageOperations — cost fallback in stats', () => {
    it('should handle cost = undefined in high usage detection', () => {
      // Need > 2000 avg tokens for medium severity
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 1500,
        outputTokens: 1000, // total 2500, medium
        operation: 'big-op',
        cost: undefined as unknown as number,
      });

      const analysis = analyzer.analyzeCost();
      const highUsageIneff = analysis.inefficiencies.find(i => i.type === 'high_token_usage');
      expect(highUsageIneff).toBeDefined();
      expect(highUsageIneff!.impact).toBe(0); // averageCost = 0 / count
    });
  });

  describe('analyzeCost — multiple models same hour', () => {
    it('should aggregate cost by hour for multiple models', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.01,
      });

      tracker.trackUsage({
        model: 'claude-3',
        inputTokens: 200,
        outputTokens: 100,
        operation: 'analyze',
        cost: 0.02,
      });

      const analysis = analyzer.analyzeCost();
      const hours = Object.keys(analysis.costByHour);
      expect(hours).toHaveLength(1);
      // Both costs should be in the same hour bucket
      const hourCost = analysis.costByHour[hours[0]];
      expect(hourCost).toBeCloseTo(0.03, 10);
    });
  });
});

describe('Coverage Gap Tests — tracker.ts', () => {
  let tracker: CostTrackerManager;

  beforeEach(() => {
    tracker = new CostTrackerManager();
  });

  describe('getTotalUsage — cost fallback', () => {
    it('should handle usage with cost = undefined in getTotalUsage', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: undefined as unknown as number,
      });

      const total = tracker.getTotalUsage();
      expect(total.cost).toBe(0);
      expect(total.inputTokens).toBe(100);
      expect(total.outputTokens).toBe(50);
      expect(total.totalTokens).toBe(150);
    });
  });

  describe('getUsageHistory — cost fallback', () => {
    it('should handle usage with cost = undefined in getUsageHistory', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: undefined as unknown as number,
      });

      const history = tracker.getUsageHistory(24);
      expect(history).toHaveLength(1);
      expect(history[0].cost).toBe(0);
      expect(history[0].tokens).toBe(150);
    });
  });

  describe('trackUsage — totalTokens fallback', () => {
    it('should auto-calculate totalTokens when not provided', () => {
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 300,
        outputTokens: 200,
        operation: 'generate',
        cost: 0.01,
        // totalTokens intentionally omitted
      } as Parameters<typeof tracker.trackUsage>[0]);

      const usage = tracker.getUsage();
      expect(usage[0].totalTokens).toBe(500);
    });
  });
});

describe('Coverage Gap Tests — utils.ts', () => {
  describe('formatTable — undefined cell handling', () => {
    it('should handle rows with empty cells vs header widths (optional chaining branch)', () => {
      // When a row cell is shorter than header, the ?. in width calculation handles it
      const headers = ['Header1', 'Header2'];
      const rows: string[][] = [
        ['x', 'y'], // shorter cells, ?.length works normally
      ];

      const table = utils.formatTable(headers, rows);
      expect(table).toContain('Header1');
      expect(table).toContain('Header2');
      expect(table).toContain('x');
      expect(table).toContain('y');
    });

    it('should handle row with fewer columns than headers (columnWidths[index] ?? 0)', () => {
      const headers = ['A', 'B', 'C', 'D'];
      const rows: string[][] = [
        ['only-one'],
      ];

      // Column D index 3 — columnWidths[3] exists from header, but row cells don't have it
      // The ?? 0 in formatRow fires when columnWidths[index] is somehow undefined
      const table = utils.formatTable(headers, rows);
      expect(table).toContain('D');
      expect(table).toContain('only-one');
    });

    it('should handle row with more columns than headers (nullish coalescing)', () => {
      // When row has more cells than headers, columnWidths[index] is undefined → ?? 0
      const headers = ['H1'];
      const rows: string[][] = [
        ['a', 'b', 'c'], // more cells than headers
      ];
      // This will crash with padEnd on undefined width? No, ?? 0 handles it
      // But cell.padEnd(0) is valid
      expect(() => utils.formatTable(headers, rows)).not.toThrow();
    });
  });

  describe('formatCurrency — EUR currency for small/large values', () => {
    it('should format EUR for millions', () => {
      expect(utils.formatCurrency(2000000, 'EUR')).toBe('€2M');
    });

    it('should format EUR for sub-dollar amounts', () => {
      expect(utils.formatCurrency(0.005, 'EUR')).toBe('€0.005');
    });
  });

  describe('formatTokens — exact thousand boundary', () => {
    it('should format exactly 1000 as 1K', () => {
      expect(utils.formatTokens(1000)).toBe('1K');
    });

    it('should format exactly 1000000 as 1M', () => {
      expect(utils.formatTokens(1000000)).toBe('1M');
    });
  });

  describe('deepClone — object with nested properties', () => {
    it('should deep clone a plain object with multiple keys', () => {
      const original = { x: 1, y: { z: 2 }, w: null };
      const cloned = utils.deepClone(original);
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.y).not.toBe(original.y);
    });
  });

  describe('debounce — single call', () => {
    it('should execute after wait period with single call', (done) => {
      let result = 0;
      const fn = utils.debounce((val: number) => { result = val; }, 50);
      fn(42);
      setTimeout(() => {
        expect(result).toBe(42);
        done();
      }, 100);
    });
  });

  describe('throttle — leading edge only', () => {
    it('should call on leading edge and block subsequent calls', (done) => {
      let count = 0;
      const fn = utils.throttle(() => { count++; }, 100);
      fn(); // calls
      fn(); // blocked
      expect(count).toBe(1);
      setTimeout(done, 150);
    });
  });
});
