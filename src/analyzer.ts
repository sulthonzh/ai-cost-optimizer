import { CostTrackerManager, costTrackerManager } from './tracker';
import { 
  CostAnalysis, 
  CostInefficiency, 
  CostRecommendation, 
  TokenUsage,
  CostTracker
} from './types';

export class CostAnalyzer {
  constructor(private tracker: CostTrackerManager) {}

  analyzeCost(since?: number): CostAnalysis {
    const usage = this.tracker.getUsage(undefined, undefined, since);
    const trackers = this.tracker.getAllTrackers();
    
    const totalCost = usage.reduce((sum, u) => sum + (u.cost || 0), 0);
    const totalTokens = usage.reduce((sum, u) => sum + u.totalTokens, 0);
    
    const costByModel: Record<string, number> = {};
    const costByOperation: Record<string, number> = {};
    const costByHour: Record<string, number> = {};
    
    usage.forEach(u => {
      costByModel[u.model] = (costByModel[u.model] || 0) + (u.cost || 0);
      costByOperation[u.operation] = (costByOperation[u.operation] || 0) + (u.cost || 0);
      
      const hour = new Date(u.timestamp).toISOString().slice(0, 13);
      costByHour[hour] = (costByHour[hour] || 0) + (u.cost || 0);
    });

    const averageCostPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;
    
    const inefficiencies = this.detectInefficiencies(usage, trackers);
    const recommendations = this.generateRecommendations(usage, trackers, inefficiencies);

    return {
      totalCost,
      totalTokens,
      averageCostPerToken,
      costByModel,
      costByOperation,
      costByHour,
      inefficiencies,
      recommendations
    };
  }

  private detectInefficiencies(usage: TokenUsage[], trackers: CostTracker[]): CostInefficiency[] {
    const inefficiencies: CostInefficiency[] = [];
    
    // High token usage detection
    const highUsageOperations = this.findHighUsageOperations(usage);
    highUsageOperations.forEach(op => {
      inefficiencies.push({
        type: 'high_token_usage',
        severity: op.severity,
        description: `Operation "${op.operation}" has high token usage (${op.totalTokens} tokens)`,
        impact: op.averageCost,
        suggestedSavings: op.potentialSavings,
        affectedOperations: [op.operation]
      });
    });

    // Expensive model detection
    const expensiveModels = this.findExpensiveModels(usage, trackers);
    expensiveModels.forEach(model => {
      inefficiencies.push({
        type: 'expensive_model',
        severity: model.severity,
        description: `Model "${model.model}" is expensive (${model.averageCostPerToken} per token)`,
        impact: model.totalCost,
        suggestedSavings: model.potentialSavings,
        affectedOperations: model.operations
      });
    });

    // Inefficient prompt detection (simplified - would need more sophisticated analysis)
    const inefficientPrompts = this.findInefficientPrompts(usage);
    inefficientPrompts.forEach(prompt => {
      inefficiencies.push({
        type: 'inefficient_prompt',
        severity: prompt.severity,
        description: `Prompt for "${prompt.operation}" appears inefficient (high output ratio)`,
        impact: prompt.totalCost,
        suggestedSavings: prompt.potentialSavings,
        affectedOperations: [prompt.operation]
      });
    });

    return inefficiencies;
  }

  private findHighUsageOperations(usage: TokenUsage[]): Array<{
    operation: string;
    totalTokens: number;
    averageCost: number;
    potentialSavings: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const operationStats = new Map<string, {
      totalTokens: number;
      totalCost: number;
      count: number;
    }>();

    usage.forEach(u => {
      const stats = operationStats.get(u.operation) || {
        totalTokens: 0,
        totalCost: 0,
        count: 0
      };
      stats.totalTokens += u.totalTokens;
      stats.totalCost += u.cost || 0;
      stats.count += 1;
      operationStats.set(u.operation, stats);
    });

    return Array.from(operationStats.entries())
      .map(([operation, stats]) => {
        const averageTokens = stats.totalTokens / stats.count;
        const averageCost = stats.totalCost / stats.count;
        
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (averageTokens > 10000) severity = 'critical';
        else if (averageTokens > 5000) severity = 'high';
        else if (averageTokens > 2000) severity = 'medium';
        
        // Potential savings if we could reduce by 20%
        const potentialSavings = stats.totalCost * 0.2;

        return {
          operation,
          totalTokens: stats.totalTokens,
          averageCost,
          potentialSavings,
          severity
        };
      })
      .filter(stat => stat.severity !== 'low');
  }

  private findExpensiveModels(usage: TokenUsage[], trackers: CostTracker[]): Array<{
    model: string;
    averageCostPerToken: number;
    totalCost: number;
    potentialSavings: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    operations: string[];
  }> {
    const modelStats = new Map<string, {
      totalTokens: number;
      totalCost: number;
      operations: Set<string>;
    }>();

    usage.forEach(u => {
      const tracker = trackers.find(t => t.model === u.model);
      if (tracker) {
        const stats = modelStats.get(u.model) || {
          totalTokens: 0,
          totalCost: 0,
          operations: new Set()
        };
        stats.totalTokens += u.totalTokens;
        stats.totalCost += u.cost || 0;
        stats.operations.add(u.operation);
        modelStats.set(u.model, stats);
      }
    });

    return Array.from(modelStats.entries())
      .map(([model, stats]) => {
        const averageCostPerToken = stats.totalTokens > 0 ? stats.totalCost / stats.totalTokens : 0;
        
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (averageCostPerToken > 0.001) severity = 'critical';
        else if (averageCostPerToken > 0.0005) severity = 'high';
        else if (averageCostPerToken > 0.0001) severity = 'medium';
        
        const potentialSavings = stats.totalCost * 0.15; // 15% potential savings

        return {
          model,
          averageCostPerToken,
          totalCost: stats.totalCost,
          potentialSavings,
          severity,
          operations: Array.from(stats.operations)
        };
      })
      .filter(stat => stat.severity !== 'low');
  }

  private findInefficientPrompts(usage: TokenUsage[]): Array<{
    operation: string;
    outputRatio: number;
    totalCost: number;
    potentialSavings: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    return usage
      .filter(u => u.inputTokens > 0 && u.outputTokens > 0)
      .map(u => {
        const outputRatio = u.outputTokens / u.inputTokens;
        const severity: 'low' | 'medium' | 'high' | 'critical' = outputRatio > 3 ? 'high' : outputRatio > 2 ? 'medium' : 'low';
        const potentialSavings = u.cost ? u.cost * 0.1 : 0; // 10% potential savings
        
        return {
          operation: u.operation,
          outputRatio,
          totalCost: u.cost || 0,
          potentialSavings,
          severity
        };
      })
      .filter(p => p.severity !== 'low');
  }

  private generateRecommendations(
    _usage: TokenUsage[], 
    _trackers: CostTracker[], 
    inefficiencies: CostInefficiency[]
  ): CostRecommendation[] {
    const recommendations: CostRecommendation[] = [];

    // Model rightsize recommendations
    const expensiveModels = inefficiencies.filter(i => i.type === 'expensive_model');
    expensiveModels.forEach(inf => {
      recommendations.push({
        type: 'model_rightsize',
        priority: 'high',
        title: 'Use cheaper model for less critical operations',
        description: `Consider using a more cost-effective model for operations with ${inf.affectedOperations.join(', ')}`,
        estimatedSavings: inf.suggestedSavings,
        implementation: 'Replace expensive model with a cheaper alternative like GPT-3.5 instead of GPT-4',
        confidence: 0.8
      });
    });

    // Prompt optimization recommendations
    const inefficientPrompts = inefficiencies.filter(i => i.type === 'inefficient_prompt');
    inefficientPrompts.forEach(inf => {
      recommendations.push({
        type: 'prompt_optimize',
        priority: 'medium',
        title: 'Optimize prompts to reduce output tokens',
        description: `Improve prompts for ${inf.affectedOperations.join(', ')} to reduce output token usage`,
        estimatedSavings: inf.suggestedSavings,
        implementation: 'Refine prompts to be more specific and reduce redundant information',
        confidence: 0.6
      });
    });

    // Batch operations recommendations
    const highUsageOperations = inefficiencies.filter(i => i.type === 'high_token_usage');
    if (highUsageOperations.length > 0) {
      recommendations.push({
        type: 'batch_operations',
        priority: 'medium',
        title: 'Batch multiple requests into single operations',
        description: 'Consider batching multiple similar requests to reduce overhead',
        estimatedSavings: highUsageOperations.reduce((sum, inf) => sum + inf.suggestedSavings, 0) * 0.5,
        implementation: 'Group related requests and process them together',
        confidence: 0.7
      });
    }

    return recommendations
      .sort((a, b) => (b.estimatedSavings * b.confidence) - (a.estimatedSavings * a.confidence))
      .slice(0, 5); // Top 5 recommendations
  }
}

export const costAnalyzer = new CostAnalyzer(costTrackerManager);