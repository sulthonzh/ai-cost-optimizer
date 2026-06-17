import { describe, it, expect, beforeEach } from 'vitest';
import { costTrackerManager, CostTrackerManager } from '../src/tracker';

describe('CostTrackerManager', () => {
  let tracker: CostTrackerManager;

  beforeEach(() => {
    tracker = new CostTrackerManager();
  });

  describe('createTracker', () => {
    it('should create a new cost tracker', () => {
      const trackerId = tracker.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate', 'analyze']
      });

      expect(trackerId).toBeDefined();
      expect(typeof trackerId).toBe('string');
      
      const trackerData = tracker.getTracker(trackerId);
      expect(trackerData).toBeDefined();
      expect(trackerData?.name).toBe('Test Tracker');
      expect(trackerData?.model).toBe('gpt-4');
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const beforeCreate = Date.now();
      const trackerId = tracker.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });
      const afterCreate = Date.now();

      const trackerData = tracker.getTracker(trackerId)!;
      expect(trackerData.createdAt).toBeGreaterThanOrEqual(beforeCreate);
      expect(trackerData.createdAt).toBeLessThanOrEqual(afterCreate);
      expect(trackerData.updatedAt).toBe(trackerData.createdAt);
    });
  });

  describe('getTracker', () => {
    it('should return undefined for non-existent tracker', () => {
      const result = tracker.getTracker('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should return existing tracker by ID', () => {
      const trackerId = tracker.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });

      const result = tracker.getTracker(trackerId);
      expect(result).toBeDefined();
      expect(result?.id).toBe(trackerId);
    });
  });

  describe('getAllTrackers', () => {
    it('should return empty array when no trackers exist', () => {
      const trackers = tracker.getAllTrackers();
      expect(trackers).toEqual([]);
    });

    it('should return all created trackers', () => {
      const id1 = tracker.createTracker({
        name: 'Tracker 1',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });

      const id2 = tracker.createTracker({
        name: 'Tracker 2',
        model: 'claude-3',
        costPerInputToken: 0.000015,
        costPerOutputToken: 0.000075,
        currency: 'USD',
        trackedOperations: ['analyze']
      });

      const trackers = tracker.getAllTrackers();
      expect(trackers).toHaveLength(2);
      expect(trackers[0].id).toBe(id1);
      expect(trackers[1].id).toBe(id2);
    });
  });

  describe('updateTracker', () => {
    it('should update existing tracker', () => {
      const trackerId = tracker.createTracker({
        name: 'Original Name',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });

      const updated = tracker.updateTracker(trackerId, {
        name: 'Updated Name',
        costPerInputToken: 0.00004
      });

      expect(updated).toBe(true);

      const trackerData = tracker.getTracker(trackerId)!;
      expect(trackerData.name).toBe('Updated Name');
      expect(trackerData.costPerInputToken).toBe(0.00004);
      expect(trackerData.costPerOutputToken).toBe(0.00006); // Unchanged
      expect(trackerData.updatedAt).toBeGreaterThan(trackerData.createdAt);
    });

    it('should return false for non-existent tracker', () => {
      const updated = tracker.updateTracker('non-existent-id', {
        name: 'Updated Name'
      });
      expect(updated).toBe(false);
    });
  });

  describe('deleteTracker', () => {
    it('should delete existing tracker', () => {
      const trackerId = tracker.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });

      const deleted = tracker.deleteTracker(trackerId);
      expect(deleted).toBe(true);

      const trackerData = tracker.getTracker(trackerId);
      expect(trackerData).toBeUndefined();
    });

    it('should return false for non-existent tracker', () => {
      const deleted = tracker.deleteTracker('non-existent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('trackUsage', () => {
    it('should track usage data', () => {
      tracker.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });

      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.0045
      });

      const usage = tracker.getUsage();
      expect(usage).toHaveLength(1);
      expect(usage[0].model).toBe('gpt-4');
      expect(usage[0].inputTokens).toBe(100);
      expect(usage[0].outputTokens).toBe(50);
      expect(usage[0].totalTokens).toBe(150);
      expect(usage[0].operation).toBe('generate');
      expect(usage[0].cost).toBe(0.0045);
    });

    it('should add timestamp to tracked usage', () => {
      tracker.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });

      const beforeTrack = Date.now();
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.0045
      });
      const afterTrack = Date.now();

      const usage = tracker.getUsage();
      expect(usage[0].timestamp).toBeGreaterThanOrEqual(beforeTrack);
      expect(usage[0].timestamp).toBeLessThanOrEqual(afterTrack);
    });
  });

  describe('getUsage', () => {
    beforeEach(() => {
      tracker.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate', 'analyze']
      });

      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.0045
      });

      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 200,
        outputTokens: 100,
        operation: 'analyze',
        cost: 0.009
      });
    });

    it('should filter by model', () => {
      const usage = tracker.getUsage('gpt-4');
      expect(usage).toHaveLength(2);
      
      const usageOtherModel = tracker.getUsage('claude-3');
      expect(usageOtherModel).toHaveLength(0);
    });

    it('should filter by operation', () => {
      const usage = tracker.getUsage(undefined, 'generate');
      expect(usage).toHaveLength(1);
      expect(usage[0].operation).toBe('generate');

      const usageAnalyze = tracker.getUsage(undefined, 'analyze');
      expect(usageAnalyze).toHaveLength(1);
      expect(usageAnalyze[0].operation).toBe('analyze');
    });

    it('should filter by time range', () => {
      const since = Date.now();
      const usage = tracker.getUsage(undefined, undefined, since);
      expect(usage).toHaveLength(0);

      const earlier = Date.now() - 1000;
      const usageEarlier = tracker.getUsage(undefined, undefined, earlier);
      expect(usageEarlier).toHaveLength(2);
    });
  });

  describe('getTotalUsage', () => {
    beforeEach(() => {
      tracker.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });

      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.0045
      });

      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 200,
        outputTokens: 100,
        operation: 'generate',
        cost: 0.009
      });
    });

    it('should calculate total usage correctly', () => {
      const total = tracker.getTotalUsage();
      expect(total.inputTokens).toBe(300);
      expect(total.outputTokens).toBe(150);
      expect(total.totalTokens).toBe(450);
      expect(total.cost).toBe(0.0135);
    });

    it('should calculate totals with filters', () => {
      const total = tracker.getTotalUsage('gpt-4', 'generate');
      expect(total.totalTokens).toBe(450);

      const totalOtherModel = tracker.getTotalUsage('claude-3');
      expect(totalOtherModel.totalTokens).toBe(0);
    });
  });

  describe('getUsageHistory', () => {
    beforeEach(() => {
      tracker.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });

      const now = Date.now();
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 50,
        operation: 'generate',
        cost: 0.0045
      });

      // Add usage from different hour
      tracker.trackUsage({
        model: 'gpt-4',
        inputTokens: 200,
        outputTokens: 100,
        operation: 'generate',
        cost: 0.009
      });
    });

    it('should return usage history grouped by hour', () => {
      const history = tracker.getUsageHistory();
      expect(history.length).toBeGreaterThan(0);
      
      const entry = history[0];
      expect(entry.hour).toMatch(/\\d{4}-\\d{2}-\\d{2}T\\d{2}/);
      expect(typeof entry.tokens).toBe('number');
      expect(typeof entry.cost).toBe('number');
    });

    it('should respect time range filter', () => {
      const history = tracker.getUsageHistory(0);
      expect(history.length).toBe(0);

      const historyFull = tracker.getUsageHistory(24);
      expect(historyFull.length).toBeGreaterThan(0);
    });
  });
});