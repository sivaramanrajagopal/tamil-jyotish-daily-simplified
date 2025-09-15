# 📊 Calendar Subscription Tracking Guide

## 🗄️ **Database Tables**

### **1. `user_calendar_preferences` Table**
Stores user's calendar settings and preferences.

```sql
-- View all user preferences
SELECT 
  id,
  user_id,
  calendar_name,
  include_auspicious_times,
  include_inauspicious_times,
  include_special_days,
  include_rs_warnings,
  include_chandrashtama,
  date_range_days,
  created_at,
  updated_at
FROM user_calendar_preferences
ORDER BY created_at DESC;
```

### **2. `calendar_subscriptions` Table**
Tracks active calendar subscriptions and usage.

```sql
-- View all active subscriptions
SELECT 
  id,
  user_id,
  subscription_token,
  is_active,
  last_accessed,
  created_at,
  (SELECT calendar_name FROM user_calendar_preferences WHERE user_id = cs.user_id) as calendar_name
FROM calendar_subscriptions cs
WHERE is_active = true
ORDER BY created_at DESC;
```

## 📈 **Key Tracking Queries**

### **1. Subscription Analytics**
```sql
-- Total subscriptions created
SELECT COUNT(*) as total_subscriptions
FROM calendar_subscriptions;

-- Active subscriptions
SELECT COUNT(*) as active_subscriptions
FROM calendar_subscriptions
WHERE is_active = true;

-- Subscriptions by month
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as subscriptions_created
FROM calendar_subscriptions
GROUP BY month
ORDER BY month DESC;
```

### **2. Usage Tracking**
```sql
-- Most active subscriptions (by last access)
SELECT 
  subscription_token,
  last_accessed,
  created_at,
  (SELECT calendar_name FROM user_calendar_preferences WHERE user_id = cs.user_id) as calendar_name
FROM calendar_subscriptions cs
WHERE is_active = true
ORDER BY last_accessed DESC NULLS LAST
LIMIT 10;

-- Subscriptions accessed today
SELECT COUNT(*) as accessed_today
FROM calendar_subscriptions
WHERE last_accessed::date = CURRENT_DATE;
```

### **3. User Preferences Analysis**
```sql
-- Most popular calendar settings
SELECT 
  include_auspicious_times,
  include_inauspicious_times,
  include_special_days,
  include_rs_warnings,
  include_chandrashtama,
  COUNT(*) as user_count
FROM user_calendar_preferences
GROUP BY 
  include_auspicious_times,
  include_inauspicious_times,
  include_special_days,
  include_rs_warnings,
  include_chandrashtama
ORDER BY user_count DESC;

-- Average date range preference
SELECT 
  AVG(date_range_days) as avg_date_range,
  MIN(date_range_days) as min_date_range,
  MAX(date_range_days) as max_date_range
FROM user_calendar_preferences;
```

### **4. Subscription Health Check**
```sql
-- Inactive subscriptions (not accessed in 30 days)
SELECT 
  subscription_token,
  last_accessed,
  created_at,
  (CURRENT_DATE - last_accessed::date) as days_since_access
FROM calendar_subscriptions
WHERE is_active = true 
  AND (last_accessed IS NULL OR last_accessed < NOW() - INTERVAL '30 days')
ORDER BY days_since_access DESC;

-- Recently created but never accessed
SELECT 
  subscription_token,
  created_at,
  (CURRENT_DATE - created_at::date) as days_since_creation
FROM calendar_subscriptions
WHERE is_active = true 
  AND last_accessed IS NULL
  AND created_at < NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;
```

## 🔄 **How Subscriptions Work in Production**

### **1. User Creates Subscription**
```javascript
// User clicks "Create Calendar Subscription"
const response = await fetch('/api/calendar/subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user-123',
    calendar_name: 'My Tamil Panchangam',
    include_auspicious_times: true,
    include_inauspicious_times: true,
    include_special_days: true,
    include_rs_warnings: true,
    include_chandrashtama: true,
    date_range_days: 365
  })
});

const { subscription_token, webcal_url } = await response.json();
// webcal_url: "webcal://your-domain.com/api/calendar/webcal?token=abc123"
```

### **2. User Adds to Calendar App**
User copies the `webcal_url` and adds it to their calendar app:
- **Google Calendar**: Settings → Import & Export → From URL
- **Apple Calendar**: File → New Calendar Subscription
- **Outlook**: Calendar → Add calendar → Subscribe from web

### **3. Calendar App Syncs Automatically**
```
Calendar App → GET /api/calendar/webcal?token=abc123 → 
Your API → Updates last_accessed → Returns ICS data → 
Calendar App displays events
```

### **4. Automatic Updates**
- Calendar apps typically sync every 15-30 minutes
- Your API updates `last_accessed` timestamp on each request
- Users get real-time updates without manual intervention

## 📱 **What Users Need to Do**

### **Step 1: Create Subscription**
1. Visit your Tamil Panchangam app
2. Click "📅 Calendar Sync" button
3. Configure their preferences:
   - Calendar name
   - Include auspicious times
   - Include inauspicious times
   - Include special days
   - Include RS warnings
   - Include Chandrashtama
   - Date range (30-365 days)

### **Step 2: Get Subscription URL**
After creating subscription, user gets:
- **Webcal URL**: `webcal://your-domain.com/api/calendar/webcal?token=abc123`
- **Copy to clipboard** button for easy sharing

### **Step 3: Add to Calendar App**

#### **Google Calendar:**
1. Go to [Google Calendar](https://calendar.google.com)
2. Click **"+"** next to "Other calendars"
3. Select **"From URL"**
4. Paste the webcal URL
5. Click **"Add calendar"**

#### **Apple Calendar (Mac/iPhone):**
1. Open Calendar app
2. **File → New Calendar Subscription** (Mac) or **Settings → Accounts → Add Account** (iPhone)
3. Paste the webcal URL
4. Click **"Subscribe"**

#### **Outlook:**
1. Open Outlook Calendar
2. **Calendar → Add calendar → Subscribe from web**
3. Paste the webcal URL
4. Click **"Subscribe"**

### **Step 4: Enjoy Automatic Updates**
- Calendar app automatically syncs every 15-30 minutes
- New panchangam data appears automatically
- No manual downloads needed
- Works across all devices

## 🚀 **Production Deployment**

### **1. Environment Variables**
```bash
# Production .env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### **2. Database Setup**
Run the fixed SQL script in your Supabase dashboard:
```sql
-- Run supabase-calendar-setup.sql
-- This creates tables, functions, and RLS policies
```

### **3. Deploy to Production**
```bash
# Deploy to Vercel, Netlify, or your preferred platform
npm run build
npm start
```

### **4. Test Production URLs**
- Main app: `https://your-domain.com`
- Calendar sync: `https://your-domain.com/api/calendar/webcal?token=test`
- Status page: `https://your-domain.com/status`

## 📊 **Monitoring & Analytics**

### **1. Real-time Monitoring**
```sql
-- Monitor subscription activity
SELECT 
  COUNT(*) as total_requests,
  COUNT(DISTINCT subscription_token) as unique_subscriptions,
  MAX(last_accessed) as last_activity
FROM calendar_subscriptions
WHERE last_accessed > NOW() - INTERVAL '1 hour';
```

### **2. User Engagement**
```sql
-- Most engaged users
SELECT 
  user_id,
  COUNT(*) as subscription_count,
  MAX(last_accessed) as last_activity,
  (SELECT calendar_name FROM user_calendar_preferences WHERE user_id = cs.user_id) as calendar_name
FROM calendar_subscriptions cs
WHERE is_active = true
GROUP BY user_id
ORDER BY last_activity DESC;
```

### **3. Performance Metrics**
```sql
-- Subscription success rate
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN last_accessed IS NOT NULL THEN 1 END) as accessed_subscriptions,
  ROUND(
    COUNT(CASE WHEN last_accessed IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate_percent
FROM calendar_subscriptions
WHERE is_active = true;
```

## 🎯 **Benefits for Users**

1. **Automatic Updates**: No manual downloads needed
2. **Cross-Platform**: Works on all devices and calendar apps
3. **Customizable**: Users can choose what events to include
4. **Real-time**: Updates every 15-30 minutes
5. **Persistent**: Subscription continues until user removes it
6. **Secure**: Each user has their own private subscription token

## 🔧 **Maintenance Tasks**

### **Daily:**
- Monitor subscription activity
- Check for failed syncs

### **Weekly:**
- Clean up inactive subscriptions
- Analyze user preferences

### **Monthly:**
- Review subscription growth
- Optimize database performance
- Update calendar event logic

This subscription system transforms your Tamil Panchangam from a static app into a dynamic, always-updated calendar service that users can rely on for their daily spiritual and astrological guidance! 🎉
