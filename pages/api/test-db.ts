import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

// Simple database test endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Testing database connection...');

    // Test 1: Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('daily_panchangam')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Supabase connection error:', testError);
      return res.status(500).json({ 
        error: 'Supabase connection failed',
        details: testError.message 
      });
    }

    console.log('✅ Supabase connection working');

    // Test 2: Check if user_calendar_preferences table exists
    const { data: prefsData, error: prefsError } = await supabase
      .from('user_calendar_preferences')
      .select('*')
      .limit(1);

    if (prefsError) {
      console.error('❌ user_calendar_preferences table error:', prefsError);
      return res.status(500).json({ 
        error: 'user_calendar_preferences table not found',
        details: prefsError.message,
        suggestion: 'Run the SQL script in Supabase to create the required tables'
      });
    }

    console.log('✅ user_calendar_preferences table exists');

    // Test 3: Check if calendar_subscriptions table exists
    const { data: subData, error: subError } = await supabase
      .from('calendar_subscriptions')
      .select('*')
      .limit(1);

    if (subError) {
      console.error('❌ calendar_subscriptions table error:', subError);
      return res.status(500).json({ 
        error: 'calendar_subscriptions table not found',
        details: subError.message,
        suggestion: 'Run the SQL script in Supabase to create the required tables'
      });
    }

    console.log('✅ calendar_subscriptions table exists');

    // Test 4: Check if function exists
    const { data: funcData, error: funcError } = await supabase
      .rpc('get_calendar_panchangam_data', {
        start_date: '2025-09-15',
        end_date: '2025-09-16'
      });

    if (funcError) {
      console.error('❌ get_calendar_panchangam_data function error:', funcError);
      return res.status(500).json({ 
        error: 'get_calendar_panchangam_data function not found',
        details: funcError.message,
        suggestion: 'Run the SQL script in Supabase to create the required function'
      });
    }

    console.log('✅ get_calendar_panchangam_data function exists');

    // Test 5: Try to insert a test record
    const testUserId = 'test-user-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('user_calendar_preferences')
      .insert({
        user_id: testUserId,
        calendar_name: 'Test Calendar',
        include_auspicious_times: true,
        include_inauspicious_times: true,
        include_special_days: true,
        include_rs_warnings: true,
        include_chandrashtama: true,
        date_range_days: 90
      })
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return res.status(500).json({ 
        error: 'Insert test failed',
        details: insertError.message,
        suggestion: 'Check table permissions and RLS policies'
      });
    }

    console.log('✅ Insert test successful');

    // Clean up test record
    await supabase
      .from('user_calendar_preferences')
      .delete()
      .eq('user_id', testUserId);

    console.log('✅ Test record cleaned up');

    return res.status(200).json({
      success: true,
      message: 'Database setup is correct!',
      tests: {
        supabase_connection: '✅ Working',
        user_calendar_preferences_table: '✅ Exists',
        calendar_subscriptions_table: '✅ Exists',
        get_calendar_panchangam_data_function: '✅ Exists',
        insert_permissions: '✅ Working'
      }
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
    return res.status(500).json({ 
      error: 'Database test failed',
      details: error.message 
    });
  }
}
