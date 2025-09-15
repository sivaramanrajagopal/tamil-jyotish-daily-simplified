import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

export default function Admin() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load subscriptions
      const { data: subData, error: subError } = await supabase
        .from('calendar_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subError) throw subError;

      // Load preferences
      const { data: prefData, error: prefError } = await supabase
        .from('user_calendar_preferences')
        .select('*')
        .order('created_at', { ascending: false });

      if (prefError) throw prefError;

      setSubscriptions(subData || []);
      setPreferences(prefData || []);

      // Calculate stats
      const totalSubscriptions = subData?.length || 0;
      const activeSubscriptions = subData?.filter(s => s.is_active).length || 0;
      const totalPreferences = prefData?.length || 0;
      const accessedToday = subData?.filter(s => 
        s.last_accessed && new Date(s.last_accessed).toDateString() === new Date().toDateString()
      ).length || 0;

      setStats({
        totalSubscriptions,
        activeSubscriptions,
        totalPreferences,
        accessedToday,
        successRate: totalSubscriptions > 0 ? Math.round((activeSubscriptions / totalSubscriptions) * 100) : 0
      });

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toISOString().substring(0, 19).replace('T', ' ');
  };

  const getStatusColor = (isActive, lastAccessed) => {
    if (!isActive) return '#dc2626'; // Red
    if (!lastAccessed) return '#f59e0b'; // Yellow
    const daysSinceAccess = (new Date() - new Date(lastAccessed)) / (1000 * 60 * 60 * 24);
    if (daysSinceAccess > 7) return '#f59e0b'; // Yellow
    return '#059669'; // Green
  };

  const getStatusText = (isActive, lastAccessed) => {
    if (!isActive) return 'Inactive';
    if (!lastAccessed) return 'Never Accessed';
    const daysSinceAccess = (new Date() - new Date(lastAccessed)) / (1000 * 60 * 60 * 24);
    if (daysSinceAccess < 1) return 'Active (Today)';
    if (daysSinceAccess < 7) return `Active (${Math.round(daysSinceAccess)} days ago)`;
    return `Stale (${Math.round(daysSinceAccess)} days ago)`;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p>Loading subscription data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>Admin Dashboard - Tamil Panchangam</title>
        <meta name="description" content="Admin dashboard for monitoring calendar subscriptions" />
      </Head>

      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#059669', marginBottom: '10px' }}>
          📊 Admin Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Tamil Panchangam Calendar Subscription Monitor
        </p>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0369a1' }}>
            {stats.totalSubscriptions}
          </div>
          <div style={{ color: '#0369a1', fontSize: '14px' }}>Total Subscriptions</div>
        </div>
        
        <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
            {stats.activeSubscriptions}
          </div>
          <div style={{ color: '#059669', fontSize: '14px' }}>Active Subscriptions</div>
        </div>
        
        <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#d97706' }}>
            {stats.accessedToday}
          </div>
          <div style={{ color: '#d97706', fontSize: '14px' }}>Accessed Today</div>
        </div>
        
        <div style={{ backgroundColor: '#f3e8ff', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#7c3aed' }}>
            {stats.successRate}%
          </div>
          <div style={{ color: '#7c3aed', fontSize: '14px' }}>Success Rate</div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#374151', marginBottom: '15px' }}>📋 Recent Subscriptions</h2>
        
        {subscriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            No subscriptions found. Make sure the database is set up correctly.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>Token</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>Created</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>Last Accessed</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #d1d5db' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.slice(0, 10).map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                      {sub.subscription_token.substring(0, 20)}...
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        color: getStatusColor(sub.is_active, sub.last_accessed),
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(sub.is_active, sub.last_accessed)}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {formatDate(sub.created_at)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {formatDate(sub.last_accessed)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => {
                          const webcalUrl = `http://localhost:3000/api/calendar/webcal?token=${sub.subscription_token}`;
                          navigator.clipboard.writeText(webcalUrl);
                          alert('Webcal URL copied to clipboard!');
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Copy URL
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Preferences */}
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h2 style={{ color: '#374151', marginBottom: '15px' }}>⚙️ User Preferences</h2>
        
        {preferences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
            No user preferences found.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
            {preferences.slice(0, 6).map((pref) => (
              <div key={pref.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                  {pref.calendar_name}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Created: {formatDate(pref.created_at)}
                </div>
                <div style={{ fontSize: '12px' }}>
                  <div>✅ Auspicious: {pref.include_auspicious_times ? 'Yes' : 'No'}</div>
                  <div>⚠️ Inauspicious: {pref.include_inauspicious_times ? 'Yes' : 'No'}</div>
                  <div>🌟 Special Days: {pref.include_special_days ? 'Yes' : 'No'}</div>
                  <div>📅 Range: {pref.date_range_days} days</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '20px' }}>
        <h3 style={{ color: '#0369a1', marginBottom: '15px' }}>🔧 Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <button
            onClick={loadData}
            style={{
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh Data
          </button>
          <Link
            href="/status"
            style={{
              padding: '12px',
              backgroundColor: '#059669',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            📊 App Status
          </Link>
          <Link
            href="/calendar-test"
            style={{
              padding: '12px',
              backgroundColor: '#dc2626',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            🧪 Test Calendar
          </Link>
        </div>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#6b7280', fontSize: '14px' }}>
        <p>Admin Dashboard - Last updated: {new Date().toISOString().substring(0, 19)} UTC</p>
      </footer>
    </div>
  );
}
