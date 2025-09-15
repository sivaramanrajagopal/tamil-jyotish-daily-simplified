// Test Calendar Subscription System
// Run this in your browser console or as a Node.js script

const SUPABASE_URL = 'https://svrtefferaxnmmejwfdv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cnRlZmZlcmF4bm1tZWp3ZmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzg5NjQsImV4cCI6MjA2NDc1NDk2NH0.w3m5Vo_q_-QASqzL-k-iWWGYZWG0maqiNzsLHL9aJ7Y';

// Test 1: Create a subscription
async function createSubscription() {
  console.log('🔄 Creating subscription...');
  
  const response = await fetch('http://localhost:3000/api/calendar/subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: 'test-user-' + Date.now(),
      calendar_name: 'Test Tamil Panchangam',
      include_auspicious_times: true,
      include_inauspicious_times: true,
      include_special_days: true,
      include_rs_warnings: true,
      include_chandrashtama: true,
      date_range_days: 90
    })
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Subscription created:', data);
    return data;
  } else {
    const error = await response.text();
    console.error('❌ Error creating subscription:', error);
    return null;
  }
}

// Test 2: Test webcal URL
async function testWebcalUrl(token) {
  console.log('🔄 Testing webcal URL...');
  
  const webcalUrl = `http://localhost:3000/api/calendar/webcal?token=${token}`;
  console.log('📱 Webcal URL:', webcalUrl);
  
  const response = await fetch(webcalUrl);
  
  if (response.ok) {
    const icsContent = await response.text();
    console.log('✅ Webcal working! ICS content length:', icsContent.length);
    console.log('📅 First 200 chars:', icsContent.substring(0, 200));
    return true;
  } else {
    console.error('❌ Webcal failed:', response.status, response.statusText);
    return false;
  }
}

// Test 3: Check database tables
async function checkDatabase() {
  console.log('🔄 Checking database tables...');
  
  // This would require server-side code or direct Supabase access
  console.log('📊 To check database, run these SQL queries in Supabase:');
  console.log(`
    -- Check subscriptions
    SELECT * FROM calendar_subscriptions ORDER BY created_at DESC LIMIT 5;
    
    -- Check preferences
    SELECT * FROM user_calendar_preferences ORDER BY created_at DESC LIMIT 5;
    
    -- Check activity
    SELECT 
      subscription_token,
      last_accessed,
      created_at
    FROM calendar_subscriptions 
    WHERE is_active = true 
    ORDER BY last_accessed DESC NULLS LAST;
  `);
}

// Test 4: Simulate calendar app request
async function simulateCalendarApp(token) {
  console.log('🔄 Simulating calendar app request...');
  
  const response = await fetch(`http://localhost:3000/api/calendar/webcal?token=${token}`, {
    headers: {
      'User-Agent': 'CalendarApp/1.0',
      'Accept': 'text/calendar'
    }
  });
  
  if (response.ok) {
    const icsContent = await response.text();
    console.log('✅ Calendar app simulation successful!');
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    return true;
  } else {
    console.error('❌ Calendar app simulation failed:', response.status);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Calendar Subscription Tests...\n');
  
  try {
    // Test 1: Create subscription
    const subscription = await createSubscription();
    if (!subscription) {
      console.log('❌ Cannot continue without subscription');
      return;
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Test webcal URL
    await testWebcalUrl(subscription.subscription_token);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 3: Check database
    await checkDatabase();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 4: Simulate calendar app
    await simulateCalendarApp(subscription.subscription_token);
    
    console.log('\n' + '='.repeat(50) + '\n');
    console.log('🎉 All tests completed!');
    console.log('\n📱 To test in real calendar app:');
    console.log(`1. Copy this URL: ${subscription.webcal_url}`);
    console.log('2. Add to Google Calendar, Apple Calendar, or Outlook');
    console.log('3. Check if events appear in your calendar');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createSubscription,
    testWebcalUrl,
    checkDatabase,
    simulateCalendarApp,
    runAllTests
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('🌐 Browser detected. Run runAllTests() to start testing.');
  window.runAllTests = runAllTests;
}
