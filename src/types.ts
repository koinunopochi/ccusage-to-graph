export interface ModelBreakdown {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  cacheCreationCost: number;
  cacheReadCost: number;
  totalCost: number;
}

export interface DailyUsage {
  date: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  totalTokens: number;
  totalCost: number;
  modelsUsed: string[];
  modelBreakdowns: ModelBreakdown[];
}

export interface UsageData {
  daily?: DailyUsage[];
  usage?: Array<{
    date: string;
    model: string;
    tokens: number;
    cost: number;
  }>;
  total?: {
    tokens: number;
    cost: number;
  };
}

export interface CliOptions {
  type: 'bar' | 'line';
  period: 'day' | 'week' | 'month';
  threshold: boolean;
}