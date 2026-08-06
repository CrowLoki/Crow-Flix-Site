import React from 'react';
import { useSubscriptionStore } from '../store/subscriptionStore';
import './ContentGate.css';

interface ContentGateProps {
  isPremium: boolean;
  children: React.ReactNode;
  contentTitle?: string;
  onUpgrade?: () => void;
}

export const ContentGate: React.FC<ContentGateProps> = ({
  isPremium,
  children,
  contentTitle = 'Premium Content',
  onUpgrade,
}) => {
  const { currentTier, isActive } = useSubscriptionStore();

  // User has access (free content or paid tier)
  if (!isPremium || (isActive && currentTier !== 'free')) {
    return <>{children}</>;
  }

  // Free user trying to access premium content - show preview gate
  return (
    <div className="content-gate">
      <div className="gate-overlay">
        <div className="gate-content">
          <div className="lock-icon">🔒</div>
          <h3>Premium Content</h3>
          <p className="content-title">{contentTitle}</p>
          
          <div className="preview-notice">
            <div className="play-preview-btn">
              <span className="play-icon">▶</span>
              Watch 5-Minute Preview
            </div>
          </div>
          
          <div className="upgrade-prompt">
            <p>Unlock full access to this content and much more!</p>
            
            <div className="tier-benefits-preview">
              <div className="benefit-item">
                <span className="check">✓</span>
                <span>Ad-free streaming</span>
              </div>
              <div className="benefit-item">
                <span className="check">✓</span>
                <span>HD & 4K quality</span>
              </div>
              <div className="benefit-item">
                <span className="check">✓</span>
                <span>Full library access</span>
              </div>
              <div className="benefit-item">
                <span className="check">✓</span>
                <span>Catch-up TV & Cloud DVR</span>
              </div>
            </div>
            
            <button 
              className="upgrade-now-btn"
              onClick={onUpgrade}
            >
              Upgrade Now - From $9.99/mo
            </button>
            
            <p className="free-trial-text">
              Cancel anytime • 7-day money-back guarantee
            </p>
          </div>
        </div>
      </div>
      {/* Blurred background preview */}
      <div className="blurred-preview">
        {children}
      </div>
    </div>
  );
};

// Hook for checking preview mode
export const usePreviewMode = (duration: number) => {
  const [isPreview, setIsPreview] = React.useState(true);
  const [previewTimeLeft, setPreviewTimeLeft] = React.useState(300); // 5 minutes
  
  React.useEffect(() => {
    if (!isPreview) return;
    
    const interval = setInterval(() => {
      setPreviewTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPreview(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPreview]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return {
    isPreview,
    previewTimeLeft,
    formattedTime: formatTime(previewTimeLeft),
    endPreview: () => setIsPreview(false),
  };
};

// Ad placeholder component for free tier
export const AdPlaceholder: React.FC<{ position?: 'pre' | 'mid' | 'post' }> = ({ 
  position = 'mid' 
}) => {
  const { currentTier, hasAds } = useSubscriptionStore();
  
  if (currentTier !== 'free' || !hasAds) return null;
  
  return (
    <div className="ad-placeholder">
      <div className="ad-label">Advertisement</div>
      <div className="ad-content">
        <p>Your ad would appear here</p>
        <small>Upgrade to remove ads</small>
      </div>
    </div>
  );
};

export default ContentGate;
