// Export all utilities
export * from './channelMatcher';
export * from './epgParser';

/**
 * Check if user's subscription allows a feature
 */
export const checkFeatureAccess = (
  requiredTier: 'free' | 'basic' | 'premium' | 'ultimate',
  currentTier: 'free' | 'basic' | 'premium' | 'ultimate'
): boolean => {
  const tierOrder = ['free', 'basic', 'premium', 'ultimate'];
  const requiredIndex = tierOrder.indexOf(requiredTier);
  const currentIndex = tierOrder.indexOf(currentTier);
  
  return currentIndex >= requiredIndex;
};

/**
 * Get quality label based on resolution
 */
export const getQualityLabel = (width: number, height: number): string => {
  if (height >= 4320) return '8K';
  if (height >= 2160) return '4K UHD';
  if (height >= 1440) return 'QHD';
  if (height >= 1080) return 'FHD';
  if (height >= 720) return 'HD';
  return 'SD';
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(str: string, fallback: T): T => {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
};

/**
 * Clamp value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Sleep/delay utility
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Log with environment check (only logs in development)
 */
export const debugLog = (...args: any[]): void => {
  if (!isProduction()) {
    console.log('[Crow-Flix Debug]', ...args);
  }
};

/**
 * Error logger with environment check
 */
export const errorLog = (...args: any[]): void => {
  console.error('[Crow-Flix Error]', ...args);
  // In production, you might want to send this to an error tracking service
};

/**
 * Warn logger with environment check
 */
export const warnLog = (...args: any[]): void => {
  if (!isProduction()) {
    console.warn('[Crow-Flix Warning]', ...args);
  }
};

/**
 * Format bytes to human readable
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format bitrate
 */
export const formatBitrate = (bitsPerSecond: number): string => {
  if (bitsPerSecond < 1000) return `${bitsPerSecond} bps`;
  if (bitsPerSecond < 1000000) return `${(bitsPerSecond / 1000).toFixed(1)} Kbps`;
  if (bitsPerSecond < 1000000000) return `${(bitsPerSecond / 1000000).toFixed(1)} Mbps`;
  return `${(bitsPerSecond / 1000000000).toFixed(2)} Gbps`;
};

/**
 * Validate URL
 */
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url: string): string | null => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};

/**
 * Check if network is online
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

/**
 * Get network connection info
 */
export const getConnectionInfo = (): {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} => {
  if (typeof navigator === 'undefined') return {};
  
  const conn = (navigator as any).connection;
  if (!conn) return {};
  
  return {
    effectiveType: conn.effectiveType,
    downlink: conn.downlink,
    rtt: conn.rtt,
    saveData: conn.saveData,
  };
};

/**
 * Detect device type
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop';
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipod/.test(userAgent)) {
    return 'mobile';
  }
  
  if (/tablet|ipad|playbook|silk/.test(userAgent)) {
    return 'tablet';
  }
  
  return 'desktop';
};

/**
 * Detect browser
 */
export const getBrowser = (): string => {
  if (typeof navigator === 'undefined') return 'unknown';
  
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('SamsungBrowser')) return 'Samsung Internet';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  if (userAgent.includes('Trident')) return 'Internet Explorer';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  
  return 'Unknown';
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
};

/**
 * Download file
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain'): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Share content using Web Share API
 */
export const shareContent = async (title: string, text: string, url?: string): Promise<boolean> => {
  if (!navigator.share) {
    // Fallback to clipboard
    return copyToClipboard(`${title}\n\n${text}\n\n${url || ''}`);
  }
  
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
};
