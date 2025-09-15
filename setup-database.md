# 🗄️ Database Setup Instructions

## ✅ **Fixed SQL Script**

The SQL script has been updated to handle existing objects gracefully. You can now run it multiple times without errors.

## 🚀 **How to Set Up the Database**

### **Option 1: Run the Fixed Script (Recommended)**

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `svrtefferaxnmmejwfdv`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Fixed Script**
   - Open the file: `supabase-calendar-setup.sql`
   - Copy the entire contents
   - Paste into the SQL editor

4. **Run the Script**
   - Click "Run" button
   - The script will now run without errors, even if run multiple times

### **Option 2: Run Individual Commands (If you prefer step-by-step)**

If you want to run commands individually, here are the key ones:

```sql
-- 1. Create tables (safe to run multiple times)
CREATE TABLE IF NOT EXISTS user_calendar_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS calendar_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_token TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. Create function (safe to run multiple times)
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
```

## ✅ **What This Setup Enables**

After running the database setup, you'll have:

1. **User Calendar Preferences** - Users can customize their calendar settings
2. **Calendar Subscriptions** - Users can create webcal:// subscription URLs
3. **Row Level Security** - Secure access to user data
4. **Calendar Data Function** - Generates calendar events from your panchangam data

## 🧪 **Test the Setup**

After running the script, test it by visiting:
- `http://localhost:3000/status` - Check overall app status
- `http://localhost:3000/calendar-test` - Test calendar functionality

## 🚨 **If You Still Get Errors**

If you encounter any other errors, you can:

1. **Check what already exists:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('user_calendar_preferences', 'calendar_subscriptions');
   ```

2. **Drop and recreate (if needed):**
   ```sql
   DROP TABLE IF EXISTS calendar_subscriptions CASCADE;
   DROP TABLE IF EXISTS user_calendar_preferences CASCADE;
   -- Then run the full script again
   ```

The fixed script should now run without any errors! 🎉
