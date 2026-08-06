import React, { useState } from 'react';
import { useSubscriptionStore, UserProfile } from '../store/subscriptionStore';
import './ProfileManager.css';

interface ProfileManagerProps {
  onClose?: () => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ onClose }) => {
  const { profiles, activeProfileId, addProfile, removeProfile, setActiveProfile } = useSubscriptionStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [isKid, setIsKid] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedProfileForPin, setSelectedProfileForPin] = useState<string | null>(null);

  const AVATARS = ['👤', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧞', '🧟', '🤖', '👽', '👾', '🎃', '🐱', '🐶', '🦊'];

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    
    addProfile({
      name: newProfileName.trim(),
      isKid,
      maxRating: isKid ? 'G' : 'PG-13',
    });
    
    setNewProfileName('');
    setIsKid(false);
    setIsAdding(false);
  };

  const handleRequestPin = (profileId: string) => {
    setSelectedProfileForPin(profileId);
    setShowPinModal(true);
  };

  const handlePinSubmit = () => {
    // In a real app, validate PIN here
    if (selectedProfileForPin) {
      setActiveProfile(selectedProfileForPin);
      setShowPinModal(false);
      setPinInput('');
      setSelectedProfileForPin(null);
      onClose?.();
    }
  };

  const canAddMoreProfiles = profiles.length < 6;

  return (
    <div className="profile-manager-overlay" onClick={() => onClose?.()}>
      <div className="profile-manager" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2>Who's Watching?</h2>
          <button className="close-btn" onClick={() => onClose?.()}>&times;</button>
        </div>

        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`profile-card ${activeProfileId === profile.id ? 'active' : ''}`}
              onClick={() => {
                if (profile.pin) {
                  handleRequestPin(profile.id);
                } else {
                  setActiveProfile(profile.id);
                  onClose?.();
                }
              }}
            >
              <div className="profile-avatar">
                {profile.avatar || '👤'}
                {profile.isKid && <span className="kid-badge">👶</span>}
              </div>
              <div className="profile-name">{profile.name}</div>
              {activeProfileId === profile.id && (
                <div className="active-indicator">✓</div>
              )}
              {profiles.length > 1 && profile.id !== 'default' && (
                <button
                  className="delete-profile-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Delete ${profile.name}'s profile?`)) {
                      removeProfile(profile.id);
                    }
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}

          {canAddMoreProfiles && (
            <div className="profile-card add-profile" onClick={() => setIsAdding(true)}>
              <div className="profile-avatar">+</div>
              <div className="profile-name">Add Profile</div>
            </div>
          )}
        </div>

        {isAdding && (
          <div className="add-profile-form">
            <h3>Create New Profile</h3>
            <input
              type="text"
              placeholder="Profile Name"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              maxLength={20}
              autoFocus
            />
            
            <div className="avatar-selector">
              <p>Choose Avatar:</p>
              <div className="avatars">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    className="avatar-option"
                    onClick={() => {}}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <label className="kid-toggle">
              <input
                type="checkbox"
                checked={isKid}
                onChange={(e) => setIsKid(e.target.checked)}
              />
              <span>Kid Profile?</span>
            </label>

            <div className="form-actions">
              <button className="cancel-btn" onClick={() => setIsAdding(false)}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleAddProfile}>
                Save
              </button>
            </div>
          </div>
        )}

        <div className="profile-footer">
          <p>Manage profiles to personalize recommendations and watch history.</p>
          <p className="max-profiles">
            Maximum {currentTier === 'ultimate' ? '6' : '4'} profiles per account
          </p>
        </div>
      </div>

      {showPinModal && (
        <div className="pin-modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Enter PIN</h3>
            <p>Profile protected</p>
            <input
              type="password"
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              maxLength={4}
              autoFocus
              className="pin-input"
            />
            <div className="pin-actions">
              <button onClick={() => setShowPinModal(false)}>Cancel</button>
              <button onClick={handlePinSubmit}>Enter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Profile Switcher Component for Header
export const ProfileSwitcher: React.FC = () => {
  const { profiles, activeProfileId } = useSubscriptionStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return (
    <div className="profile-switcher">
      <button className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="profile-avatar-small">
          {activeProfile?.avatar || '👤'}
        </span>
        <span className="profile-name-small">{activeProfile?.name}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              className={`dropdown-item ${activeProfileId === profile.id ? 'active' : ''}`}
              onClick={() => {
                if (profile.pin) {
                  // Handle PIN entry
                } else {
                  // setActiveProfile(profile.id);
                  setIsOpen(false);
                }
              }}
            >
              <span>{profile.avatar || '👤'}</span>
              <span>{profile.name}</span>
              {activeProfileId === profile.id && <span className="check">✓</span>}
            </button>
          ))}
          <div className="dropdown-divider"></div>
          <button className="dropdown-item manage" onClick={() => {}}>
            Manage Profiles
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileManager;
