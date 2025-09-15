# 🔧 **Fix "Failed to create calendar preferences" Error**

## 🚨 **The Problem**
You're getting the error "Failed to create calendar preferences" because the database tables haven't been created yet.

## ✅ **The Solution**

### **Step 1: Set Up the Database**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `svrtefferaxnmmejwfdv`

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New query"**

3. **Copy and Run the SQL Script**
   - Open the file: `supabase-calendar-setup.sql`
   - Copy the **entire contents**
   - Paste into the SQL editor
   - Click **"Run"**

### **Step 2: Verify Database Setup**

After running the SQL script, you should see these tables created:
- ✅ `user_calendar_preferences`
- ✅ `calendar_subscriptions`
- ✅ `get_calendar_panchangam_data()` function

### **Step 3: Test the Fix**

1. **Test Database Setup**
   ```javascript
   // In your browser console
   runDatabaseTests();
   ```

2. **Test Subscription Creation**
   ```bash
   curl -X POST http://localhost:3000/api/calendar/subscription \
     -H "Content-Type: application/json" \
     -d '{"user_id":"test-user-123","calendar_name":"Test Calendar","include_auspicious_times":true,"include_inauspicious_times":true,"include_special_days":true,"include_rs_warnings":true,"include_chandrashtama":true,"date_range_days":90}'
   ```

3. **Check Admin Dashboard**
   - Visit: `http://localhost:3000/admin`
   - You should see subscription statistics

## 🎯 **How to Launch Admin Dashboard**

### **Method 1: Direct URL**
```
http://localhost:3000/admin
```

### **Method 2: From Main App**
1. Go to `http://localhost:3000`
2. Look for admin links (if any)

### **Method 3: Test All Pages**
- Main app: `http://localhost:3000`
- Status page: `http://localhost:3000/status`
- Test page: `http://localhost:3000/calendar-test`
- Admin dashboard: `http://localhost:3000/admin`

## 🧪 **Testing the Complete System**

### **1. Test Database Setup**
```javascript
// In browser console
runDatabaseTests();
```

### **2. Test Subscription Creation**
```javascript
// In browser console
testCreateSubscription();
```

### **3. Test Calendar Sync**
1. Go to `http://localhost:3000`
2. Click "📅 Calendar Sync" button
3. Configure preferences
4. Create subscription
5. Copy webcal URL
6. Add to your calendar app

## 📊 **What the Admin Dashboard Shows**

Once the database is set up, the admin dashboard will display:

- **📊 Statistics Cards**
  - Total subscriptions
  - Active subscriptions
  - Accessed today
  - Success rate

- **📋 Recent Subscriptions Table**
  - Subscription tokens
  - Status (Active/Inactive/Stale)
  - Created date
  - Last accessed
  - Copy URL button

- **⚙️ User Preferences**
  - Calendar names
  - Event preferences
  - Date ranges

- **🔧 Quick Actions**
  - Refresh data
  - App status
  - Test calendar

## 🚨 **Troubleshooting**

### **If you still get errors:**

1. **Check Supabase Connection**
   ```javascript
   // In browser console
   console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
   ```

2. **Verify Environment Variables**
   - Check `.env.local` file exists
   - Verify Supabase URL and key are correct
   - Restart the development server

3. **Check Database Tables**
   ```sql
   -- Run in Supabase SQL editor
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('user_calendar_preferences', 'calendar_subscriptions');
   ```

4. **Check Function Exists**
   ```sql
   -- Run in Supabase SQL editor
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name = 'get_calendar_panchangam_data';
   ```

## 🎉 **Expected Result**

After fixing the database setup:

1. ✅ **Subscription creation works**
2. ✅ **Admin dashboard shows data**
3. ✅ **Calendar sync feature works**
4. ✅ **Users can create subscriptions**
5. ✅ **Calendar apps can sync automatically**

## 📱 **Next Steps**

1. **Set up the database** using the SQL script
2. **Test the subscription system** using the test scripts
3. **Launch the admin dashboard** to monitor usage
4. **Test calendar integration** with your calendar app
5. **Deploy to production** when ready

The error will be completely resolved once you run the database setup script! 🚀
