import React, { useState, useEffect } from 'react';

export default function CalendarSync() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [preferences, setPreferences] = useState({
    calendar_name: 'Tamil Panchangam',
    include_auspicious_times: true,
    include_inauspicious_times: true,
    include_special_days: true,
    include_rs_warnings: true,
    include_chandrashtama: true,
    date_range_days: 365
  });

  useEffect(() => {
    // Check if user has existing subscription
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      // Generate a unique user ID for this session
      const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      const response = await fetch(`/api/calendar/subscription?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const createSubscription = async () => {
    setLoading(true);
    try {
      const userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      const response = await fetch('/api/calendar/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...preferences
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
        alert('Calendar subscription created successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create calendar subscription');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div className="calendar-sync-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="calendar-sync-toggle"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white !important',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          margin: '10px 0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          display: 'block',
          width: '100%',
          maxWidth: '300px',
          margin: '10px auto'
        }}
      >
        📅 Calendar Sync
      </button>

      {isOpen && (
        <div className="calendar-sync-panel" style={{
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          margin: '10px 0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          color: '#333 !important',
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          <h3 style={{ marginTop: 0, color: '#333' }}>📅 Tamil Panchangam Calendar Sync</h3>
          
          {!subscription ? (
            <div>
              <p style={{ color: '#666 !important', marginBottom: '20px', fontSize: '14px' }}>
                Sync Tamil Panchangam events with your calendar app (Outlook, Apple Calendar, Google Calendar, etc.)
              </p>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#333', marginBottom: '10px' }}>Calendar Preferences:</h4>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333 !important', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_auspicious_times}
                      onChange={(e) => handlePreferenceChange('include_auspicious_times', e.target.checked)}
                    />
                    Include Auspicious Times (Abhijit Muhurta)
                  </label>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333 !important', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_inauspicious_times}
                      onChange={(e) => handlePreferenceChange('include_inauspicious_times', e.target.checked)}
                    />
                    Include Inauspicious Times (Rahu Kalam, Yamagandam, Kuligai)
                  </label>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333 !important', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_special_days}
                      onChange={(e) => handlePreferenceChange('include_special_days', e.target.checked)}
                    />
                    Include Special Days (Amavasai, Pournami, Ekadashi, etc.)
                  </label>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333 !important', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_rs_warnings}
                      onChange={(e) => handlePreferenceChange('include_rs_warnings', e.target.checked)}
                    />
                    Include RS Nakshatra Warnings
                  </label>
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#333 !important', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_chandrashtama}
                      onChange={(e) => handlePreferenceChange('include_chandrashtama', e.target.checked)}
                    />
                    Include Chandrashtama Warnings
                  </label>
                </div>
              </div>
              
              <button
                onClick={createSubscription}
                disabled={loading}
                style={{
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              >
                {loading ? 'Creating...' : 'Create Calendar Subscription'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ 
                background: '#e8f5e8', 
                border: '1px solid #4caf50', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '20px' 
              }}>
                <h4 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>✅ Calendar Subscription Active!</h4>
                <p style={{ margin: 0, color: '#2e7d32' }}>
                  Your Tamil Panchangam calendar is now synced. Use the links below to add to your calendar app.
                </p>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#333', marginBottom: '10px' }}>📱 Add to Calendar App:</h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    Webcal URL (for automatic sync):
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={subscription.webcal_url}
                      readOnly
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={() => copyToClipboard(subscription.webcal_url)}
                      style={{
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                    ICS Download URL:
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={subscription.ics_url}
                      readOnly
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={() => copyToClipboard(subscription.ics_url)}
                      style={{
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                background: '#f5f5f5', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                marginBottom: '20px'
              }}>
                <h4 style={{ color: '#333', margin: '0 0 10px 0' }}>📋 Setup Instructions:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
                  <li><strong>iOS Calendar:</strong> Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar</li>
                  <li><strong>Android Calendar:</strong> Open Calendar app → Settings → Import calendar → From URL</li>
                  <li><strong>Google Calendar:</strong> Google Calendar → Settings → Import & Export → From URL</li>
                  <li><strong>Outlook:</strong> Calendar → Add calendar → Subscribe from web</li>
                  <li><strong>Apple Calendar (Mac):</strong> File → New Calendar Subscription</li>
                </ul>
              </div>
              
              <button
                onClick={() => {
                  setSubscription(null);
                  checkExistingSubscription();
                }}
                style={{
                  background: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Create New Subscription
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}