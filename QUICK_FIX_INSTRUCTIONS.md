# 🚨 **QUICK FIX: "Failed to create calendar preferences" Error**

## 🔍 **The Problem**
The database tables are set up with `user_id` as UUID type, but we're passing strings like "test-user-123".

## ✅ **IMMEDIATE SOLUTION**

### **Step 1: Go to Supabase Dashboard**
1. Visit: https://supabase.com/dashboard
2. Select your project: `svrtefferaxnmmejwfdv`
3. Click **"SQL Editor"** → **"New query"**

### **Step 2: Run This SQL Script**
Copy and paste this **entire script** into the SQL editor and click **"Run"**:

```sql
-- Drop existing tables if they exist
DROP TABLE IF EXISTS calendar_subscriptions CASCADE;
DROP TABLE IF EXISTS user_calendar_preferences CASCADE;

-- Create user calendar preferences table (FIXED: user_id as TEXT)
CREATE TABLE user_calendar_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
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

-- Create calendar subscriptions table (FIXED: user_id as TEXT)
CREATE TABLE calendar_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  subscription_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX idx_user_calendar_preferences_user_id ON user_calendar_preferences(user_id);
CREATE INDEX idx_calendar_subscriptions_user_id ON calendar_subscriptions(user_id);
CREATE INDEX idx_calendar_subscriptions_token ON calendar_subscriptions(subscription_token);
CREATE INDEX idx_calendar_subscriptions_active ON calendar_subscriptions(is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_user_calendar_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_calendar_preferences_updated_at
  BEFORE UPDATE ON user_calendar_preferences
  FOR EACH ROW EXECUTE PROCEDURE update_user_calendar_preferences_updated_at();

-- Enable Row Level Security
ALTER TABLE user_calendar_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (simplified for testing)
CREATE POLICY "Allow all operations on user_calendar_preferences" ON user_calendar_preferences
  FOR ALL USING (true);

CREATE POLICY "Allow all operations on calendar_subscriptions" ON calendar_subscriptions
  FOR ALL USING (true);

-- Create function for calendar data
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON daily_panchangam TO anon, authenticated;
GRANT ALL ON user_calendar_preferences TO anon, authenticated;
GRANT ALL ON calendar_subscriptions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_calendar_panchangam_data TO anon, authenticated;
```

### **Step 3: Test the Fix**
After running the SQL script, test it:

```bash
curl http://localhost:3000/api/test-db
```

You should see:
```json
{
  "success": true,
  "message": "Database setup is correct!",
  "tests": {
    "supabase_connection": "✅ Working",
    "user_calendar_preferences_table": "✅ Exists",
    "calendar_subscriptions_table": "✅ Exists",
    "get_calendar_panchangam_data_function": "✅ Exists",
    "insert_permissions": "✅ Working"
  }
}
```

### **Step 4: Test Subscription Creation**
```bash
curl -X POST http://localhost:3000/api/calendar/subscription \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test-user-123","calendar_name":"Test Calendar"}'
```

You should see:
```json
{
  "subscription_token": "abc123...",
  "webcal_url": "webcal://localhost:3000/api/calendar/webcal?token=abc123..."
}
```

### **Step 5: Launch Admin Dashboard**
Visit: `http://localhost:3000/admin`

You should see:
- Statistics cards showing subscription data
- Recent subscriptions table
- User preferences

## 🎉 **Expected Result**
After running the SQL script:
- ✅ **No more "Failed to create calendar preferences" error**
- ✅ **Subscription creation works**
- ✅ **Admin dashboard shows data**
- ✅ **Calendar sync feature works**

## 🚨 **If You Still Get Errors**
1. **Check if you ran the SQL script** - The error will persist until you run it
2. **Restart your development server**: `npm run dev`
3. **Check Supabase logs** for any SQL errors

**The fix is simple: Run the SQL script above in your Supabase dashboard!** 🚀
