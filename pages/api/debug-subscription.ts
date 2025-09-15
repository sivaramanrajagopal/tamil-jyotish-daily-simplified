import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

// Debug subscription creation
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, calendar_name } = req.body;

    console.log('🔍 Debug: Starting subscription creation...');
    console.log('🔍 Debug: user_id:', user_id);
    console.log('🔍 Debug: calendar_name:', calendar_name);

    // Test 1: Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_calendar_preferences')
      .select('*')
      .eq('user_id', user_id);

    if (checkError) {
      console.error('❌ Debug: Check existing user error:', checkError);
      return res.status(500).json({ 
        error: 'Check existing user failed',
        details: checkError.message 
      });
    }

    console.log('🔍 Debug: Existing user check result:', existingUser);

    if (existingUser && existingUser.length > 0) {
      console.log('⚠️ Debug: User already exists, will update instead');
      
      // Update existing user
      const { data: updateData, error: updateError } = await supabase
        .from('user_calendar_preferences')
        .update({
          calendar_name: calendar_name || 'Tamil Panchangam',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Debug: Update error:', updateError);
        return res.status(500).json({ 
          error: 'Update failed',
          details: updateError.message 
        });
      }

      console.log('✅ Debug: User updated successfully:', updateData);
      return res.status(200).json({
        success: true,
        message: 'User preferences updated',
        data: updateData
      });
    }

    // Test 2: Try to insert new user
    console.log('🔍 Debug: Creating new user...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('user_calendar_preferences')
      .insert({
        user_id,
        calendar_name: calendar_name || 'Tamil Panchangam',
        include_auspicious_times: true,
        include_inauspicious_times: true,
        include_special_days: true,
        include_rs_warnings: true,
        include_chandrashtama: true,
        date_range_days: 365
      })
      .select();

    if (insertError) {
      console.error('❌ Debug: Insert error:', insertError);
      return res.status(500).json({ 
        error: 'Insert failed',
        details: insertError.message,
        code: insertError.code
      });
    }

    console.log('✅ Debug: User created successfully:', insertData);

    // Test 3: Create subscription
    console.log('🔍 Debug: Creating subscription...');
    
    const subscription_token = 'test-token-' + Date.now();
    const { data: subData, error: subError } = await supabase
      .from('calendar_subscriptions')
      .insert({
        user_id,
        subscription_token,
        is_active: true
      })
      .select();

    if (subError) {
      console.error('❌ Debug: Subscription creation error:', subError);
      return res.status(500).json({ 
        error: 'Subscription creation failed',
        details: subError.message,
        code: subError.code
      });
    }

    console.log('✅ Debug: Subscription created successfully:', subData);

    return res.status(200).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        preferences: insertData[0],
        subscription: subData[0],
        subscription_token,
        webcal_url: `webcal://localhost:3000/api/calendar/webcal?token=${subscription_token}`
      }
    });

  } catch (error) {
    console.error('❌ Debug: Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Unexpected error',
      details: error.message 
    });
  }
}
