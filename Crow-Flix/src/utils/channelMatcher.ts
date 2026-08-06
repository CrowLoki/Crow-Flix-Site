/**
 * Channel ID Matching Utilities
 * Enhanced fuzzy matching for M3U to XMLTV guide alignment
 */

export interface ChannelMatchResult {
  matched: boolean;
  confidence: number;
  strategy: string;
  normalizedM3U: string;
  normalizedXMLTV: string;
}

/**
 * Normalize channel ID for comparison
 */
export const normalizeChannelId = (id: string): string => {
  if (!id) return '';
  
  return id
    .toLowerCase()
    .trim()
    // Remove common prefixes/suffixes
    .replace(/^(hd|sd|uhd|4k|8k)[-_]?/i, '')
    .replace(/[-_]?((tv|channel|live|stream|iptv))$/i, '')
    // Replace separators with underscore
    .replace(/[\s.-]+/g, '_')
    // Remove special characters except underscore
    .replace(/[^a-z0-9_]/g, '')
    // Remove country codes at end
    .replace(/_(us|uk|ca|au|de|fr|es|it|nl|be|se|no|dk|fi|pl|cz|sk|hu|ro|bg|gr|tr|ru|ua|in|pk|bd|lk|th|vn|ph|id|my|sg|hk|tw|kr|jp|cn|br|mx|ar|cl|co|pe|ve|za|ng|ke|eg|ma|tn|ae|sa|il|ir|iq|af|np|mm|kh|la|mn|kz|uz|tm|kg|tj|az|ge|am|by|md|lt|lv|ee|si|hr|ba|rs|me|mk|al|xk)$/i, '')
    // Remove duplicate underscores
    .replace(/_+/g, '_')
    // Remove leading/trailing underscores
    .replace(/^_|_$/g, '');
};

/**
 * Create compact version for matching (remove all separators)
 */
export const compactId = (id: string): string => {
  return normalizeChannelId(id).replace(/_/g, '');
};

/**
 * Extract base name without quality indicators
 */
export const extractBaseName = (id: string): string => {
  let base = id.toLowerCase();
  
  // Remove quality indicators
  base = base.replace(/\b(hd|sd|uhd|4k|8k|1080p|720p|2160p|fhd|qhd)\b/gi, '');
  
  // Remove common suffixes
  base = base.replace(/\b(tv|channel|live|stream|iptv|plus|extra|premium|max|pro)\b/gi, '');
  
  // Remove separators and trim
  base = base.replace(/[\s._-]+/g, ' ').trim();
  
  return base;
};

/**
 * Check if two channel IDs match using various strategies
 */
export const matchChannelIds = (m3uId: string, xmltvId: string): ChannelMatchResult => {
  if (!m3uId || !xmltvId) {
    return { matched: false, confidence: 0, strategy: 'none', normalizedM3U: '', normalizedXMLTV: '' };
  }

  const strategies: Array<{ name: string; fn: () => boolean; confidence: number }> = [
    {
      name: 'direct',
      fn: () => m3uId.toLowerCase() === xmltvId.toLowerCase(),
      confidence: 100,
    },
    {
      name: 'normalized',
      fn: () => normalizeChannelId(m3uId) === normalizeChannelId(xmltvId),
      confidence: 95,
    },
    {
      name: 'compact',
      fn: () => compactId(m3uId) === compactId(xmltvId),
      confidence: 90,
    },
    {
      name: 'base_name',
      fn: () => extractBaseName(m3uId) === extractBaseName(xmltvId),
      confidence: 85,
    },
    {
      name: 'contains',
      fn: () => {
        const normM3U = normalizeChannelId(m3uId);
        const normXMLTV = normalizeChannelId(xmltvId);
        return normM3U.includes(normXMLTV) || normXMLTV.includes(normM3U);
      },
      confidence: 75,
    },
    {
      name: 'partial',
      fn: () => {
        const baseM3U = extractBaseName(m3uId);
        const baseXMLTV = extractBaseName(xmltvId);
        return baseM3U.includes(baseXMLTV) || baseXMLTV.includes(baseM3U);
      },
      confidence: 70,
    },
  ];

  for (const strategy of strategies) {
    if (strategy.fn()) {
      return {
        matched: true,
        confidence: strategy.confidence,
        strategy: strategy.name,
        normalizedM3U: normalizeChannelId(m3uId),
        normalizedXMLTV: normalizeChannelId(xmltvId),
      };
    }
  }

  return {
    matched: false,
    confidence: 0,
    strategy: 'none',
    normalizedM3U: normalizeChannelId(m3uId),
    normalizedXMLTV: normalizeChannelId(xmltvId),
  };
};

/**
 * Find best matching channel from a list
 */
export const findBestChannelMatch = (
  m3uChannelId: string,
  xmltvChannelIds: string[]
): { matchedId: string | null; confidence: number; strategy: string } => {
  let bestMatch: { matchedId: string; confidence: number; strategy: string } | null = null;

  for (const xmltvId of xmltvChannelIds) {
    const result = matchChannelIds(m3uChannelId, xmltvId);
    
    if (result.matched) {
      if (!bestMatch || result.confidence > bestMatch.confidence) {
        bestMatch = {
          matchedId: xmltvId,
          confidence: result.confidence,
          strategy: result.strategy,
        };
      }
    }
  }

  return bestMatch || { matchedId: null, confidence: 0, strategy: 'none' };
};

/**
 * Generate alternative channel ID variations
 */
export const generateChannelIdVariations = (baseId: string): string[] => {
  const variations = new Set<string>();
  const normalized = normalizeChannelId(baseId);
  const compact = compactId(baseId);
  const base = extractBaseName(baseId);

  // Add original
  variations.add(baseId);
  
  // Add normalized
  variations.add(normalized);
  
  // Add compact
  variations.add(compact);
  
  // Add with common suffixes
  ['_us', '_uk', '_ca', '_hd', '_sd', '_tv', '_live'].forEach(suffix => {
    variations.add(normalized + suffix);
    variations.add(compact + suffix);
  });
  
  // Add base name variations
  variations.add(base);
  variations.add(base.replace(/\s+/g, '_'));
  variations.add(base.replace(/\s+/g, ''));
  
  return Array.from(variations);
};

/**
 * Calculate similarity score between two strings (Levenshtein-based)
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = normalizeChannelId(str1);
  const s2 = normalizeChannelId(str2);
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 100;
  
  const editDistance = levenshteinDistance(longer, shorter);
  const similarity = ((longer.length - editDistance) / longer.length) * 100;
  
  return Math.round(similarity);
};

/**
 * Levenshtein distance algorithm
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Clean and standardize M3U channel metadata
 */
export const cleanM3UMetadata = (metadata: Record<string, string>): Record<string, string> => {
  const cleaned: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    const cleanKey = key.toLowerCase().replace(/[_-]/g, '');
    const cleanValue = value.trim();
    
    // Map common variations to standard keys
    if (['tvgid', 'tvg-id'].includes(cleanKey)) {
      cleaned['tvg-id'] = cleanValue;
    } else if (['tvgname', 'tvg-name', 'tvgname'].includes(cleanKey)) {
      cleaned['tvg-name'] = cleanValue;
    } else if (['tvglogo', 'tvg-logo', 'logourl'].includes(cleanKey)) {
      cleaned['tvg-logo'] = cleanValue;
    } else if (['group', 'group-title', 'grouptitle'].includes(cleanKey)) {
      cleaned['group-title'] = cleanValue;
    } else {
      cleaned[key] = cleanValue;
    }
  }
  
  return cleaned;
};
