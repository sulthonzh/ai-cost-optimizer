export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  timestamp: number;
  model: string;
  operation: string;
  cost?: number;
}

export interface CostTracker {
  id: string;
  name: string;
  model: string;
  costPerInputToken: number;
  costPerOutputToken: number;
  currency: string;
  trackedOperations: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CostAnalysis {
  totalCost: number;
  totalTokens: number;
  averageCostPerToken: number;
  costByModel: Record<string, number>;
  costByOperation: Record<string, number>;
  costByHour: Record<string, number>;
  inefficiencies: CostInefficiency[];
  recommendations: CostRecommendation[];
}

export interface CostInefficiency {
  type: 'high_token_usage' | 'expensive_model' | 'inefficient_prompt' | 'redundant_operation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: number;
  suggestedSavings: number;
  affectedOperations: string[];
}

export interface CostRecommendation {
  type: 'model_rightsize' | 'prompt_optimize' | 'batch_operations' | 'reduce_frequency';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  estimatedSavings: number;
  implementation: string;
  confidence: number;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly';
  alertThreshold: number;
  warningThreshold: number;
  trackModels: string[];
  trackOperations: string[];
  createdAt: number;
}

export interface BudgetAlert {
  id: string;
  budgetId: string;
  type: 'warning' | 'critical';
  currentUsage: number;
  threshold: number;
  message: string;
  timestamp: number;
}

export interface ForecastData {
  currentUsage: number;
  projectedUsage: number;
  confidence: number;
  timeRange: number;
  factors: string[];
  recommendations: string[];
}

export interface AICostConfig {
  defaultCostTracker: Partial<CostTracker>;
  budgetAlerts: BudgetAlert[];
  analysisSettings: {
    enableForecasting: boolean;
    enableRecommendations: boolean;
    minimumConfidence: number;
    inefficiencyThresholds: {
      highTokenUsage: number;
      expensiveModel: number;
      inefficientPrompt: number;
    };
  };
}