import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Status() {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const endpoints = [
      { name: 'Main App', url: '/', type: 'page' },
      { name: 'Test Page', url: '/calendar-test', type: 'page' },
      { name: 'Simple API Test', url: '/api/calendar/simple-test', type: 'api' },
      { name: 'Sample ICS', url: '/api/calendar/test-sample', type: 'api' },
      { name: 'ICS Download', url: '/api/calendar/ics?start_date=2025-09-15&end_date=2025-09-30', type: 'api' }
    ];

    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url);
        results[endpoint.name] = {
          status: response.ok ? 'success' : 'error',
          code: response.status,
          message: response.ok ? 'Working' : `HTTP ${response.status}`
        };
      } catch (error) {
        results[endpoint.name] = {
          status: 'error',
          code: 'ERROR',
          message: error.message
        };
      }
    }

    setStatus(results);
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#059669';
      case 'error': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>App Status - Tamil Panchangam</title>
        <meta name="description" content="Status check for Tamil Panchangam calendar sync functionality" />
      </Head>

      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#059669', marginBottom: '10px' }}>
          📊 App Status Check
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Tamil Panchangam Calendar Sync Status
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p>Checking app status...</p>
        </div>
      ) : (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#374151', marginBottom: '15px' }}>System Status</h2>
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px' }}>
            {Object.entries(status).map(([name, result]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  marginBottom: '8px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: `2px solid ${getStatusColor(result.status)}`,
                  borderLeft: `6px solid ${getStatusColor(result.status)}`
                }}
              >
                <span style={{ fontSize: '20px', marginRight: '12px' }}>
                  {getStatusIcon(result.status)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', color: '#374151' }}>
                    {name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {result.message} (Code: {result.code})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h3 style={{ color: '#0369a1', marginBottom: '15px' }}>🎯 Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          <Link
            href="/"
            style={{
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            🏠 Main App
          </Link>
          <Link
            href="/calendar-test"
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
            🧪 Test Page
          </Link>
          <a
            href="/api/calendar/test-sample"
            target="_blank"
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
            📥 Download ICS
          </a>
        </div>
      </div>

      <div style={{ backgroundColor: '#fef3c7', borderRadius: '8px', padding: '20px' }}>
        <h3 style={{ color: '#92400e', marginBottom: '15px' }}>📋 Next Steps</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>✅ Working Features:</strong></p>
          <ul>
            <li>Main Tamil Panchangam app</li>
            <li>Calendar sync API endpoints</li>
            <li>ICS file generation with your sample data</li>
            <li>Test page for validation</li>
          </ul>
          
          <p><strong>🔧 To Enable Full Features:</strong></p>
          <ol>
            <li>Run the database setup script in Supabase</li>
            <li>Set up user authentication (optional)</li>
            <li>Test calendar app integration</li>
          </ol>
          
          <p><strong>📱 Test Calendar Integration:</strong></p>
          <ul>
            <li>Download ICS file and import to your calendar app</li>
            <li>Test with Google Calendar, Apple Calendar, or Outlook</li>
            <li>Verify events show correctly with proper colors</li>
          </ul>
        </div>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#6b7280', fontSize: '14px' }}>
        <p>Tamil Panchangam Calendar Sync - Status Check</p>
        <p>Last updated: {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</p>
      </footer>
    </div>
  );
}
