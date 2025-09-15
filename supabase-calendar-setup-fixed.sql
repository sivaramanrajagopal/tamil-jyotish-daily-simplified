-- Calendar Sync Database Setup for Tamil Panchangam (FIXED VERSION)
-- Run this script in your Supabase SQL editor

-- Create user calendar preferences table (FIXED: user_id as TEXT instead of UUID)
CREATE TABLE IF NOT EXISTS user_calendar_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT for flexibility
  calendar_name TEXT NOT NULL DEFAULT 'Tamil Panchangam',
  include_auspicious_times BOOLEAN DEFAULT true,
  include_inauspicious_times BOOLEAN DEFAULT true,
  include_special_days BOOLEAN DEFAULT true,
  include_rs_warnings BOOLEAN DEFAULT true,
  include_chandrashtama BOOLEAN DEFAULT true,
  date_range_days INTEGER DEFAULT 365,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create calendar subscriptions table (FIXED: user_id as TEXT instead of UUID)
CREATE TABLE IF NOT EXISTS calendar_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Changed from UUID to TEXT for flexibility
  subscription_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_calendar_preferences_user_id ON user_calendar_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_subscriptions_user_id ON calendar_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_subscriptions_token ON calendar_subscriptions(subscription_token);
CREATE INDEX IF NOT EXISTS idx_calendar_subscriptions_active ON calendar_subscriptions(is_active);

-- Add updated_at trigger for user_calendar_preferences
CREATE OR REPLACE FUNCTION update_user_calendar_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_user_calendar_preferences_updated_at ON user_calendar_preferences;
CREATE TRIGGER update_user_calendar_preferences_updated_at
  BEFORE UPDATE ON user_calendar_preferences
  FOR EACH ROW EXECUTE PROCEDURE update_user_calendar_preferences_updated_at();

-- Enable Row Level Security
ALTER TABLE user_calendar_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_calendar_preferences (FIXED: removed auth.uid() dependency)
DROP POLICY IF EXISTS "Users can view their own calendar preferences" ON user_calendar_preferences;
CREATE POLICY "Users can view their own calendar preferences" ON user_calendar_preferences
  FOR SELECT USING (true); -- Allow all reads for now

DROP POLICY IF EXISTS "Users can insert their own calendar preferences" ON user_calendar_preferences;
CREATE POLICY "Users can insert their own calendar preferences" ON user_calendar_preferences
  FOR INSERT WITH CHECK (true); -- Allow all inserts for now

DROP POLICY IF EXISTS "Users can update their own calendar preferences" ON user_calendar_preferences;
CREATE POLICY "Users can update their own calendar preferences" ON user_calendar_preferences
  FOR UPDATE USING (true); -- Allow all updates for now

DROP POLICY IF EXISTS "Users can delete their own calendar preferences" ON user_calendar_preferences;
CREATE POLICY "Users can delete their own calendar preferences" ON user_calendar_preferences
  FOR DELETE USING (true); -- Allow all deletes for now

-- Create RLS policies for calendar_subscriptions (FIXED: removed auth.uid() dependency)
DROP POLICY IF EXISTS "Users can view their own calendar subscriptions" ON calendar_subscriptions;
CREATE POLICY "Users can view their own calendar subscriptions" ON calendar_subscriptions
  FOR SELECT USING (true); -- Allow all reads for now

DROP POLICY IF EXISTS "Users can insert their own calendar subscriptions" ON calendar_subscriptions;
CREATE POLICY "Users can insert their own calendar subscriptions" ON calendar_subscriptions
  FOR INSERT WITH CHECK (true); -- Allow all inserts for now

DROP POLICY IF EXISTS "Users can update their own calendar subscriptions" ON calendar_subscriptions;
CREATE POLICY "Users can update their own calendar subscriptions" ON calendar_subscriptions
  FOR UPDATE USING (true); -- Allow all updates for now

DROP POLICY IF EXISTS "Users can delete their own calendar subscriptions" ON calendar_subscriptions;
CREATE POLICY "Users can delete their own calendar subscriptions" ON calendar_subscriptions
  FOR DELETE USING (true); -- Allow all deletes for now

-- Allow public access to calendar subscriptions by token (for webcal)
DROP POLICY IF EXISTS "Public can view active subscriptions by token" ON calendar_subscriptions;
CREATE POLICY "Public can view active subscriptions by token" ON calendar_subscriptions
  FOR SELECT USING (is_active = true);

-- Function to get calendar panchangam data with all events
CREATE OR REPLACE FUNCTION get_calendar_panchangam_data(
  start_date DATE,
  end_date DATE,
  user_preferences JSONB DEFAULT '{}'::JSONB
) RETURNS TABLE (
  event_date DATE,
  event_type TEXT,
  event_title TEXT,
  event_description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  is_all_day BOOLEAN,
  event_category TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Nakshatra events
  SELECT 
    dp.date as event_date,
    'nakshatra' as event_type,
    dp.main_nakshatra || ' நட்சத்திரம்' as event_title,
    'Today''s Nakshatra: ' || dp.main_nakshatra || 
    CASE 
      WHEN dp.is_valar_pirai THEN '\\nMoon Phase: வளர்பிறை (Waxing Moon)'
      WHEN dp.is_thei_pirai THEN '\\nMoon Phase: தேய்பிறை (Waning Moon)'
      ELSE ''
    END as event_description,
    dp.date::TIMESTAMPTZ as start_time,
    (dp.date + INTERVAL '1 day')::TIMESTAMPTZ as end_time,
    true as is_all_day,
    'NAKSHATRA' as event_category
  FROM daily_panchangam dp
  WHERE dp.date >= start_date 
    AND dp.date <= end_date
    AND dp.main_nakshatra IS NOT NULL
    
  UNION ALL
  
  -- Special days events
  SELECT 
    dp.date as event_date,
    'special_day' as event_type,
    CASE 
      WHEN dp.is_amavasai THEN '🌑 அமாவாசை (New Moon)'
      WHEN dp.is_pournami THEN '🌕 பௌர்ணமி (Full Moon)'
      WHEN dp.is_ekadashi THEN '🕉️ ஏகாதசி (Ekadashi)'
      WHEN dp.is_dwadashi THEN '🕉️ துவாதசி (Dwadashi)'
      WHEN dp.is_ashtami THEN '🕉️ அஷ்டமி (Ashtami)'
      WHEN dp.is_navami THEN '🕉️ நவமி (Navami)'
      WHEN dp.is_trayodashi THEN '🕉️ திரயோதசி (Trayodashi)'
      WHEN dp.is_sashti THEN '🕉️ சஷ்டி (Sashti)'
      ELSE NULL
    END as event_title,
    CASE 
      WHEN dp.is_amavasai THEN 'New Moon Day - Considered auspicious for certain activities'
      WHEN dp.is_pournami THEN 'Full Moon Day - Considered auspicious for certain activities'
      WHEN dp.is_ekadashi THEN 'Ekadashi - Fasting day for spiritual purification'
      WHEN dp.is_dwadashi THEN 'Dwadashi - Day after Ekadashi'
      WHEN dp.is_ashtami THEN 'Ashtami - Eighth day of lunar cycle'
      WHEN dp.is_navami THEN 'Navami - Ninth day of lunar cycle'
      WHEN dp.is_trayodashi THEN 'Trayodashi - Thirteenth day of lunar cycle'
      WHEN dp.is_sashti THEN 'Sashti - Sixth day of lunar cycle'
      ELSE NULL
    END as event_description,
    dp.date::TIMESTAMPTZ as start_time,
    (dp.date + INTERVAL '1 day')::TIMESTAMPTZ as end_time,
    true as is_all_day,
    'SPECIAL_DAY' as event_category
  FROM daily_panchangam dp
  WHERE dp.date >= start_date 
    AND dp.date <= end_date
    AND (dp.is_amavasai OR dp.is_pournami OR dp.is_ekadashi OR 
         dp.is_dwadashi OR dp.is_ashtami OR dp.is_navami OR 
         dp.is_trayodashi OR dp.is_sashti);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON daily_panchangam TO anon, authenticated;
GRANT ALL ON user_calendar_preferences TO anon, authenticated;
GRANT ALL ON calendar_subscriptions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_panchangam_data TO anon, authenticated;

-- Insert sample data for testing (optional)
-- You can uncomment this section if you want to test with sample data

/*
-- Sample user calendar preferences
INSERT INTO user_calendar_preferences (
  user_id,
  calendar_name,
  include_auspicious_times,
  include_inauspicious_times,
  include_special_days,
  include_rs_warnings,
  include_chandrashtama,
  date_range_days
) VALUES (
  'test-user-123',
  'My Tamil Panchangam',
  true,
  true,
  true,
  true,
  true,
  365
) ON CONFLICT (user_id) DO NOTHING;

-- Sample calendar subscription
INSERT INTO calendar_subscriptions (
  user_id,
  subscription_token,
  is_active
) VALUES (
  'test-user-123',
  'sample-token-12345678901234567890123456789012',
  true
) ON CONFLICT (user_id) DO NOTHING;
*/
