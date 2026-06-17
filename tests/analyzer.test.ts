import { describe, it, expect, beforeEach } from 'vitest';
import { costAnalyzer, CostAnalyzer } from '../src/analyzer';
import { costTrackerManager } from '../src/tracker';

describe('CostAnalyzer', () => {
  let analyzer: CostAnalyzer;

  beforeEach(() => {
    // Reset the tracker for clean testing
    costTrackerManager['trackers'] = new Map();
    costTrackerManager['usage'] = [];
    
    analyzer = new CostAnalyzer(costTrackerManager);
  });

  describe('analyzeCost', () => {
    it('should return empty analysis when no usage data exists', () => {
      const analysis = analyzer.analyzeCost();
      
      expect(analysis.totalCost).toBe(0);
      expect(analysis.totalTokens).toBe(0);
      expect(analysis.averageCostPerToken).toBe(0);
      expect(analysis.costByModel).toEqual({});
      expect(analysis.costByOperation).toEqual({});
      expect(analysis.costByHour).toEqual({});
      expect(analysis.inefficiencies).toEqual([]);
      expect(analysis.recommendations).toEqual([]);
    });

    it('should analyze cost data correctly', () => {
      // Create tracker
      costTrackerManager.createTracker({
        name: 'GPT-4 Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate', 'analyze']
      });

      // Track some usage
      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 1000,
        outputTokens: 500,
        operation: 'generate',
        cost: 0.045
      });

      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 2000,
        outputTokens: 1000,
        operation: 'analyze',
        cost: 0.09
      });

      const analysis = analyzer.analyzeCost();

      expect(analysis.totalCost).toBe(0.135);
      expect(analysis.totalTokens).toBe(4500);
      expect(analysis.averageCostPerToken).toBeCloseTo(0.00003, 5);
      expect(analysis.costByModel['gpt-4']).toBe(0.135);
      expect(analysis.costByOperation['generate']).toBe(0.045);
      expect(analysis.costByOperation['analyze']).toBe(0.09);
      expect(analysis.inefficiencies).toEqual([]);
      expect(analysis.recommendations).toEqual([]);
    });

    it('should filter by time range', () => {
      const now = Date.now();
      const oneHourAgo = now - 60 * 60 * 1000;

      // Create tracker
      costTrackerManager.createTracker({
        name: 'GPT-4 Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate']
      });

      // Track recent usage
      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 1000,
        outputTokens: 500,
        operation: 'generate',
        cost: 0.045
      });

      // Track old usage (should be filtered out)
      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 2000,
        outputTokens: 1000,
        operation: 'generate',
        cost: 0.09
      });

      const analysisRecent = analyzer.analyzeCost(oneHourAgo);
      expect(analysisRecent.totalCost).toBe(0.045);
      expect(analysisRecent.totalTokens).toBe(1500);

      const analysisAll = analyzer.analyzeCost();
      expect(analysisAll.totalCost).toBe(0.135);
      expect(analysisAll.totalTokens).toBe(4500);
    });
  });

  describe('detectInefficiencies', () => {
    it('should detect high token usage operations', () => {
      costTrackerManager.createTracker({
        name: 'GPT-4 Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['generate-large-content']
      });

      // Track high usage operation
      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 10000,
        outputTokens: 5000,
        operation: 'generate-large-content',
        cost: 0.45
      });

      const analysis = analyzer.analyzeCost();
      
      expect(analysis.inefficiencies).toHaveLength(1);
      const inefficiency = analysis.inefficiencies[0];
      expect(inefficiency.type).toBe('high_token_usage');
      expect(inefficiency.severity).toBe('critical');
      expect(inefficiency.affectedOperations).toEqual(['generate-large-content']);
      expect(inefficiency.suggestedSavings).toBeGreaterThan(0);
    });

    it('should detect expensive models', () => {
      // Create expensive model tracker
      costTrackerManager.createTracker({
        name: 'Expensive Model',
        model: 'gpt-4-turbo',
        costPerInputToken: 0.0001,
        costPerOutputToken: 0.0002,
        currency: 'USD',
        trackedOperations: ['translate']
      });

      // Create cheap model tracker
      costTrackerManager.createTracker({
        name: 'Cheap Model',
        model: 'gpt-3.5',
        costPerInputToken: 0.00001,
        costPerOutputToken: 0.00002,
        currency: 'USD',
        trackedOperations: ['translate']
      });

      // Track usage for expensive model
      costTrackerManager.trackUsage({
        model: 'gpt-4-turbo',
        inputTokens: 1000,
        outputTokens: 500,
        operation: 'translate',
        cost: 0.2
      });

      const analysis = analyzer.analyzeCost();
      
      expect(analysis.inefficiencies).toHaveLength(1);
      const inefficiency = analysis.inefficiencies[0];
      expect(inefficiency.type).toBe('expensive_model');
      expect(inefficiency.severity).toBe('critical');
      expect(inefficiency.affectedOperations).toEqual(['translate']);
      expect(inefficiency.model).toBe('gpt-4-turbo');
    });

    it('should detect inefficient prompts (high output ratio)', () => {
      costTrackerManager.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['summarize']
      });

      // Track inefficient prompt (high output ratio)
      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 400, // 4:1 ratio, should be detected
        operation: 'summarize',
        cost: 0.03
      });

      const analysis = analyzer.analyzeCost();
      
      expect(analysis.inefficiencies).toHaveLength(1);
      const inefficiency = analysis.inefficiencies[0];
      expect(inefficiency.type).toBe('inefficient_prompt');
      expect(inefficiency.severity).toBe('high');
      expect(inefficiency.affectedOperations).toEqual(['summarize']);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate model rightsize recommendations', () => {
      costTrackerManager.createTracker({
        name: 'Expensive Model',
        model: 'gpt-4',
        costPerInputToken: 0.0001,
        costPerOutputToken: 0.0002,
        currency: 'USD',
        trackedOperations: ['simple-task']
      });

      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 1000,
        outputTokens: 500,
        operation: 'simple-task',
        cost: 0.2
      });

      const analysis = analyzer.analyzeCost();
      
      expect(analysis.recommendations).toHaveLength(1);
      const recommendation = analysis.recommendations[0];
      expect(recommendation.type).toBe('model_rightsize');
      expect(recommendation.priority).toBe('high');
      expect(recommendation.estimatedSavings).toBeGreaterThan(0);
      expect(recommendation.confidence).toBeGreaterThan(0);
      expect(recommendation.confidence).toBeLessThanOrEqual(1);
    });

    it('should generate prompt optimization recommendations', () => {
      costTrackerManager.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['write-content']
      });

      // Track inefficient prompt
      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 100,
        outputTokens: 400, // High output ratio
        operation: 'write-content',
        cost: 0.03
      });

      const analysis = analyzer.analyzeCost();
      
      expect(analysis.recommendations).toHaveLength(1);
      const recommendation = analysis.recommendations[0];
      expect(recommendation.type).toBe('prompt_optimize');
      expect(recommendation.priority).toBe('medium');
    });

    it('should generate batch operations recommendations for high usage', () => {
      costTrackerManager.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['process-data']
      });

      // Track multiple high usage operations
      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 5000,
        outputTokens: 2500,
        operation: 'process-data',
        cost: 0.225
      });

      const analysis = analyzer.analyzeCost();
      
      expect(analysis.recommendations).toHaveLength(1);
      const recommendation = analysis.recommendations[0];
      expect(recommendation.type).toBe('batch_operations');
      expect(recommendation.priority).toBe('medium');
    });

    it('should sort recommendations by potential savings', () => {
      costTrackerManager.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['task1', 'task2']
      });

      // Track different usage levels
      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 1000,
        outputTokens: 500,
        operation: 'task1',
        cost: 0.045
      });

      costTrackerManager.trackUsage({
        model: 'gpt-4',
        inputTokens: 5000,
        outputTokens: 2500,
        operation: 'task2',
        cost: 0.225
      });

      const analysis = analyzer.analyzeCost();
      
      // Should have multiple recommendations sorted by estimated savings
      expect(analysis.recommendations.length).toBeGreaterThan(1);
      
      // Check that they're sorted by estimated savings (descending)
      for (let i = 1; i < analysis.recommendations.length; i++) {
        const currentSavings = analysis.recommendations[i].estimatedSavings * analysis.recommendations[i].confidence;
        const previousSavings = analysis.recommendations[i - 1].estimatedSavings * analysis.recommendations[i - 1].confidence;
        expect(currentSavings).toBeLessThanOrEqual(previousSavings);
      }
    });

    it('should limit to top 5 recommendations', () => {
      costTrackerManager.createTracker({
        name: 'Test Tracker',
        model: 'gpt-4',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        currency: 'USD',
        trackedOperations: ['task1', 'task2', 'task3', 'task4', 'task6']
      });

      // Track many different operations to trigger multiple recommendations
      for (let i = 1; i <= 6; i++) {
        costTrackerManager.trackUsage({
          model: 'gpt-4',
          inputTokens: i * 1000,
          outputTokens: i * 500,
          operation: `task${i}`,
          cost: i * 0.045
        });
      }

      const analysis = analyzer.analyzeCost();
      
      // Should return at most 5 recommendations
      expect(analysis.recommendations.length).toBeLessThanOrEqual(5);
    });
  });
});