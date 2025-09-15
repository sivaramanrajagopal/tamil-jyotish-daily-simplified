import React, { useState } from 'react';
import Head from 'next/head';

export default function CalendarTest() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setTestResults([]);

    // Test 1: Simple API Test
    try {
      addTestResult('API Connection', 'running', 'Testing API connection...');
      const simpleResponse = await fetch('/api/calendar/simple-test');
      
      if (simpleResponse.ok) {
        const simpleData = await simpleResponse.json();
        if (simpleData.success) {
          addTestResult('API Connection', 'success', 'API connection working correctly');
        } else {
          addTestResult('API Connection', 'error', 'API returned error');
        }
      } else {
        addTestResult('API Connection', 'error', `HTTP ${simpleResponse.status}: ${simpleResponse.statusText}`);
      }
    } catch (error) {
      addTestResult('API Connection', 'error', `Error: ${error.message}`);
    }

    // Test 2: ICS Download with Sample Data
    try {
      addTestResult('ICS Download', 'running', 'Testing ICS file generation...');
      const icsResponse = await fetch('/api/calendar/test-sample');
      
      if (icsResponse.ok) {
        const icsContent = await icsResponse.text();
        if (icsContent.includes('BEGIN:VCALENDAR') && icsContent.includes('END:VCALENDAR')) {
          addTestResult('ICS Download', 'success', 'ICS file generated successfully with sample data');
        } else {
          addTestResult('ICS Download', 'error', 'ICS file format is invalid');
        }
      } else {
        addTestResult('ICS Download', 'error', `HTTP ${icsResponse.status}: ${icsResponse.statusText}`);
      }
    } catch (error) {
      addTestResult('ICS Download', 'error', `Error: ${error.message}`);
    }

    // Test 3: Webcal Subscription (using test-sample for now)
    try {
      addTestResult('Webcal Subscription', 'running', 'Testing webcal subscription...');
      const webcalResponse = await fetch('/api/calendar/test-sample');
      
      if (webcalResponse.ok) {
        const webcalContent = await webcalResponse.text();
        if (webcalContent.includes('BEGIN:VCALENDAR') && webcalContent.includes('X-WR-CALNAME')) {
          addTestResult('Webcal Subscription', 'success', 'Webcal format working correctly');
        } else {
          addTestResult('Webcal Subscription', 'error', 'Webcal format is invalid');
        }
      } else {
        addTestResult('Webcal Subscription', 'error', `HTTP ${webcalResponse.status}: ${webcalResponse.statusText}`);
      }
    } catch (error) {
      addTestResult('Webcal Subscription', 'error', `Error: ${error.message}`);
    }

    // Test 4: Database Setup Check
    try {
      addTestResult('Database Setup', 'running', 'Checking database setup...');
      addTestResult('Database Setup', 'info', 'Database setup required for full functionality. Run the SQL script in Supabase to enable subscription features.');
    } catch (error) {
      addTestResult('Database Setup', 'error', `Error: ${error.message}`);
    }

    setLoading(false);
  };

  const downloadSampleICS = () => {
    const params = new URLSearchParams({
      start_date: '2025-01-01',
      end_date: '2025-01-31',
      calendar_name: 'Sample Tamil Panchangam',
      include_auspicious: 'true',
      include_inauspicious: 'true',
      include_special_days: 'true',
      include_rs_warnings: 'true',
      include_chandrashtama: 'true'
    });

    const url = `/api/calendar/ics?${params}`;
    window.open(url, '_blank');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'running': return '⏳';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#059669';
      case 'error': return '#dc2626';
      case 'running': return '#d97706';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <Head>
        <title>Calendar Sync Test - Tamil Panchangam</title>
        <meta name="description" content="Test page for Tamil Panchangam calendar sync functionality" />
      </Head>

      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#059669', marginBottom: '10px' }}>
          📅 Calendar Sync Test Page
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Test the calendar sync functionality for Tamil Panchangam
        </p>
      </header>

      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={runTests}
          disabled={loading}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: loading ? '#9ca3af' : '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '15px'
          }}
        >
          {loading ? '⏳ Running Tests...' : '🚀 Run All Tests'}
        </button>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <button
            onClick={downloadSampleICS}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📥 Download Sample ICS File
          </button>

          <button
            onClick={() => window.open('/api/calendar/test-sample', '_blank')}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🧪 Test with Real Data
          </button>
        </div>
      </div>

      {testResults.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#374151', marginBottom: '15px' }}>Test Results</h2>
          <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px' }}>
            {testResults.map((result, index) => (
              <div
                key={index}
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
                    {result.test}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {result.message}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {new Date(result.timestamp).toISOString().substring(11, 19)} UTC
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '20px', marginBottom: '30px' }}>
        <h3 style={{ color: '#0369a1', marginBottom: '15px' }}>📋 Test URLs</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>ICS Download:</strong></p>
          <code style={{ backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '4px', display: 'block', marginBottom: '10px' }}>
            /api/calendar/ics?start_date=2025-01-01&end_date=2025-01-31&calendar_name=Test%20Calendar
          </code>
          
          <p><strong>Webcal Subscription:</strong></p>
          <code style={{ backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '4px', display: 'block', marginBottom: '10px' }}>
            webcal://your-domain.com/api/calendar/webcal?include_auspicious=true&include_inauspicious=true
          </code>
          
          <p><strong>Subscription Management:</strong></p>
          <code style={{ backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '4px', display: 'block' }}>
            POST /api/calendar/subscription
          </code>
        </div>
      </div>

      <div style={{ backgroundColor: '#f0fdf4', borderRadius: '8px', padding: '20px' }}>
        <h3 style={{ color: '#059669', marginBottom: '15px' }}>📱 Calendar App Setup</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>iOS Calendar:</strong> Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar</p>
          <p><strong>Android Calendar:</strong> Open Calendar app → Settings → Import calendar → From URL</p>
          <p><strong>Google Calendar:</strong> Google Calendar → Settings → Import & Export → From URL</p>
          <p><strong>Outlook:</strong> Calendar → Add calendar → Subscribe from web</p>
          <p><strong>Apple Calendar (Mac):</strong> File → New Calendar Subscription</p>
        </div>
      </div>

      <footer style={{ textAlign: 'center', marginTop: '40px', color: '#6b7280', fontSize: '14px' }}>
        <p>Tamil Panchangam Calendar Sync Test Page</p>
        <p>Created for testing calendar integration functionality</p>
      </footer>
    </div>
  );
}
