import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

// Calendar subscription management API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return createSubscription(req, res);
    case 'GET':
      return getSubscription(req, res);
    case 'PUT':
      return updateSubscription(req, res);
    case 'DELETE':
      return deleteSubscription(req, res);
    default:
      res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}

// Create a new calendar subscription
async function createSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      user_id,
      calendar_name = 'Tamil Panchangam',
      include_auspicious_times = true,
      include_inauspicious_times = true,
      include_special_days = true,
      include_rs_warnings = true,
      include_chandrashtama = true,
      date_range_days = 365
    } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Generate a unique subscription token
    const subscription_token = generateSubscriptionToken();

    // Create calendar preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('user_calendar_preferences')
      .insert({
        user_id,
        calendar_name,
        include_auspicious_times,
        include_inauspicious_times,
        include_special_days,
        include_rs_warnings,
        include_chandrashtama,
        date_range_days
      })
      .select()
      .single();

    if (prefsError) {
      console.error('Error creating calendar preferences:', prefsError);
      return res.status(500).json({ error: 'Failed to create calendar preferences' });
    }

    // Create subscription
    const { data: subscription, error: subError } = await supabase
      .from('calendar_subscriptions')
      .insert({
        user_id,
        subscription_token,
        is_active: true
      })
      .select()
      .single();

    if (subError) {
      console.error('Error creating subscription:', subError);
      return res.status(500).json({ error: 'Failed to create subscription' });
    }

    // Generate webcal URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // Ensure HTTPS for production webcal URLs
    const domain = baseUrl.replace(/^https?:\/\//, '');
    // Force HTTPS for production (Vercel domains)
    const isProduction = domain.includes('vercel.app') || domain.includes('netlify.app');
    const secureBaseUrl = isProduction ? `https://${domain}` : baseUrl;
    const webcalUrl = `webcal://${domain}/api/calendar/webcal?token=${subscription_token}`;
    const icsUrl = `${secureBaseUrl}/api/calendar/ics?token=${subscription_token}`;
    
    // Debug logging
    console.log('Base URL:', baseUrl);
    console.log('Domain:', domain);
    console.log('Is Production:', isProduction);
    console.log('Webcal URL:', webcalUrl);
    console.log('ICS URL:', icsUrl);

    return res.status(201).json({
      subscription_id: subscription.id,
      subscription_token,
      webcal_url: webcalUrl,
      ics_url: icsUrl,
      preferences: preferences,
      message: 'Calendar subscription created successfully'
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get subscription details
async function getSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { token, user_id } = req.query;

    if (!token && !user_id) {
      return res.status(400).json({ error: 'Token or user_id is required' });
    }

    let query = supabase
      .from('calendar_subscriptions')
      .select(`
        *,
        user_calendar_preferences (
          calendar_name,
          include_auspicious_times,
          include_inauspicious_times,
          include_special_days,
          include_rs_warnings,
          include_chandrashtama,
          date_range_days,
          created_at,
          updated_at
        )
      `);

    if (token) {
      query = query.eq('subscription_token', token);
    } else if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: subscription, error } = await query.single();

    if (error) {
      console.error('Error fetching subscription:', error);
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Generate URLs
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // Ensure HTTPS for production webcal URLs
    const domain = baseUrl.replace(/^https?:\/\//, '');
    // Force HTTPS for production (Vercel domains)
    const isProduction = domain.includes('vercel.app') || domain.includes('netlify.app');
    const secureBaseUrl = isProduction ? `https://${domain}` : baseUrl;
    const webcalUrl = `webcal://${domain}/api/calendar/webcal?token=${subscription.subscription_token}`;
    const icsUrl = `${secureBaseUrl}/api/calendar/ics?token=${subscription.subscription_token}`;

    return res.status(200).json({
      subscription,
      webcal_url: webcalUrl,
      ics_url: icsUrl
    });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Update subscription preferences
async function updateSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { token, user_id } = req.query;
    const {
      calendar_name,
      include_auspicious_times,
      include_inauspicious_times,
      include_special_days,
      include_rs_warnings,
      include_chandrashtama,
      date_range_days
    } = req.body;

    if (!token && !user_id) {
      return res.status(400).json({ error: 'Token or user_id is required' });
    }

    // Find the subscription
    let query = supabase
      .from('calendar_subscriptions')
      .select('user_id');

    if (token) {
      query = query.eq('subscription_token', token);
    } else if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: subscription, error: subError } = await query.single();

    if (subError || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Update preferences
    const updateData: any = {};
    if (calendar_name !== undefined) updateData.calendar_name = calendar_name;
    if (include_auspicious_times !== undefined) updateData.include_auspicious_times = include_auspicious_times;
    if (include_inauspicious_times !== undefined) updateData.include_inauspicious_times = include_inauspicious_times;
    if (include_special_days !== undefined) updateData.include_special_days = include_special_days;
    if (include_rs_warnings !== undefined) updateData.include_rs_warnings = include_rs_warnings;
    if (include_chandrashtama !== undefined) updateData.include_chandrashtama = include_chandrashtama;
    if (date_range_days !== undefined) updateData.date_range_days = date_range_days;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }

    const { data: preferences, error: prefsError } = await supabase
      .from('user_calendar_preferences')
      .update(updateData)
      .eq('user_id', subscription.user_id)
      .select()
      .single();

    if (prefsError) {
      console.error('Error updating preferences:', prefsError);
      return res.status(500).json({ error: 'Failed to update preferences' });
    }

    return res.status(200).json({
      preferences,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Delete subscription
async function deleteSubscription(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { token, user_id } = req.query;

    if (!token && !user_id) {
      return res.status(400).json({ error: 'Token or user_id is required' });
    }

    // Find the subscription
    let query = supabase
      .from('calendar_subscriptions')
      .select('user_id');

    if (token) {
      query = query.eq('subscription_token', token);
    } else if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: subscription, error: subError } = await query.single();

    if (subError || !subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    // Delete preferences
    const { error: prefsError } = await supabase
      .from('user_calendar_preferences')
      .delete()
      .eq('user_id', subscription.user_id);

    if (prefsError) {
      console.error('Error deleting preferences:', prefsError);
      return res.status(500).json({ error: 'Failed to delete preferences' });
    }

    // Delete subscription
    const { error: deleteError } = await supabase
      .from('calendar_subscriptions')
      .delete()
      .eq('user_id', subscription.user_id);

    if (deleteError) {
      console.error('Error deleting subscription:', deleteError);
      return res.status(500).json({ error: 'Failed to delete subscription' });
    }

    return res.status(200).json({
      message: 'Subscription deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subscription:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function generateSubscriptionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
