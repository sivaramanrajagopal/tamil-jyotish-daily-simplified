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
      // This would typically get the user ID from auth context
      const userId = 'temp-user-id'; // Replace with actual user ID
      
      const response = await fetch(`/api/calendar/subscription?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        if (data.subscription.user_calendar_preferences) {
          setPreferences(data.subscription.user_calendar_preferences);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const createSubscription = async () => {
    setLoading(true);
    try {
      const userId = 'temp-user-id'; // Replace with actual user ID
      
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

  const updateSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendar/subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: subscription.subscription_token,
          ...preferences
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.preferences);
        alert('Calendar preferences updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update calendar preferences');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscription = async () => {
    if (!confirm('Are you sure you want to delete your calendar subscription?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/calendar/subscription', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: subscription.subscription_token
        }),
      });

      if (response.ok) {
        setSubscription(null);
        alert('Calendar subscription deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Failed to delete calendar subscription');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('URL copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy URL');
    });
  };

  const downloadICS = () => {
    const params = new URLSearchParams({
      include_auspicious: preferences.include_auspicious_times,
      include_inauspicious: preferences.include_inauspicious_times,
      include_special_days: preferences.include_special_days,
      include_rs_warnings: preferences.include_rs_warnings,
      include_chandrashtama: preferences.include_chandrashtama,
      calendar_name: preferences.calendar_name
    });

    const url = `/api/calendar/ics?${params}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Calendar Sync Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          margin: "10px auto",
          display: "block",
          padding: "8px 15px",
          backgroundColor: "#059669",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <span role="img" aria-hidden="true">
          📅
        </span>{" "}
        Calendar Sync
      </button>

      {/* Modal */}
      {isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}>
              <h2 style={{ margin: 0, color: "#059669" }}>
                📅 Calendar Sync Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {!subscription ? (
              // Create new subscription
              <div>
                <h3>Create Calendar Subscription</h3>
                <p>Sync your Tamil Panchangam with your calendar app to get daily notifications about auspicious times, special days, and important astrological events.</p>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Calendar Name:
                  </label>
                  <input
                    type="text"
                    value={preferences.calendar_name}
                    onChange={(e) => setPreferences({...preferences, calendar_name: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                    Include in Calendar:
                  </label>
                  
                  <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_auspicious_times}
                      onChange={(e) => setPreferences({...preferences, include_auspicious_times: e.target.checked})}
                      style={{ marginRight: "8px" }}
                    />
                    ✅ Auspicious Times (Abhijit Muhurta)
                  </label>

                  <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_inauspicious_times}
                      onChange={(e) => setPreferences({...preferences, include_inauspicious_times: e.target.checked})}
                      style={{ marginRight: "8px" }}
                    />
                    ⚠️ Inauspicious Times (Rahu Kalam, Yamagandam, Kuligai)
                  </label>

                  <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_special_days}
                      onChange={(e) => setPreferences({...preferences, include_special_days: e.target.checked})}
                      style={{ marginRight: "8px" }}
                    />
                    🎉 Special Days (Amavasai, Pournami, Ekadashi, etc.)
                  </label>

                  <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_rs_warnings}
                      onChange={(e) => setPreferences({...preferences, include_rs_warnings: e.target.checked})}
                      style={{ marginRight: "8px" }}
                    />
                    ⚠️ RS Nakshatra Warnings
                  </label>

                  <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={preferences.include_chandrashtama}
                      onChange={(e) => setPreferences({...preferences, include_chandrashtama: e.target.checked})}
                      style={{ marginRight: "8px" }}
                    />
                    🔄 Chandrashtama Warnings
                  </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Date Range (days):
                  </label>
                  <select
                    value={preferences.date_range_days}
                    onChange={(e) => setPreferences({...preferences, date_range_days: parseInt(e.target.value)})}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  >
                    <option value={90}>3 Months (90 days)</option>
                    <option value={180}>6 Months (180 days)</option>
                    <option value={365}>1 Year (365 days)</option>
                    <option value={730}>2 Years (730 days)</option>
                  </select>
                </div>

                <button
                  onClick={createSubscription}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  {loading ? "Creating..." : "Create Calendar Subscription"}
                </button>
              </div>
            ) : (
              // Manage existing subscription
              <div>
                <h3>Manage Calendar Subscription</h3>
                
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f0f9ff", borderRadius: "4px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#0369a1" }}>📱 Mobile Calendar Setup</h4>
                  <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                    Copy this URL and add it to your mobile calendar app:
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={subscription.webcal_url}
                      readOnly
                      style={{
                        flex: 1,
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    />
                    <button
                      onClick={() => copyToClipboard(subscription.webcal_url)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#0369a1",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f0fdf4", borderRadius: "4px" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#059669" }}>💻 Desktop Calendar Setup</h4>
                  <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                    Download ICS file or use webcal URL:
                  </p>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <button
                      onClick={downloadICS}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        backgroundColor: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Download ICS File
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      value={subscription.webcal_url}
                      readOnly
                      style={{
                        flex: 1,
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    />
                    <button
                      onClick={() => copyToClipboard(subscription.webcal_url)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#059669",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <h4>Calendar Preferences</h4>
                  
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                      Calendar Name:
                    </label>
                    <input
                      type="text"
                      value={preferences.calendar_name}
                      onChange={(e) => setPreferences({...preferences, calendar_name: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>
                      Include in Calendar:
                    </label>
                    
                    <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <input
                        type="checkbox"
                        checked={preferences.include_auspicious_times}
                        onChange={(e) => setPreferences({...preferences, include_auspicious_times: e.target.checked})}
                        style={{ marginRight: "8px" }}
                      />
                      ✅ Auspicious Times
                    </label>

                    <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <input
                        type="checkbox"
                        checked={preferences.include_inauspicious_times}
                        onChange={(e) => setPreferences({...preferences, include_inauspicious_times: e.target.checked})}
                        style={{ marginRight: "8px" }}
                      />
                      ⚠️ Inauspicious Times
                    </label>

                    <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <input
                        type="checkbox"
                        checked={preferences.include_special_days}
                        onChange={(e) => setPreferences({...preferences, include_special_days: e.target.checked})}
                        style={{ marginRight: "8px" }}
                      />
                      🎉 Special Days
                    </label>

                    <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <input
                        type="checkbox"
                        checked={preferences.include_rs_warnings}
                        onChange={(e) => setPreferences({...preferences, include_rs_warnings: e.target.checked})}
                        style={{ marginRight: "8px" }}
                      />
                      ⚠️ RS Nakshatra Warnings
                    </label>

                    <label style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <input
                        type="checkbox"
                        checked={preferences.include_chandrashtama}
                        onChange={(e) => setPreferences({...preferences, include_chandrashtama: e.target.checked})}
                        style={{ marginRight: "8px" }}
                      />
                      🔄 Chandrashtama Warnings
                    </label>
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                      Date Range (days):
                    </label>
                    <select
                      value={preferences.date_range_days}
                      onChange={(e) => setPreferences({...preferences, date_range_days: parseInt(e.target.value)})}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                    >
                      <option value={90}>3 Months (90 days)</option>
                      <option value={180}>6 Months (180 days)</option>
                      <option value={365}>1 Year (365 days)</option>
                      <option value={730}>2 Years (730 days)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={updateSubscription}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "#059669",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {loading ? "Updating..." : "Update Preferences"}
                  </button>

                  <button
                    onClick={deleteSubscription}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {loading ? "Deleting..." : "Delete Subscription"}
                  </button>
                </div>
              </div>
            )}

            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fef3c7", borderRadius: "4px" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#92400e" }}>📋 Setup Instructions</h4>
              <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                <p><strong>iOS Calendar:</strong> Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar</p>
                <p><strong>Android Calendar:</strong> Open Calendar app → Settings → Import calendar → From URL</p>
                <p><strong>Google Calendar:</strong> Google Calendar → Settings → Import & Export → From URL</p>
                <p><strong>Outlook:</strong> Calendar → Add calendar → Subscribe from web</p>
                <p><strong>Apple Calendar (Mac):</strong> File → New Calendar Subscription</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
