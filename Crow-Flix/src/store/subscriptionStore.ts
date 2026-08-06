import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MembershipTier = 'free' | 'basic' | 'premium' | 'ultimate';

interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  isKid: boolean;
  pin?: string;
  maxRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
}

interface SubscriptionState {
  // Membership State
  currentTier: MembershipTier;
  isActive: boolean;
  expiresAt: Date | null;
  autoRenew: boolean;
  
  // User Profiles
  profiles: UserProfile[];
  activeProfileId: string | null;
  
  // Features & Entitlements
  hasAds: boolean;
  maxQuality: 'SD' | 'HD' | 'UHD' | '8K';
  canUseMultiView: boolean;
  canUseCloudDvr: boolean;
  dvrStorageHours: number;
  canUseCatchUp: boolean;
  catchUpDays: number;
  simultaneousStreams: number;
  familySharing: boolean;
  
  // Usage Stats
  watchHistory: Array<{
    contentId: string;
    channelId?: string;
    timestamp: number;
    progress: number;
    type: 'live' | 'vod';
  }>;
  watchlist: string[];
  
  // Actions
  upgradeTier: (tier: MembershipTier) => void;
  cancelSubscription: () => void;
  addProfile: (profile: Omit<UserProfile, 'id'>) => void;
  removeProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  addToWatchlist: (id: string) => void;
  removeFromWatchlist: (id: string) => void;
  addToHistory: (item: SubscriptionState['watchHistory'][0]) => void;
  resetDemo: () => void;
}

const TIER_BENEFITS = {
  free: {
    hasAds: true,
    maxQuality: 'SD' as const,
    canUseMultiView: false,
    canUseCloudDvr: false,
    dvrStorageHours: 0,
    canUseCatchUp: false,
    catchUpDays: 0,
    simultaneousStreams: 1,
    familySharing: false,
    previewOnly: true,
  },
  basic: {
    hasAds: false,
    maxQuality: 'HD' as const,
    canUseMultiView: false,
    canUseCloudDvr: false,
    dvrStorageHours: 0,
    canUseCatchUp: true,
    catchUpDays: 3,
    simultaneousStreams: 2,
    familySharing: false,
    previewOnly: false,
  },
  premium: {
    hasAds: false,
    maxQuality: 'UHD' as const,
    canUseMultiView: true,
    canUseCloudDvr: true,
    dvrStorageHours: 50,
    canUseCatchUp: true,
    catchUpDays: 7,
    simultaneousStreams: 4,
    familySharing: false,
    previewOnly: false,
  },
  ultimate: {
    hasAds: false,
    maxQuality: '8K' as const,
    canUseMultiView: true,
    canUseCloudDvr: true,
    dvrStorageHours: 200,
    canUseCatchUp: true,
    catchUpDays: 14,
    simultaneousStreams: 8,
    familySharing: true,
    prioritySupport: true,
    earlyAccess: true,
    previewOnly: false,
  },
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentTier: 'free',
      isActive: false,
      expiresAt: null,
      autoRenew: false,
      
      profiles: [
        {
          id: 'default',
          name: 'Main Profile',
          isKid: false,
          maxRating: 'PG-13',
        },
      ],
      activeProfileId: 'default',
      
      // Feature flags (derived from tier)
      hasAds: true,
      maxQuality: 'SD',
      canUseMultiView: false,
      canUseCloudDvr: false,
      dvrStorageHours: 0,
      canUseCatchUp: false,
      catchUpDays: 0,
      simultaneousStreams: 1,
      familySharing: false,
      
      watchHistory: [],
      watchlist: [],
      
      // Actions
      upgradeTier: (tier) => {
        const benefits = TIER_BENEFITS[tier];
        const now = new Date();
        const expiresAt = new Date(now);
        
        // Set expiration based on tier (mock subscription periods)
        if (tier === 'basic') expiresAt.setMonth(now.getMonth() + 1);
        else if (tier === 'premium') expiresAt.setMonth(now.getMonth() + 1);
        else if (tier === 'ultimate') expiresAt.setMonth(now.getMonth() + 1);
        
        set({
          currentTier: tier,
          isActive: true,
          expiresAt,
          autoRenew: true,
          ...benefits,
        });
      },
      
      cancelSubscription: () => {
        set({
          currentTier: 'free',
          isActive: false,
          autoRenew: false,
          ...TIER_BENEFITS.free,
        });
      },
      
      addProfile: (profile) => {
        const newProfile = {
          ...profile,
          id: `profile-${Date.now()}`,
        };
        set((state) => ({
          profiles: [...state.profiles, newProfile],
        }));
      },
      
      removeProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId: state.activeProfileId === id ? 'default' : state.activeProfileId,
        }));
      },
      
      setActiveProfile: (id) => {
        set({ activeProfileId: id });
      },
      
      addToWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.includes(id) 
            ? state.watchlist 
            : [...state.watchlist, id],
        }));
      },
      
      removeFromWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item !== id),
        }));
      },
      
      addToHistory: (item) => {
        set((state) => ({
          watchHistory: [item, ...state.watchHistory].slice(0, 100),
        }));
      },
      
      resetDemo: () => {
        set({
          currentTier: 'free',
          isActive: false,
          expiresAt: null,
          autoRenew: false,
          hasAds: true,
          maxQuality: 'SD',
          canUseMultiView: false,
          canUseCloudDvr: false,
          dvrStorageHours: 0,
          canUseCatchUp: false,
          catchUpDays: 0,
          simultaneousStreams: 1,
          familySharing: false,
          watchHistory: [],
          watchlist: [],
        });
      },
    }),
    {
      name: 'crowflix-subscription',
      partialize: (state) => ({
        currentTier: state.currentTier,
        isActive: state.isActive,
        expiresAt: state.expiresAt,
        autoRenew: state.autoRenew,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        hasAds: state.hasAds,
        maxQuality: state.maxQuality,
        canUseMultiView: state.canUseMultiView,
        canUseCloudDvr: state.canUseCloudDvr,
        dvrStorageHours: state.dvrStorageHours,
        canUseCatchUp: state.canUseCatchUp,
        catchUpDays: state.catchUpDays,
        simultaneousStreams: state.simultaneousStreams,
        familySharing: state.familySharing,
        watchHistory: state.watchHistory,
        watchlist: state.watchlist,
      }),
    }
  )
);

// Helper to check if user can access content
export const canAccessContent = (isPremium: boolean, isPreview: boolean = false): boolean => {
  const state = useSubscriptionStore.getState();
  
  if (!isPremium) return true; // Free content always accessible
  
  if (state.currentTier === 'free') {
    return isPreview; // Free users can only see previews of premium content
  }
  
  return true; // Paid tiers access all content
};

// Helper to get remaining preview time
export const getPreviewTimeRemaining = (duration: number): number => {
  const FREE_PREVIEW_SECONDS = 300; // 5 minutes
  return Math.min(duration, FREE_PREVIEW_SECONDS);
};
