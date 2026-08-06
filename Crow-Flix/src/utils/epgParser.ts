// Export all utility functions
export * from './channelMatcher';

/**
 * Format date for display
 */
export const formatDate = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format time for display
 */
export const formatTime = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format datetime for EPG display
 */
export const formatDateTime = (timestamp: number): string => {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 30 minutes")
 */
export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = timestamp - now;
  const seconds = Math.abs(Math.floor(diff / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diff < 0) {
    // Past
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  } else {
    // Future
    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'Starting soon';
  }
};

/**
 * Parse M3U playlist content
 */
export interface ParsedChannel {
  id: string;
  name: string;
  logo?: string;
  group?: string;
  url: string;
  metadata: Record<string, string>;
}

export const parseM3U = (content: string): ParsedChannel[] => {
  const channels: ParsedChannel[] = [];
  const lines = content.split('\n');
  let currentChannel: Partial<ParsedChannel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      // Parse metadata
      const metadata: Record<string, string> = {};
      
      // Extract key-value pairs
      const matches = line.matchAll(/([a-zA-Z0-9-]+)="([^"]*)"/g);
      for (const match of matches) {
        metadata[match[1]] = match[2];
      }
      
      // Extract channel name (after the last comma)
      const nameMatch = line.match(/,(.+)$/);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
      
      currentChannel = {
        id: metadata['tvg-id'] || `channel-${i}`,
        name,
        logo: metadata['tvg-logo'],
        group: metadata['group-title'],
        metadata,
      };
    } else if (line && !line.startsWith('#') && currentChannel.name) {
      // This is the URL line
      currentChannel.url = line;
      channels.push(currentChannel as ParsedChannel);
      currentChannel = {};
    }
  }

  return channels;
};

/**
 * Parse XMLTV EPG content (simplified parser)
 */
export interface EPGProgramme {
  channelId: string;
  start: number;
  end: number;
  title: string;
  description?: string;
  category?: string;
  icon?: string;
}

export interface EPGChannel {
  id: string;
  displayName: string;
  icon?: string;
}

export const parseXMLTV = (content: string): { channels: EPGChannel[]; programmes: EPGProgramme[] } => {
  const channels: EPGChannel[] = [];
  const programmes: EPGProgramme[] = [];

  // Simple regex-based parsing (for production, use a proper XML parser)
  const channelRegex = /<channel[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/channel>/g;
  const programmeRegex = /<programme[^>]*start="([^"]*)"[^>]*stop="([^"]*)"[^>]*channel="([^"]*)"[^>]*>([\s\S]*?)<\/programme>/g;

  // Parse channels
  let channelMatch;
  while ((channelMatch = channelRegex.exec(content)) !== null) {
    const id = channelMatch[1];
    const channelContent = channelMatch[2];
    
    const displayNameMatch = channelContent.match(/<display-name[^>]*>([^<]*)<\/display-name>/);
    const iconMatch = channelContent.match(/<icon[^>]*src="([^"]*)"/);
    
    channels.push({
      id,
      displayName: displayNameMatch ? displayNameMatch[1] : id,
      icon: iconMatch ? iconMatch[1] : undefined,
    });
  }

  // Parse programmes
  let programmeMatch;
  while ((programmeMatch = programmeRegex.exec(content)) !== null) {
    const startTime = parseXMLTVDate(programmeMatch[1]);
    const endTime = parseXMLTVDate(programmeMatch[2]);
    const channelId = programmeMatch[3];
    const programmeContent = programmeMatch[4];
    
    const titleMatch = programmeContent.match(/<title[^>]*>([^<]*)<\/title>/);
    const descMatch = programmeContent.match(/<desc[^>]*>([^<]*)<\/desc>/);
    const categoryMatch = programmeContent.match(/<category[^>]*>([^<]*)<\/category>/);
    const iconMatch = programmeContent.match(/<icon[^>]*src="([^"]*)"/);
    
    if (startTime && endTime && titleMatch) {
      programmes.push({
        channelId,
        start: startTime,
        end: endTime,
        title: titleMatch[1],
        description: descMatch ? descMatch[1] : undefined,
        category: categoryMatch ? categoryMatch[1] : undefined,
        icon: iconMatch ? iconMatch[1] : undefined,
      });
    }
  }

  return { channels, programmes };
};

/**
 * Parse XMLTV date format (YYYYMMDDHHmmss +timezone)
 */
const parseXMLTVDate = (dateStr: string): number | null => {
  if (!dateStr) return null;
  
  // Format: 20240805143000 +0000
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const hour = dateStr.substring(8, 10);
  const minute = dateStr.substring(10, 12);
  const second = dateStr.substring(12, 14);
  
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  
  if (isNaN(date.getTime())) return null;
  
  return date.getTime();
};

/**
 * Group programmes by channel
 */
export const groupProgrammesByChannel = (
  programmes: EPGProgramme[]
): Map<string, EPGProgramme[]> => {
  const grouped = new Map<string, EPGProgramme[]>();
  
  for (const programme of programmes) {
    const existing = grouped.get(programme.channelId) || [];
    existing.push(programme);
    grouped.set(programme.channelId, existing);
  }
  
  // Sort programmes by start time
  for (const [channelId, progs] of grouped.entries()) {
    progs.sort((a, b) => a.start - b.start);
    grouped.set(channelId, progs);
  }
  
  return grouped;
};

/**
 * Get current programme for a channel
 */
export const getCurrentProgramme = (
  programmes: EPGProgramme[],
  currentTime: number = Date.now()
): EPGProgramme | null => {
  const sorted = [...programmes].sort((a, b) => a.start - b.start);
  
  for (const programme of sorted) {
    if (currentTime >= programme.start && currentTime < programme.end) {
      return programme;
    }
  }
  
  return null;
};

/**
 * Get upcoming programmes for a channel
 */
export const getUpcomingProgrammes = (
  programmes: EPGProgramme[],
  currentTime: number = Date.now(),
  limit: number = 5
): EPGProgramme[] => {
  return programmes
    .filter((p) => p.start >= currentTime)
    .sort((a, b) => a.start - b.start)
    .slice(0, limit);
};

/**
 * Calculate programme progress percentage
 */
export const getProgrammeProgress = (
  programme: EPGProgramme,
  currentTime: number = Date.now()
): number => {
  const total = programme.end - programme.start;
  const elapsed = currentTime - programme.start;
  
  if (total <= 0) return 0;
  if (elapsed <= 0) return 0;
  if (elapsed >= total) return 100;
  
  return Math.round((elapsed / total) * 100);
};
