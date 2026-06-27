import { describe, it, expect } from 'vitest';
import {
  costTrackerManager,
  CostTrackerManager,
  costAnalyzer,
  CostAnalyzer,
  formatCurrency,
  formatTokens,
  formatTable,
  formatPercentage,
  formatBytes,
  formatDuration,
  generateId,
  isValidEmail,
  isValidUrl,
  debounce,
  throttle,
  deepClone,
  roundToDecimal,
  formatNumber,
  type TokenUsage,
  type CostTracker,
  type CostAnalysis,
  type CostInefficiency,
  type CostRecommendation,
  type Budget,
  type BudgetAlert,
  type ForecastData,
  type AICostConfig,
} from '../src/index';

describe('Index exports', () => {
  it('exports costTrackerManager singleton', () => {
    expect(costTrackerManager).toBeInstanceOf(CostTrackerManager);
  });

  it('exports costAnalyzer singleton', () => {
    expect(costAnalyzer).toBeInstanceOf(CostAnalyzer);
  });

  it('exports CostTrackerManager class', () => {
    const manager = new CostTrackerManager();
    expect(manager).toBeInstanceOf(CostTrackerManager);
  });

  it('exports CostAnalyzer class', () => {
    const analyzer = new CostAnalyzer(costTrackerManager);
    expect(analyzer).toBeInstanceOf(CostAnalyzer);
  });

  it('exports all utility functions', () => {
    expect(typeof formatCurrency).toBe('function');
    expect(typeof formatTokens).toBe('function');
    expect(typeof formatTable).toBe('function');
    expect(typeof formatPercentage).toBe('function');
    expect(typeof formatBytes).toBe('function');
    expect(typeof formatDuration).toBe('function');
    expect(typeof generateId).toBe('function');
    expect(typeof isValidEmail).toBe('function');
    expect(typeof isValidUrl).toBe('function');
    expect(typeof debounce).toBe('function');
    expect(typeof throttle).toBe('function');
    expect(typeof deepClone).toBe('function');
    expect(typeof roundToDecimal).toBe('function');
    expect(typeof formatNumber).toBe('function');
  });

  it('exports all type interfaces (compile-time check)', () => {
    // These are type-only exports — verify they're usable at compile time
    const usage: TokenUsage = {
      model: 'gpt-4',
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      operation: 'test',
      cost: 0.01,
      timestamp: Date.now(),
    };
    expect(usage.model).toBe('gpt-4');

    const tracker: CostTracker = {
      id: 'test',
      name: 'Test',
      model: 'gpt-4',
      costPerInputToken: 0.00003,
      costPerOutputToken: 0.00006,
      currency: 'USD',
      trackedOperations: ['test'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(tracker.model).toBe('gpt-4');

    // Type-only check — these compile but have no runtime value
    const _analysis: CostAnalysis = {
      totalCost: 0,
      totalTokens: 0,
      averageCostPerToken: 0,
      costByModel: {},
      costByOperation: {},
      costByHour: {},
      inefficiencies: [],
      recommendations: [],
    };
    expect(_analysis.totalCost).toBe(0);

    const _inefficiency: CostInefficiency = {
      type: 'high_token_usage',
      severity: 'low',
      description: 'test',
      impact: 0,
      suggestedSavings: 0,
      affectedOperations: [],
    };
    expect(_inefficiency.type).toBe('high_token_usage');

    const _rec: CostRecommendation = {
      type: 'model_rightsize',
      priority: 'high',
      title: 'test',
      description: 'test',
      estimatedSavings: 0,
      implementation: 'test',
      confidence: 0.8,
    };
    expect(_rec.priority).toBe('high');

    const _budget: Budget = {
      name: 'test',
      amount: 100,
      period: 'monthly',
      alertThreshold: 0.8,
    };
    expect(_budget.amount).toBe(100);

    const _alert: BudgetAlert = {
      budgetName: 'test',
      currentSpend: 50,
      threshold: 0.8,
      message: 'test',
    };
    expect(_alert.currentSpend).toBe(50);

    const _forecast: ForecastData = {
      predictedCost: 100,
      confidence: 0.8,
      trend: 'increasing',
    };
    expect(_forecast.trend).toBe('increasing');

    const _config: AICostConfig = {
      trackers: [],
      budgets: [],
    };
    expect(_config.trackers).toEqual([]);
  });
});
