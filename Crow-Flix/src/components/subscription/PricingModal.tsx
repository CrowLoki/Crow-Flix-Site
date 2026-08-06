import React, { useState } from 'react';
import { useSubscriptionStore, MembershipTier } from '../store/subscriptionStore';
import './PricingModal.css';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedTier?: MembershipTier;
}

const TIERS = [
  {
    id: 'free' as MembershipTier,
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with Crow-Flix',
    features: [
      'Limited Channel Selection',
      'SD Quality (480p)',
      'Ad-Supported Streaming',
      'Single Stream',
      'Basic EPG Guide',
      'No Cloud DVR',
    ],
    limitations: [
      'No HD/UHD Content',
      'No Multi-View',
      'No Catch-Up TV',
      'Preview Only for Premium Content',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    id: 'basic' as MembershipTier,
    name: 'Basic',
    price: 9.99,
    period: 'month',
    description: 'Essential streaming experience',
    features: [
      'All Free Channels + More',
      'HD Quality (1080p)',
      'Ad-Free Streaming',
      '2 Simultaneous Streams',
      '3-Day Catch-Up TV',
      'Full VOD Library Access',
    ],
    limitations: [
      'No UHD/4K Content',
      'No Multi-View',
      'No Cloud DVR',
    ],
    cta: 'Start Basic',
    highlighted: false,
  },
  {
    id: 'premium' as MembershipTier,
    name: 'Premium',
    price: 15.99,
    period: 'month',
    description: 'The ultimate streaming experience',
    features: [
      'All Channels Unlocked',
      '4K UHD Quality',
      'Ad-Free Streaming',
      '4 Simultaneous Streams',
      '7-Day Catch-Up TV',
      'Cloud DVR (50 Hours)',
      'Multi-View (Up to 4)',
      'Priority Support',
    ],
    limitations: [],
    cta: 'Go Premium',
    highlighted: true,
  },
  {
    id: 'ultimate' as MembershipTier,
    name: 'Ultimate',
    price: 24.99,
    period: 'month',
    description: 'Everything plus exclusive perks',
    features: [
      'Everything in Premium',
      '8K Quality Support',
      '8 Simultaneous Streams',
      '14-Day Catch-Up TV',
      'Cloud DVR (200 Hours)',
      'Family Sharing (6 Profiles)',
      'Early Access to New Features',
      '24/7 Priority Support',
      'Exclusive Content & Events',
    ],
    limitations: [],
    cta: 'Go Ultimate',
    highlighted: false,
  },
];

export const PricingModal: React.FC<PricingModalProps> = ({ 
  isOpen, 
  onClose, 
  suggestedTier 
}) => {
  const { currentTier, upgradeTier, isActive } = useSubscriptionStore();
  const [selectedTier, setSelectedTier] = useState<MembershipTier>(suggestedTier || 'premium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async (tier: MembershipTier) => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    upgradeTier(tier);
    setIsProcessing(false);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2500);
  };

  const handleDowngrade = () => {
    if (window.confirm('Are you sure you want to downgrade? You will lose access to premium features.')) {
      upgradeTier(selectedTier);
      onClose();
    }
  };

  return (
    <div className="pricing-modal-overlay" onClick={onClose}>
      <div className="pricing-modal" onClick={(e) => e.stopPropagation()}>
        {showSuccess ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Welcome to {TIERS.find(t => t.id === selectedTier)?.name}!</h2>
            <p>Your subscription is now active. Enjoy all the premium features.</p>
          </div>
        ) : (
          <>
            <div className="pricing-header">
              <button className="close-btn" onClick={onClose}>&times;</button>
              <h2>Choose Your Plan</h2>
              <p>Unlock the full Crow-Flix experience</p>
              {isActive && currentTier !== 'free' && (
                <p className="current-plan">Current Plan: <strong>{TIERS.find(t => t.id === currentTier)?.name}</strong></p>
              )}
            </div>

            <div className="pricing-grid">
              {TIERS.map((tier) => {
                const isCurrent = currentTier === tier.id;
                const isSelected = selectedTier === tier.id;
                
                return (
                  <div 
                    key={tier.id}
                    className={`pricing-card ${tier.highlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    {tier.highlighted && <div className="popular-badge">Most Popular</div>}
                    {isCurrent && <div className="current-badge">Current Plan</div>}
                    
                    <div className="card-header">
                      <h3>{tier.name}</h3>
                      <div className="price">
                        {tier.price === 0 ? (
                          <span className="amount">Free</span>
                        ) : (
                          <>
                            <span className="currency">$</span>
                            <span className="amount">{tier.price}</span>
                            <span className="period">/{tier.period}</span>
                          </>
                        )}
                      </div>
                      <p className="description">{tier.description}</p>
                    </div>

                    <div className="card-features">
                      <h4>What's Included:</h4>
                      <ul>
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="included">✓ {feature}</li>
                        ))}
                      </ul>
                      
                      {tier.limitations.length > 0 && (
                        <>
                          <h4>Limitations:</h4>
                          <ul>
                            {tier.limitations.map((limitation, idx) => (
                              <li key={idx} className="limited">✕ {limitation}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    <button 
                      className={`upgrade-btn ${tier.highlighted ? 'primary' : 'secondary'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) return;
                        if (tier.id === 'free') {
                          handleDowngrade();
                        } else {
                          handleUpgrade(tier.id);
                        }
                      }}
                      disabled={isCurrent || isProcessing}
                    >
                      {isCurrent 
                        ? 'Current Plan' 
                        : isProcessing 
                          ? 'Processing...' 
                          : tier.id === 'free' 
                            ? 'Downgrade' 
                            : tier.cta
                      }
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pricing-footer">
              <div className="guarantee">
                <span>🔒</span> Secure payment • Cancel anytime • 7-day money-back guarantee
              </div>
              <div className="payment-methods">
                <span>We accept:</span>
                <div className="cards">
                  <div className="card-icon">💳</div>
                  <div className="card-icon">🏦</div>
                  <div className="card-icon">📱</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PricingModal;
