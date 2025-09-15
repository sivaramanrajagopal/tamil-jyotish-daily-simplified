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
    <div style={{ margin: '20px 0', textAlign: 'center' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 'bold',
          margin: '10px auto',
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          display: 'block',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        📅 Calendar Sync
      </button>

      {isOpen && (
        <div style={{
          background: 'white',
          border: '2px solid #667eea',
          borderRadius: '15px',
          padding: '25px',
          margin: '20px auto',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          color: '#333',
          fontSize: '16px',
          lineHeight: '1.6',
          maxWidth: '600px',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            marginTop: 0, 
            color: '#333', 
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            📅 Tamil Panchangam Calendar Sync
          </h3>
          
          {!subscription ? (
            <div>
              <p style={{ 
                color: '#666', 
                marginBottom: '25px',
                fontSize: '16px',
                textAlign: 'center'
              }}>
                Sync Tamil Panchangam events with your calendar app (Outlook, Apple Calendar, Google Calendar, etc.)
              </p>
              
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ 
                  color: '#333', 
                  marginBottom: '15px',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  Calendar Preferences:
                </h4>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    color: '#333',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_auspicious_times}
                      onChange={(e) => handlePreferenceChange('include_auspicious_times', e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    Include Auspicious Times (Abhijit Muhurta)
                  </label>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    color: '#333',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_inauspicious_times}
                      onChange={(e) => handlePreferenceChange('include_inauspicious_times', e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    Include Inauspicious Times (Rahu Kalam, Yamagandam, Kuligai)
                  </label>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    color: '#333',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_special_days}
                      onChange={(e) => handlePreferenceChange('include_special_days', e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    Include Special Days (Amavasai, Pournami, Ekadashi, etc.)
                  </label>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    color: '#333',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_rs_warnings}
                      onChange={(e) => handlePreferenceChange('include_rs_warnings', e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    Include RS Nakshatra Warnings
                  </label>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    color: '#333',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_chandrashtama}
                      onChange={(e) => handlePreferenceChange('include_chandrashtama', e.target.checked)}
                      style={{ transform: 'scale(1.2)' }}
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
                  padding: '15px 30px',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  width: '100%',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
              >
                {loading ? 'Creating...' : 'Create Calendar Subscription'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{ 
                background: '#e8f5e8', 
                border: '2px solid #4caf50', 
                borderRadius: '10px', 
                padding: '20px', 
                marginBottom: '25px' 
              }}>
                <h4 style={{ color: '#2e7d32', margin: '0 0 15px 0', fontSize: '18px' }}>
                  ✅ Calendar Subscription Active!
                </h4>
                <p style={{ margin: 0, color: '#2e7d32', fontSize: '16px' }}>
                  Your Tamil Panchangam calendar is now synced. Use the links below to add to your calendar app.
                </p>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <h4 style={{ color: '#333', marginBottom: '15px', fontSize: '18px' }}>
                  📱 Add to Calendar App:
                </h4>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                    Webcal URL (for automatic sync):
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={subscription.webcal_url}
                      readOnly
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#333'
                      }}
                    />
                    <button
                      onClick={() => copyToClipboard(subscription.webcal_url)}
                      style={{
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                    ICS Download URL:
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={subscription.ics_url}
                      readOnly
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '2px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#333'
                      }}
                    />
                    <button
                      onClick={() => copyToClipboard(subscription.ics_url)}
                      style={{
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                background: '#f5f5f5', 
                border: '2px solid #ddd', 
                borderRadius: '10px', 
                padding: '20px',
                marginBottom: '25px'
              }}>
                <h4 style={{ color: '#333', margin: '0 0 15px 0', fontSize: '18px' }}>
                  📋 Setup Instructions:
                </h4>
                <ul style={{ margin: 0, paddingLeft: '25px', color: '#666', fontSize: '16px' }}>
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
                  padding: '12px 25px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
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