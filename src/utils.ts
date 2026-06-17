export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (amount === 0) return '$0.00';
  
  const abs = Math.abs(amount);
  let formatted: string;
  
  if (abs >= 1000000) {
    formatted = `$${(amount / 1000000).toFixed(2)}M`;
  } else if (abs >= 1000) {
    formatted = `$${(amount / 1000).toFixed(2)}K`;
  } else if (abs >= 1) {
    formatted = `$${amount.toFixed(3)}`;
  } else {
    formatted = `$${amount.toFixed(6)}`;
  }
  
  return formatted;
}

export function formatTokens(tokens: number): string {
  if (tokens === 0) return '0';
  
  const abs = Math.abs(tokens);
  let formatted: string;
  
  if (abs >= 1000000) {
    formatted = `${(tokens / 1000000).toFixed(2)}M`;
  } else if (abs >= 1000) {
    formatted = `${(tokens / 1000).toFixed(2)}K`;
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
      const width = columnWidths[index];
      return cell.padEnd(width);
    }).join('');
  };

  const headerRow = formatRow(headers);
  const separator = '-'.repeat(headerRow.length);
  
  const dataRows = rows.map(formatRow);
  
  return [headerRow, separator, ...dataRows].join('\\n');
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
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
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
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      cloned[key as keyof T] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  
  return obj;
}

export function roundToDecimal(num: number, decimal: number): number {
  const factor = Math.pow(10, decimal);
  return Math.round(num * factor) / factor;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}