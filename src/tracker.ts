import { TokenUsage, CostTracker } from './types';

export class CostTrackerManager {
  private trackers: Map<string, CostTracker> = new Map();
  private usage: TokenUsage[] = [];

  createTracker(tracker: Omit<CostTracker, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const now = Date.now();
    const newTracker: CostTracker = {
      ...tracker,
      id,
      createdAt: now,
      updatedAt: now,
    };
    
    this.trackers.set(id, newTracker);
    return id;
  }

  getTracker(id: string): CostTracker | undefined {
    return this.trackers.get(id);
  }

  getAllTrackers(): CostTracker[] {
    return Array.from(this.trackers.values());
  }

  updateTracker(id: string, updates: Partial<CostTracker>): boolean {
    const tracker = this.trackers.get(id);
    if (!tracker) return false;

    const updatedTracker = {
      ...tracker,
      ...updates,
      updatedAt: Date.now(),
    };
    
    this.trackers.set(id, updatedTracker);
    return true;
  }

  deleteTracker(id: string): boolean {
    return this.trackers.delete(id);
  }

  trackUsage(usage: Omit<TokenUsage, 'timestamp'>): void {
    const trackedUsage: TokenUsage = {
      ...usage,
      timestamp: Date.now(),
    };
    
    this.usage.push(trackedUsage);
  }

  getUsage(model?: string, operation?: string, since?: number): TokenUsage[] {
    let filteredUsage = this.usage;

    if (model) {
      filteredUsage = filteredUsage.filter(u => u.model === model);
    }

    if (operation) {
      filteredUsage = filteredUsage.filter(u => u.operation === operation);
    }

    if (since) {
      filteredUsage = filteredUsage.filter(u => u.timestamp >= since);
    }

    return filteredUsage;
  }

  getTotalUsage(model?: string, operation?: string, since?: number): {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
  } {
    const usage = this.getUsage(model, operation, since);
    
    const inputTokens = usage.reduce((sum, u) => sum + u.inputTokens, 0);
    const outputTokens = usage.reduce((sum, u) => sum + u.outputTokens, 0);
    const totalTokens = inputTokens + outputTokens;
    
    let cost = 0;
    usage.forEach(u => {
      const tracker = this.getTrackerForModel(u.model);
      if (tracker) {
        cost += (inputTokens * tracker.costPerInputToken) + (outputTokens * tracker.costPerOutputToken);
      }
    });

    return { inputTokens, outputTokens, totalTokens, cost };
  }

  getUsageHistory(hours: number = 24): Array<{ hour: string; tokens: number; cost: number }> {
    const since = Date.now() - (hours * 60 * 60 * 1000);
    const recentUsage = this.getUsage(undefined, undefined, since);
    
    const hourlyData = new Map<string, { tokens: number; cost: number }>();
    
    recentUsage.forEach(usage => {
      const hour = new Date(usage.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
      const existing = hourlyData.get(hour) || { tokens: 0, cost: 0 };
      
      existing.tokens += usage.totalTokens;
      existing.cost += usage.cost || 0;
      
      hourlyData.set(hour, existing);
    });

    return Array.from(hourlyData.entries())
      .map(([hour, data]) => ({ hour, tokens: data.tokens, cost: data.cost }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  private getTrackerForModel(model: string): CostTracker | undefined {
    return Array.from(this.trackers.values()).find(t => t.model === model);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const costTrackerManager = new CostTrackerManager();