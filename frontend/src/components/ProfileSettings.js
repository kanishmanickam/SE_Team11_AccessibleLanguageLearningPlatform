import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import './ProfileSettings.css';

const ProfileSettings = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { preferences, updateAccessibilitySettings } = usePreferences();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    fontSize: preferences?.fontSize || 'medium',
    contrastTheme: preferences?.contrastTheme || 'default',
    learningPace: preferences?.learningPace || 'normal',
    fontFamily: preferences?.fontFamily || 'default',
    letterSpacing: preferences?.letterSpacing || 'normal',
    distractionFreeMode: user?.learningCondition === 'autism' ? (preferences?.distractionFreeMode || false) : false,
  });

  // Sync local state with preferences when they change
  useEffect(() => {
    if (preferences) {
      setAccessibilitySettings({
        fontSize: preferences.fontSize || 'medium',
        contrastTheme: preferences.contrastTheme || 'default',
        learningPace: preferences.learningPace || 'normal',
        fontFamily: preferences.fontFamily || 'default',
        letterSpacing: preferences.letterSpacing || 'normal',
        distractionFreeMode: user?.learningCondition === 'autism' ? (preferences.distractionFreeMode || false) : false,
      });
    }
  }, [preferences, user?.learningCondition]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleAccessibilityChange = (name, value) => {
    setAccessibilitySettings({ ...accessibilitySettings, [name]: value });
  };

  const saveAccessibilitySettings = async () => {
    const result = await updateAccessibilitySettings(accessibilitySettings);
    if (result.success) {
      alert('✓ Accessibility settings updated!');
    } else {
      alert('Error updating settings: ' + result.error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="profile-settings-modal">
      <div className="settings-overlay" onClick={onClose}></div>
      <div className="settings-card">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'accessibility' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessibility')}
          >
            ⚙️ Accessibility
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="settings-content">
            <h3>Profile Information</h3>
            {!profileEditing ? (
              <div className="profile-info">
                <div className="info-item">
                  <label>Name</label>
                  <p>{user?.name}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="info-item">
                  <label>Learning Condition</label>
                  <p>{user?.learningCondition?.charAt(0).toUpperCase() + user?.learningCondition?.slice(1)}</p>
                </div>
                {user?.age && (
                  <div className="info-item">
                    <label>Age</label>
                    <p>{user?.age}</p>
                  </div>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setProfileEditing(true)}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    type="number"
                    id="age"
                    name="age"
                    value={profileData.age}
                    onChange={handleProfileChange}
                    min="3"
                    max="100"
                  />
                </div>
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setProfileEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      alert('Profile update functionality coming soon!');
                      setProfileEditing(false);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'accessibility' && (
          <div className="settings-content">
            <h3>Accessibility Preferences</h3>
            <div className="setting-group">
              <label>Text Size</label>
              <div className="button-group">
                {['small', 'medium', 'large', 'extra-large'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`option-btn ${accessibilitySettings.fontSize === size ? 'active' : ''}`}
                    onClick={() => handleAccessibilityChange('fontSize', size)}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-group">
              <label>Color Theme</label>
              <div className="button-group">
                {[
                  { value: 'default', label: 'Default' },
                  { value: 'high-contrast', label: 'High Contrast' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'yellow-black', label: 'Yellow on Black' },
                ].map((theme) => (
                  <button
                    key={theme.value}
                    type="button"
                    className={`option-btn ${accessibilitySettings.contrastTheme === theme.value ? 'active' : ''}`}
                    onClick={() => handleAccessibilityChange('contrastTheme', theme.value)}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            {user?.learningCondition !== 'dyslexia' && (
              <div className="setting-group">
                <label>Learning Pace</label>
                <div className="button-group">
                  {['slow', 'normal', 'fast'].map((pace) => (
                    <button
                      key={pace}
                      type="button"
                      className={`option-btn ${accessibilitySettings.learningPace === pace ? 'active' : ''}`}
                      onClick={() => handleAccessibilityChange('learningPace', pace)}
                    >
                      {pace.charAt(0).toUpperCase() + pace.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {user?.learningCondition === 'dyslexia' && (
              <>
                <div className="setting-group">
                  <label>Font Style</label>
                  <div className="button-group">
                    {[
                      { value: 'opendyslexic', label: 'OpenDyslexic' },
                      { value: 'arial', label: 'Arial' },
                      { value: 'comic-sans', label: 'Comic Sans' },
                    ].map((font) => (
                      <button
                        key={font.value}
                        type="button"
                        className={`option-btn ${accessibilitySettings.fontFamily === font.value ? 'active' : ''}`}
                        onClick={() => handleAccessibilityChange('fontFamily', font.value)}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-group">
                  <label>Letter Spacing</label>
                  <div className="button-group">
                    {['normal', 'wide', 'extra-wide'].map((spacing) => (
                      <button
                        key={spacing}
                        type="button"
                        className={`option-btn ${accessibilitySettings.letterSpacing === spacing ? 'active' : ''}`}
                        onClick={() => handleAccessibilityChange('letterSpacing', spacing)}
                      >
                        {spacing.charAt(0).toUpperCase() + spacing.slice(1).replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {user?.learningCondition === 'autism' && (
              <div className="setting-group">
                <label>Distraction-Free Mode</label>
                <button
                  type="button"
                  className={`toggle-btn ${accessibilitySettings.distractionFreeMode ? 'active' : ''}`}
                  onClick={() =>
                    handleAccessibilityChange(
                      'distractionFreeMode',
                      !accessibilitySettings.distractionFreeMode
                    )
                  }
                >
                  <span className="toggle-icon">
                    {accessibilitySettings.distractionFreeMode ? '✓ ON' : '✕ OFF'}
                  </span>
                  <span className="toggle-label">
                    {accessibilitySettings.distractionFreeMode
                      ? 'Minimal distractions enabled'
                      : 'Normal mode'}
                  </span>
                </button>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveAccessibilitySettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        <div className="settings-footer">
          <button
            className="btn btn-danger"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
