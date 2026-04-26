# TopAvenue — Luxury Hotel Booking Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<p align="center">
  A full-stack luxury hotel booking web application built with React, Vite, and Supabase. Features a modern light hotel theme, a multi-step booking wizard with add-ons, a comprehensive customer dashboard with complaints and reviews, and a real-time admin console.
</p>

---

# 🏨 Top Avenue | Full-Stack Hotel Booking System
**[Live Demo]** 👉 **[Click here to view the live deployment on Vercel](https://topavenue.vercel.app)**

---

## 📸 Screenshots

> *(Add screenshots of your Home page, Customer Dashboard, and Admin Console here)*

---

## ✨ Features

### 🌐 Public Website
- **Elegant Theme**: Light-themed homepage with a transparent-to-solid scroll navbar.
- **Dynamic Suites**: Featured Suites section pulled directly from the Supabase `rooms` table.
- **Booking Bar**: Hero section with a real-time booking bar for quick availability checks.

### 👤 Customer Portal
- **Secure Auth**: Powered by Supabase Auth with custom metadata for roles.
- **4-Step Booking Wizard**: 
  - 1. Date Selection
  - 2. Real-time Room Availability
  - 3. **Optional Add-ons** (Airport Transfer, Breakfast Buffet, Spa Access)
  - 4. Summary & Payment (Stripe integration ready)
- **My Bookings**: Full history with status badges and reference IDs.
- **Complaint System**: Register complaints for specific bookings with real-time status tracking (Open, In Progress, Resolved).
- **Room Reviews**: Write and view star-rated reviews for completed stays.
- **Extended Profile**: 14+ editable fields across Personal Info, Address, ID Verification, Emergency Contact, and Stay Preferences.

### 🛡️ Admin Console
- **Role-Based Security**: Strict access control ensuring only `role: admin` can access management features.
- **Live Stats Dashboard**: Real-time overview of Revenue, Occupancy, Active Bookings, and Open Complaints.
- **Auto-Occupancy Logic**: Rooms are automatically marked as **Occupied** if they have a confirmed booking starting today.
- **Room Management**: Full CRUD operations for rooms including price and capacity updates.
- **Complaint Resolution**: View all guest complaints and update their status in real-time.
- **Staff Management**: Add and track staff members with roles and contact info.
- **Guest Insights**: Auto-populated guest directory with booking frequency and total spend metrics.
- **Real-time Sync**: Uses Supabase Realtime to update the dashboard instantly when new bookings or reviews arrive.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 19 |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Realtime | Supabase Realtime |
| Icons | Lucide React |
| Styling | Custom CSS (CSS Variables, Light Hotel Theme) |
| Fonts | Cormorant Garamond + Inter (Google Fonts) |

---

## 🗂️ Project Structure

```
topavenue/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Scroll-aware transparent → solid navbar
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── Home.jsx            # Landing page with booking bar
│   │   ├── Login.jsx           # Split-panel login
│   │   ├── Signup.jsx          # Signup with role guards
│   │   ├── BookingFlow.jsx     # 4-step wizard with Add-ons
│   │   ├── CustomerDashboard.jsx # Portal: Bookings, Reviews, Complaints, Profile
│   │   └── AdminDashboard.jsx  # Console: Stats, Rooms, Complaints, Staff, Guests
│   ├── supabaseClient.js       # Supabase initialization
│   ├── App.jsx                 # Routes & Protected Route logic
│   ├── index.css               # Global theme & CSS variables
│   └── main.jsx
├── supabase_migration.sql      # Full database schema & RLS policies
├── package.json
└── vite.config.js
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- A Supabase account

### 1. Clone & Install
```bash
git clone https://github.com/your-username/topavenue.git
cd topavenue
npm install
```

### 2. Configure Env
Create a `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. Database Setup
Run the following SQL in your Supabase **SQL Editor** (or use `supabase_migration.sql`):

```sql
-- 1. Rooms Table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  capacity INTEGER DEFAULT 2,
  status TEXT DEFAULT 'vacant', -- vacant | occupied | maintenance
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bookings Table
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  room_id UUID REFERENCES rooms(id),
  room_name TEXT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER DEFAULT 1,
  total_price NUMERIC DEFAULT 0,
  guest_name TEXT,
  guest_email TEXT,
  status TEXT DEFAULT 'confirmed', -- confirmed | pending | cancelled | completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Reviews Table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  booking_id UUID REFERENCES bookings(id),
  room_id UUID REFERENCES rooms(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  guest_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Complaints Table
CREATE TABLE complaints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  room_id UUID REFERENCES rooms(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- open | in_progress | resolved
  guest_name TEXT,
  guest_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- (Policies available in supabase_migration.sql)
```

### 4. Set Admin Access
Update your user in the Supabase Dashboard:
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE id = 'your-user-uuid';
```

---

## 🚀 Deployment

Build the production bundle:
```bash
npm run build
```
Deploy the `dist` folder to **Vercel** or **Netlify**.

---

## 📋 Roadmap
- [ ] Stripe Payment Integration
- [ ] Supabase Storage for Room Images
- [ ] Edge Functions for Email Notifications
- [ ] Multi-language Support (i18n)
- [ ] Mobile-responsive dashboards

---

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License
MIT License.

## 👨‍💻 Author
**Shubhankar**

<p align="center">Built with ❤️ using React + Supabase</p>

