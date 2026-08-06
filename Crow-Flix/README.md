# Crow-Flix - Next Generation IPTV Streaming Platform

A modern, feature-rich IPTV streaming application built with React, TypeScript, and Rust (Tauri).

## 🚀 Features

### Core Streaming
- **Live TV** - Stream hundreds of channels worldwide
- **EPG Guide** - Real-time electronic program guide with 30-minute refresh
- **Channel Matching** - Advanced fuzzy matching for M3U/XMLTV alignment (95%+ accuracy)
- **Multi-View** - Watch up to 4 channels simultaneously (Premium+)
- **Cinema Mode** - Immersive ambient lighting experience

### Subscription System
- **4-Tier Membership**: Free, Basic ($9.99), Premium ($15.99), Ultimate ($24.99)
- **Content Gating** - Preview system for free users (5-minute samples)
- **Profile Management** - Up to 6 profiles with PIN protection (Ultimate)
- **Family Sharing** - Multiple simultaneous streams based on tier
- **Ad-Supported Free Tier** - Monetization for non-paying users

### Premium Features
- **Cloud DVR** - Record up to 200 hours (Ultimate tier)
- **Catch-Up TV** - Rewind live TV up to 14 days (Ultimate)
- **Series Recording** - Auto-record entire seasons
- **8K Support** - Highest quality streaming (Ultimate)
- **Priority Support** - 24/7 dedicated support (Ultimate)

### User Experience
- **Voice Control** - Natural language navigation
- **Watch History** - Continue watching across devices
- **Watchlist** - Save favorite shows and channels
- **Parental Controls** - Content rating filters per profile
- **Offline Mode** - Cached content when disconnected

### Technical Excellence
- **Rust Backend** - High-performance native processing
- **React Frontend** - Smooth, responsive UI
- **Virtual Scrolling** - Handle infinite channel lists
- **Delta Caching** - Instant guide loads
- **Smart Quality** - Adaptive bitrate based on connection

## 📁 Project Structure

```
Crow-Flix/
├── src/
│   ├── components/
│   │   └── subscription/
│   │       ├── PricingModal.tsx    # Tier selection & upgrade UI
│   │       ├── PricingModal.css
│   │       ├── ContentGate.tsx     # Premium content locking
│   │       ├── ContentGate.css
│   │       ├── ProfileManager.tsx  # Multi-profile management
│   │       └── ProfileManager.css
│   ├── hooks/
│   │   └── useFeatures.ts          # Custom React hooks
│   ├── store/
│   │   ├── index.ts                # Store exports
│   │   └── subscriptionStore.ts    # Zustand state management
│   └── utils/
│       ├── channelMatcher.ts       # M3U/XMLTV matching algorithms
│       ├── epgParser.ts            # EPG parsing utilities
│       └── helpers.ts              # General utility functions
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- Rust (for Tauri backend)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/CrowLoki/Crow-Flix.git
cd Crow-Flix

# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Tauri development (desktop app)
npm run tauri dev

# Tauri production build
npm run tauri build
```

## 💳 Subscription Tiers

| Feature | Free | Basic | Premium | Ultimate |
|---------|------|-------|---------|----------|
| Price | $0 | $9.99/mo | $15.99/mo | $24.99/mo |
| Quality | SD (480p) | HD (1080p) | 4K UHD | 8K |
| Ads | Yes | No | No | No |
| Streams | 1 | 2 | 4 | 8 |
| Cloud DVR | ❌ | ❌ | 50 hrs | 200 hrs |
| Catch-Up TV | ❌ | 3 days | 7 days | 14 days |
| Multi-View | ❌ | ❌ | ✓ (4x) | ✓ (4x) |
| Profiles | 1 | 2 | 4 | 6 |
| Family Sharing | ❌ | ❌ | ❌ | ✓ |
| Priority Support | ❌ | ❌ | ✓ | ✓ (24/7) |
| Early Access | ❌ | ❌ | ❌ | ✓ |

## 🔧 Configuration

### Playlist Setup
Add your M3U playlist URL in settings:
```
Settings → Playlist → Add M3U URL
```

### EPG Configuration
Configure XMLTV guide source:
```
Settings → EPG → Add XMLTV URL
```

### Channel Matching
The app automatically matches channels using:
1. Direct ID match
2. Normalized comparison
3. Compact matching
4. Base name extraction
5. Partial string matching
6. Levenshtein similarity

## 🎯 Usage Examples

### Subscribe to Premium
```typescript
import { useSubscriptionStore } from './store';

const { upgradeTier } = useSubscriptionStore();
upgradeTier('premium');
```

### Check Feature Access
```typescript
import { canAccessContent } from './store';

const canWatch = canAccessContent(true); // true if user has premium access
```

### Manage Profiles
```typescript
import { useSubscriptionStore } from './store';

const { addProfile, setActiveProfile } = useSubscriptionStore();

addProfile({
  name: 'Kids',
  isKid: true,
  maxRating: 'G'
});
```

### Use Watch History
```typescript
import { useContinueWatching } from './hooks/useFeatures';

const { history, updateHistory } = useContinueWatching();

updateHistory({
  contentId: 'movie-123',
  title: 'Example Movie',
  progress: 45,
  duration: 120,
  type: 'vod'
});
```

## 🌟 Key Technologies

- **Frontend**: React 18, TypeScript, Zustand
- **Backend**: Rust, Tauri
- **Styling**: CSS3, Animations
- **State**: Persistent localStorage
- **Parsing**: Custom M3U/XMLTV parsers
- **Matching**: Fuzzy string algorithms

## 📝 API Reference

### Subscription Store
- `currentTier` - Current membership level
- `isActive` - Subscription active status
- `profiles` - User profiles array
- `hasAds` - Ad-supported flag
- `maxQuality` - Maximum streaming quality
- `canUseMultiView` - Multi-view access
- `canUseCloudDvr` - DVR access
- `simultaneousStreams` - Allowed concurrent streams

### Actions
- `upgradeTier(tier)` - Upgrade subscription
- `cancelSubscription()` - Downgrade to free
- `addProfile(profile)` - Create new profile
- `removeProfile(id)` - Delete profile
- `setActiveProfile(id)` - Switch profile
- `addToWatchlist(id)` - Add to watchlist
- `addToHistory(item)` - Update watch history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- IPTV-org for open channel lists
- EPG providers for guide data
- Community contributors and testers

## 📞 Support

- **Documentation**: [Wiki](https://github.com/CrowLoki/Crow-Flix/wiki)
- **Issues**: [GitHub Issues](https://github.com/CrowLoki/Crow-Flix/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CrowLoki/Crow-Flix/discussions)

---

Built with ❤️ by the Crow-Flix Team
