// Test Database Setup
// Run this in your browser console to test if the database is set up correctly

const SUPABASE_URL = 'https://svrtefferaxnmmejwfdv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2cnRlZmZlcmF4bm1tZWp3ZmR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzg5NjQsImV4cCI6MjA2NDc1NDk2NH0.w3m5Vo_q_-QASqzL-k-iWWGYZWG0maqiNzsLHL9aJ7Y';

// Test if tables exist
async function testDatabaseSetup() {
  console.log('🔍 Testing database setup...');
  
  try {
    // Test 1: Check if user_calendar_preferences table exists
    console.log('📋 Testing user_calendar_preferences table...');
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_calendar_preferences')
      .select('*')
      .limit(1);
    
    if (prefsError) {
      console.error('❌ user_calendar_preferences table error:', prefsError.message);
      return false;
    } else {
      console.log('✅ user_calendar_preferences table exists');
    }
    
    // Test 2: Check if calendar_subscriptions table exists
    console.log('📋 Testing calendar_subscriptions table...');
    const { data: subData, error: subError } = await supabase
      .from('calendar_subscriptions')
      .select('*')
      .limit(1);
    
    if (subError) {
      console.error('❌ calendar_subscriptions table error:', subError.message);
      return false;
    } else {
      console.log('✅ calendar_subscriptions table exists');
    }
    
    // Test 3: Check if function exists
    console.log('📋 Testing get_calendar_panchangam_data function...');
    const { data: funcData, error: funcError } = await supabase
      .rpc('get_calendar_panchangam_data', {
        start_date: '2025-09-15',
        end_date: '2025-09-16'
      });
    
    if (funcError) {
      console.error('❌ get_calendar_panchangam_data function error:', funcError.message);
      return false;
    } else {
      console.log('✅ get_calendar_panchangam_data function exists');
    }
    
    console.log('🎉 Database setup is correct!');
    return true;
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

// Test creating a subscription
async function testCreateSubscription() {
  console.log('🔄 Testing subscription creation...');
  
  try {
    const response = await fetch('http://localhost:3000/api/calendar/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: 'test-user-' + Date.now(),
        calendar_name: 'Test Calendar',
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
      console.log('✅ Subscription created successfully:', data);
      return data;
    } else {
      const error = await response.text();
      console.error('❌ Subscription creation failed:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Subscription test failed:', error);
    return null;
  }
}

// Run all tests
async function runDatabaseTests() {
  console.log('🚀 Starting Database Tests...\n');
  
  // Test 1: Database setup
  const dbSetup = await testDatabaseSetup();
  
  if (!dbSetup) {
    console.log('\n❌ Database setup failed. Please run the SQL script in Supabase first.');
    console.log('📋 Steps:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project: svrtefferaxnmmejwfdv');
    console.log('3. Click "SQL Editor" → "New query"');
    console.log('4. Copy and paste the contents of supabase-calendar-setup.sql');
    console.log('5. Click "Run"');
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Subscription creation
  const subscription = await testCreateSubscription();
  
  if (subscription) {
    console.log('\n🎉 All tests passed! Your calendar subscription system is working.');
    console.log('\n📱 Next steps:');
    console.log('1. Visit http://localhost:3000/admin to see the admin dashboard');
    console.log('2. Test the calendar sync feature on your main app');
    console.log('3. Try creating a subscription and adding it to your calendar app');
  } else {
    console.log('\n❌ Subscription creation failed. Check the API logs for details.');
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDatabaseSetup,
    testCreateSubscription,
    runDatabaseTests
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('🌐 Browser detected. Run runDatabaseTests() to start testing.');
  window.runDatabaseTests = runDatabaseTests;
}
