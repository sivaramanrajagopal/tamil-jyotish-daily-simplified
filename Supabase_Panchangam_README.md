
# 📘 Supabase Panchangam Database Documentation

This document outlines the database structure, key scripts, and usage queries for the Panchangam-based astrology app using Supabase.

---

## 🗓️ Table: `daily_panchangam`

Stores daily Panchangam elements and related attributes for user scoring and personalized predictions.

### 🔧 Columns
- `id`: UUID, primary key
- `date`: Date, unique
- `vaara`: Weekday
- `sunrise`, `sunset`, `moonrise`, `moonset`: Timestamp
- `nakshatra`, `tithi`, `karana`, `yoga`: JSONB with start/end timings
- `main_nakshatra`: Text
- `cosmic_score`: Integer
- `user_specific_score`: JSONB
- `tarabalam_type`: Text
- `rahu_kalam`, `yamagandam`, `kuligai`, `abhijit_muhurta`: String timings
- `is_amavasai`, `is_pournami`, `is_mythra_muhurtham`: Boolean flags
- `chandrashtama_for`: JSONB of affected Nakshatras

### 📌 Sample Queries
```sql
SELECT * FROM daily_panchangam WHERE date = CURRENT_DATE;

SELECT date, main_nakshatra, chandrashtama_for FROM daily_panchangam
WHERE chandrashtama_for::text LIKE '%Rohini%' ORDER BY date ASC;

UPDATE daily_panchangam
SET kuligai = '7:30 AM - 9:00 AM'
WHERE EXTRACT(DOW FROM date) = 5;  -- Friday
```

---

## 👤 Table: `profiles`

Stores user profile details linked to Supabase Auth.

### 🔧 Columns
- `id`: UUID (same as Auth user ID)
- `name`, `email`
- `xp`: Gamification experience points
- `streak`: Daily learning streak
- `completed_nakshatras`: Array of strings
- `last_login`, `created_at`, `updated_at`: Timestamps
- `institute_id`: Foreign key to `institutes`

### 📌 Sample Queries
```sql
SELECT name, xp, streak FROM profiles ORDER BY xp DESC;

UPDATE profiles SET streak = 0 WHERE id = 'user-uuid';
```

---

## 🧠 Table: `quiz_attempts`

Tracks quiz submissions for gamified learning.

### 🔧 Columns
- `id`: UUID, primary key
- `user_id`: FK to `profiles`
- `quiz_type`: Type of quiz attempted
- `score`, `total_questions`, `duration_seconds`
- `created_at`: Timestamp

### 📌 Sample Queries
```sql
SELECT * FROM quiz_attempts WHERE user_id = 'user-uuid' ORDER BY created_at DESC;

SELECT AVG(score) FROM quiz_attempts WHERE quiz_type = 'nakshatra_rasi';
```

---

## 🌟 Table: `nakshatra_progress`

Tracks user learning progress on each Nakshatra.

### 🔧 Columns
- `user_id`, `nakshatra_id`
- `proficiency_level`: 1 to 5
- `completed`: Boolean
- `last_reviewed`, `created_at`, `updated_at`

### 📌 Sample Queries
```sql
SELECT * FROM nakshatra_progress WHERE user_id = 'user-uuid';

UPDATE nakshatra_progress SET proficiency_level = 3 WHERE nakshatra_id = 'அசுவினி';
```

---

## 🏫 Tables: Institutes

Includes:
- `institutes`
- `institute_admins`
- `institute_members`

Supports institutional access and team plans.

---

## ⚙️ Functions & Triggers

### ✅ `handle_new_user()`
Auto-creates a profile when a new user signs up.

### ✅ `update_user_streak()`
Updates learning streak when `daily_streaks` entry is created.

### ✅ `update_user_xp()`
Calculates XP from quiz score.

### ✅ `get_weekday_timings(day_name TEXT)`
Returns Rahu Kalam, Yamagandam, Kuligai, and Abhijit Muhurta based on day name.

### ✅ `get_nakshatra_yogam(nakshatra_name, day_name)`
Returns daily Yogam for given Nakshatra.

---

## 🧮 Views

### `leaderboards`
Ranks users based on XP, streak, and completed Nakshatras.

### `panchangam_with_yogam`
Returns `daily_panchangam` with dynamically calculated Nakshatra Yogam.

---

## 🔐 Row-Level Security (RLS)

RLS is **enabled** on all major tables.  
Policies allow users to:
- View & update their own profile
- Insert & view their own quiz attempts and progress
- Institute admins can manage members and institute settings

---

## 🧪 Sample Debug Queries

```sql
-- Get today's Yogam:
SELECT date, main_nakshatra, get_nakshatra_yogam(main_nakshatra, TO_CHAR(date, 'Day')) AS yogam
FROM daily_panchangam
WHERE date = CURRENT_DATE;

-- View upcoming 7 days
SELECT * FROM panchangam_with_yogam
WHERE date >= CURRENT_DATE AND date < CURRENT_DATE + INTERVAL '7 days';

-- Check column structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'daily_panchangam';
```

---

📁 This README is version-controlled and can be checked into your Git repo for future reference and collaboration.

