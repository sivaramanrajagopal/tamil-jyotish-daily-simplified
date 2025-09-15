# 📅 Tamil Panchangam Calendar Sync Implementation

This document provides a comprehensive guide to the ICS calendar sync functionality implemented for the Tamil Panchangam application.

## 🌟 Features

### Core Calendar Events
- **Daily Nakshatra Information** - Current nakshatra with yogam details
- **Special Days** - Amavasai, Pournami, Ekadashi, Dwadashi, Ashtami, Navami
- **Auspicious Times** - Abhijit Muhurta periods
- **Inauspicious Times** - Rahu Kalam, Yamagandam, Kuligai
- **RS Nakshatra Warnings** - Days to avoid medical/travel/financial activities
- **Chandrashtama Warnings** - Inauspicious periods for specific nakshatras

### Cross-Platform Support
- **Desktop**: Outlook, Apple Calendar, Google Calendar
- **Mobile**: iOS Calendar, Android Calendar, Samsung Calendar
- **Web**: Google Calendar, Outlook Web

### Subscription Features
- **Webcal Protocol** - Real-time calendar updates
- **Custom Date Ranges** - 3 months to 2 years
- **Event Filtering** - Choose which types of events to sync
- **User Preferences** - Personalized calendar settings

## 🏗️ Architecture

### API Endpoints

#### 1. ICS Calendar Export (`/api/calendar/ics`)
- **Purpose**: Generate downloadable ICS calendar files
- **Method**: GET
- **Parameters**:
  - `start_date` (optional): Start date for calendar (default: today)
  - `end_date` (optional): End date for calendar (default: 1 year from start)
  - `include_auspicious` (optional): Include auspicious times (default: true)
  - `include_inauspicious` (optional): Include inauspicious times (default: true)
  - `include_special_days` (optional): Include special days (default: true)
  - `include_rs_warnings` (optional): Include RS nakshatra warnings (default: true)
  - `include_chandrashtama` (optional): Include chandrashtama warnings (default: true)
  - `calendar_name` (optional): Name for the calendar (default: "Tamil Panchangam")

#### 2. Webcal Subscription (`/api/calendar/webcal`)
- **Purpose**: Real-time calendar subscription via webcal:// protocol
- **Method**: GET
- **Parameters**: Same as ICS endpoint, plus:
  - `token` (optional): User subscription token for personalized preferences

#### 3. Subscription Management (`/api/calendar/subscription`)
- **Purpose**: Manage user calendar subscriptions and preferences
- **Methods**: POST, GET, PUT, DELETE
- **Features**:
  - Create new subscriptions
  - Update preferences
  - Delete subscriptions
  - Get subscription details

### Database Schema

#### Tables Added

1. **user_calendar_preferences**
   ```sql
   - id: UUID (Primary Key)
   - user_id: UUID (Foreign Key to profiles)
   - calendar_name: TEXT
   - include_auspicious_times: BOOLEAN
   - include_inauspicious_times: BOOLEAN
   - include_special_days: BOOLEAN
   - include_rs_warnings: BOOLEAN
   - include_chandrashtama: BOOLEAN
   - date_range_days: INTEGER
   - created_at: TIMESTAMPTZ
   - updated_at: TIMESTAMPTZ
   ```

2. **calendar_subscriptions**
   ```sql
   - id: UUID (Primary Key)
   - user_id: UUID (Foreign Key to profiles)
   - subscription_token: TEXT (Unique)
   - is_active: BOOLEAN
   - last_accessed: TIMESTAMPTZ
   - created_at: TIMESTAMPTZ
   ```

## 🚀 Setup Instructions

### 1. Database Setup

Run the SQL script in your Supabase SQL editor:

```bash
# Execute the setup script
psql -h your-supabase-host -U postgres -d postgres -f supabase-calendar-setup.sql
```

Or copy and paste the contents of `supabase-calendar-setup.sql` into your Supabase SQL editor.

### 2. Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3. Component Integration

The `CalendarSync` component has been integrated into the main page. It provides:

- **Calendar Sync Button** - Opens the calendar management modal
- **Subscription Creation** - Set up new calendar subscriptions
- **Preference Management** - Customize which events to include
- **URL Generation** - Get webcal and ICS URLs for calendar apps

## 📱 Usage Instructions

### For Users

#### Creating a Calendar Subscription

1. Click the "📅 Calendar Sync" button on the main page
2. Configure your preferences:
   - Calendar name
   - Event types to include
   - Date range
3. Click "Create Calendar Subscription"
4. Copy the generated URLs to your calendar app

#### Mobile Calendar Setup

**iOS Calendar:**
1. Settings → Calendar → Accounts
2. Add Account → Other
3. Add Subscribed Calendar
4. Paste the webcal URL

**Android Calendar:**
1. Open Calendar app
2. Settings → Import calendar
3. From URL
4. Paste the webcal URL

#### Desktop Calendar Setup

**Google Calendar:**
1. Google Calendar → Settings
2. Import & Export → From URL
3. Paste the webcal URL

**Outlook:**
1. Calendar → Add calendar
2. Subscribe from web
3. Paste the webcal URL

**Apple Calendar (Mac):**
1. File → New Calendar Subscription
2. Paste the webcal URL

### For Developers

#### API Usage Examples

**Download ICS File:**
```javascript
const params = new URLSearchParams({
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  include_auspicious: 'true',
  include_inauspicious: 'true',
  include_special_days: 'true',
  calendar_name: 'My Tamil Panchangam'
});

const url = `/api/calendar/ics?${params}`;
window.open(url, '_blank');
```

**Create Subscription:**
```javascript
const response = await fetch('/api/calendar/subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user-uuid',
    calendar_name: 'My Calendar',
    include_auspicious_times: true,
    include_inauspicious_times: true,
    include_special_days: true,
    include_rs_warnings: true,
    include_chandrashtama: true,
    date_range_days: 365
  })
});

const data = await response.json();
console.log('Webcal URL:', data.webcal_url);
```

## 🎨 Event Categories and Colors

The calendar events are categorized and color-coded:

- **🟢 Auspicious Times** (Green) - Abhijit Muhurta
- **🔴 Inauspicious Times** (Red) - Rahu Kalam, Yamagandam, Kuligai
- **🔴 Warnings** (Red) - RS Nakshatra, Chandrashtama
- **🔵 Special Days** (Blue) - Amavasai, Pournami, Ekadashi, etc.
- **🟣 Nakshatra** (Purple) - Daily nakshatra information

## 🔧 Customization

### Adding New Event Types

To add new event types, modify the `generateDayEvents` function in the API endpoints:

```javascript
// Add new event type
if (options.include_new_events && day.new_event_data) {
  events.push(generateEvent(
    '🆕 New Event Title',
    'New event description',
    dateStr,
    dateStr,
    true,
    'NEW_CATEGORY'
  ));
}
```

### Modifying Event Colors

Update the color mapping in the `generateEvent` function:

```javascript
switch (category) {
  case 'NEW_CATEGORY':
    event += 'COLOR:orange\n';
    break;
  // ... existing cases
}
```

## 🧪 Testing

### Test Calendar URLs

**Sample ICS Download:**
```
/api/calendar/ics?start_date=2025-01-01&end_date=2025-01-31&calendar_name=Test%20Calendar
```

**Sample Webcal Subscription:**
```
webcal://your-domain.com/api/calendar/webcal?include_auspicious=true&include_inauspicious=true
```

### Validation

Test the generated ICS files using:
- [ICS Validator](https://icalendar.org/validator.html)
- Calendar applications (Outlook, Apple Calendar, Google Calendar)

## 🚨 Troubleshooting

### Common Issues

1. **Calendar not updating**
   - Check if webcal URL is correct
   - Verify subscription token is valid
   - Ensure calendar app supports webcal protocol

2. **Events not showing**
   - Verify date range includes current date
   - Check if event types are enabled in preferences
   - Ensure panchangam data exists for the date range

3. **Permission errors**
   - Verify RLS policies are correctly set up
   - Check user authentication
   - Ensure proper database permissions

### Debug Mode

Enable debug logging by adding to your API endpoints:

```javascript
console.log('Panchangam data:', panchangamData);
console.log('Generated events:', events);
```

## 📈 Performance Considerations

- **Caching**: Webcal endpoints cache for 1 hour
- **Date Ranges**: Limit to reasonable ranges (max 2 years)
- **Event Limits**: Consider pagination for large date ranges
- **Database Indexes**: Ensure proper indexing on date columns

## 🔒 Security

- **RLS Policies**: Row-level security enabled on all tables
- **Token Validation**: Subscription tokens are validated
- **Input Sanitization**: All user inputs are sanitized
- **Rate Limiting**: Consider implementing rate limiting for API endpoints

## 🚀 Future Enhancements

### Planned Features

1. **Push Notifications** - Real-time event notifications
2. **Multiple Calendars** - Separate calendars for different event types
3. **Custom Reminders** - User-defined reminder settings
4. **Export Formats** - Support for other calendar formats (CSV, JSON)
5. **Analytics** - Track calendar usage and popular events
6. **Bulk Operations** - Manage multiple subscriptions
7. **Templates** - Pre-configured calendar templates

### Integration Opportunities

1. **Google Calendar API** - Direct integration with Google Calendar
2. **Outlook API** - Direct integration with Microsoft Outlook
3. **Apple Calendar** - Integration with Apple's Calendar app
4. **Third-party Apps** - Integration with popular calendar apps

## 📞 Support

For issues or questions regarding the calendar sync functionality:

1. Check this documentation first
2. Review the API endpoint logs
3. Test with sample URLs
4. Verify database setup and permissions

## 📄 License

This calendar sync implementation is part of the Tamil Panchangam application and follows the same licensing terms.
