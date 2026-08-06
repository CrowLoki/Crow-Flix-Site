import { useEffect, useState } from 'react';

interface WatchHistoryItem {
  contentId: string;
  channelId?: string;
  title: string;
  thumbnail?: string;
  progress: number;
  duration: number;
  timestamp: number;
  type: 'live' | 'vod';
}

/**
 * Hook to manage continue watching functionality
 */
export const useContinueWatching = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('crowflix-watch-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse watch history:', e);
      }
    }
  }, []);

  // Save to localStorage when history changes
  const updateHistory = (item: Omit<WatchHistoryItem, 'timestamp'>) => {
    const newItem: WatchHistoryItem = {
      ...item,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      // Remove existing entry if present
      const filtered = prev.filter((h) => h.contentId !== item.contentId);
      // Add new item at the beginning
      const updated = [newItem, ...filtered].slice(0, 50); // Keep last 50 items
      localStorage.setItem('crowflix-watch-history', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromHistory = (contentId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.contentId !== contentId);
      localStorage.setItem('crowflix-watch-history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('crowflix-watch-history');
  };

  const getProgress = (contentId: string): number => {
    const item = history.find((h) => h.contentId === contentId);
    return item ? item.progress : 0;
  };

  return {
    history,
    updateHistory,
    removeFromHistory,
    clearHistory,
    getProgress,
  };
};

/**
 * Hook to manage watchlist functionality
 */
export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('crowflix-watchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse watchlist:', e);
      }
    }
  }, []);

  const addToWatchlist = (contentId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(contentId)) return prev;
      const updated = [...prev, contentId];
      localStorage.setItem('crowflix-watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromWatchlist = (contentId: string) => {
    setWatchlist((prev) => {
      const updated = prev.filter((id) => id !== contentId);
      localStorage.setItem('crowflix-watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleWatchlist = (contentId: string) => {
    setWatchlist((prev) => {
      const exists = prev.includes(contentId);
      const updated = exists
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId];
      localStorage.setItem('crowflix-watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  const isInWatchlist = (contentId: string): boolean => {
    return watchlist.includes(contentId);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
  };
};

/**
 * Hook to manage user preferences
 */
export const usePreferences = () => {
  const [preferences, setPreferences] = useState({
    autoPlay: true,
    autoPlayNextEpisode: true,
    downloadQuality: 'HD' as 'SD' | 'HD' | 'UHD',
    subtitlesEnabled: false,
    subtitleLanguage: 'en',
    audioLanguage: 'en',
    showDescriptions: true,
    matureContent: false,
    volume: 80,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('crowflix-preferences');
    if (saved) {
      try {
        setPreferences({ ...preferences, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse preferences:', e);
      }
    }
  }, []);

  const updatePreference = <K extends keyof typeof preferences>(
    key: K,
    value: typeof preferences[K]
  ) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('crowflix-preferences', JSON.stringify(updated));
      return updated;
    });
  };

  const resetPreferences = () => {
    const defaults = {
      autoPlay: true,
      autoPlayNextEpisode: true,
      downloadQuality: 'HD' as const,
      subtitlesEnabled: false,
      subtitleLanguage: 'en',
      audioLanguage: 'en',
      showDescriptions: true,
      matureContent: false,
      volume: 80,
    };
    setPreferences(defaults);
    localStorage.setItem('crowflix-preferences', JSON.stringify(defaults));
  };

  return {
    preferences,
    updatePreference,
    resetPreferences,
  };
};

/**
 * Hook to format time durations
 */
export const useTimeFormat = () => {
  const formatDuration = (seconds: number): string => {
    if (!seconds || seconds <= 0) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (!seconds || seconds <= 0) return 'Ended';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} remaining`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')} remaining`;
  };

  const formatProgress = (current: number, total: number): number => {
    if (!total || total <= 0) return 0;
    return Math.min(100, Math.max(0, (current / total) * 100));
  };

  return {
    formatDuration,
    formatTimeRemaining,
    formatProgress,
  };
};

/**
 * Hook for debounce functionality
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for local storage with type safety
 */
export const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
