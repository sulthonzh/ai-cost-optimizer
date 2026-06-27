function stripTrailingZeros(s: string): string {
  return s.replace(/\.?0+$/, '');
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (amount === 0) return '$0.00';
  
  const symbol = currency === 'EUR' ? '€' : '$';
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  let formatted: string;
  
  if (abs >= 1000000) {
    formatted = `${symbol}${sign}${stripTrailingZeros((abs / 1000000).toFixed(2))}M`;
  } else if (abs >= 1000) {
    formatted = `${symbol}${sign}${stripTrailingZeros((abs / 1000).toFixed(2))}K`;
  } else if (abs >= 1) {
    formatted = `${symbol}${sign}${stripTrailingZeros(abs.toFixed(3))}`;
  } else {
    formatted = `${symbol}${sign}${stripTrailingZeros(abs.toFixed(6))}`;
  }
  
  return formatted;
}

export function formatTokens(tokens: number): string {
  if (tokens === 0) return '0';
  
  const abs = Math.abs(tokens);
  const sign = tokens < 0 ? '-' : '';
  let formatted: string;
  
  if (abs >= 1000000) {
    formatted = `${sign}${stripTrailingZeros((abs / 1000000).toFixed(2))}M`;
  } else if (abs >= 1000) {
    formatted = `${sign}${stripTrailingZeros((abs / 1000).toFixed(2))}K`;
  } else {
    formatted = tokens.toLocaleString();
  }
  
  return formatted;
}

export function formatTable(headers: string[], rows: string[][]): string {
  const columnWidths = headers.map((header, index) => {
    const maxWidth = Math.max(
      header.length,
      ...rows.map(row => row[index]?.length || 0)
    );
    return maxWidth + 2;
  });

  const formatRow = (row: string[]) => {
    return row.map((cell, index) => {
      const width = columnWidths[index] ?? 0;
      return cell.padEnd(width);
    }).join('');
  };

  const headerRow = formatRow(headers);
  const separator = '-'.repeat(headerRow.length);
  
  const dataRows = rows.map(formatRow);
  
  return [headerRow, separator, ...dataRows].join('\n');
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  
  if (typeof obj === 'object') {
    const cloned = {} as Record<string, unknown>;
    const record = obj as Record<string, unknown>;
    Object.keys(record).forEach(key => {
      cloned[key] = deepClone(record[key]);
    });
    return cloned as T;
  }
  
  return obj;
}

export function roundToDecimal(num: number, decimal: number): number {
  const factor = Math.pow(10, decimal);
  return Math.round(num * factor) / factor;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', { 
    maximumFractionDigits: 0 
  }).format(Math.round(num));
}
