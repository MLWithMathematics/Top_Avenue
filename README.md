# TopAvenue — Luxury Hotel Booking Platform

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<p align="center">
  A full-stack luxury hotel booking web application built with React, Vite, and Supabase. Features a modern light hotel theme, a customer booking dashboard with room reviews, and a fully secured admin console with real-time booking management.
</p>

---

# 🏨 Top Avenue | Full-Stack Hotel Booking System
**[Live Demo]👉 **[Click here to view the live deployment on Vercel](https://topavenue.vercel.app)** | 

---
## 📸 Screenshots

> *(Add screenshots of your Home page, Customer Dashboard, and Admin Console here)*

---

## ✨ Features

### 🌐 Public Website
- Elegant light-themed homepage with a transparent-to-solid scroll navbar
- Hero section with a prominent booking bar (check-in, check-out, guests)
- Featured Suites section pulled from the Supabase `rooms` table
- "Why Book Direct" perks section
- Guest testimonials / reviews display
- CTA banner and site footer with navigation links

### 👤 Customer Portal
- **Secure authentication** via Supabase Auth (sign up, log in, email confirmation)
- **My Bookings** — full booking history with status badges and booking reference IDs
- **Room Reviews** — write star-rated reviews for confirmed/completed stays directly from the dashboard
- **My Reviews** — view all submitted reviews in one place
- **Extended Profile** — 14 editable fields across 5 sections:
  - Personal Information (name, phone, DOB, gender, nationality)
  - Address (street, city, state, country)
  - ID & Verification (ID type + masked ID number)
  - Emergency Contact
  - Stay Preferences (dietary needs, special requests)

### 🛡️ Admin Console
- **Role-based access control** — only accounts with `role: admin` in Supabase can access `/admin`
- **Access Denied** screen for all non-admin users
- **Real-time booking feed** via Supabase Realtime subscriptions
- **Overview** — live stats (revenue, occupancy rate, active bookings, unique guests) + recent bookings table
- **Room Management** — add rooms (name, description, price, capacity, status) and delete existing ones
- **Guests Page** — auto-populated from booking data (name, email, booking count, total spent, last stay)
- **Payment Ledger** — full payment record across all bookings
- **Staff Management** — add and remove staff members (name, role, email, phone)

### 🔐 Security
- Admin dashboard is server-side role-checked on every load
- `/signup` route includes a guard — if an admin session is active it redirects to the admin panel, preventing new admin account creation via the UI
- No public path can access the admin dashboard without valid admin credentials

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
│   │   ├── Home.jsx            # Landing page with booking bar & sections
│   │   ├── Home.css
│   │   ├── Login.jsx           # Split-panel login with eye-toggle
│   │   ├── Signup.jsx          # Split-panel signup with validation
│   │   ├── BookingFlow.jsx     # 4-step booking wizard
│   │   ├── CustomerDashboard.jsx  # Customer portal (bookings, reviews, profile)
│   │   ├── AdminDashboard.jsx     # Admin console (rooms, guests, staff, payments)
│   │   └── WhyBookDirect.jsx
│   ├── supabaseClient.js       # Supabase client initialisation
│   ├── App.jsx                 # Routes + SignupGuard
│   ├── App.css
│   ├── index.css               # Global CSS variables & utility classes
│   └── main.jsx
├── .env                        # Supabase credentials (never commit this)
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Supabase](https://supabase.com) account and project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/topavenue.git
cd topavenue
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> Find these in your Supabase project under **Settings → API**.

### 4. Set up the database

Run the following SQL in your Supabase **SQL Editor**:

```sql
-- Rooms table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  capacity INTEGER DEFAULT 2,
  status TEXT DEFAULT 'vacant',  -- vacant | occupied | maintenance
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
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
  status TEXT DEFAULT 'confirmed',  -- confirmed | pending | cancelled | completed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
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

-- Enable Row Level Security
ALTER TABLE rooms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews  ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Rooms are public" ON rooms FOR SELECT USING (true);
CREATE POLICY "Admins manage rooms" ON rooms FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users see own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create bookings"  ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins see all bookings" ON bookings FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users see own reviews"   ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create reviews"    ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 5. Create an Admin account

In **Supabase → Authentication → Users**, create a new user, then run:

```sql
-- Replace with your admin user's UUID
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE id = 'your-admin-user-uuid-here';
```

> Once set, this admin account is the only way to access `/admin`. No new admin accounts can be created via the UI.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment

### Build for production

```bash
npm run build
```

The output goes to the `dist/` folder — deploy to **Vercel**, **Netlify**, or any static host.

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Set your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in the Vercel dashboard.

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 📋 Roadmap

- [ ] Stripe payment gateway integration
- [ ] Real room images with Supabase Storage
- [ ] Email confirmation on booking via Supabase Edge Functions
- [ ] Room availability calendar view
- [ ] Admin booking status management (approve / cancel)
- [ ] Multi-language support (i18n)
- [ ] Mobile-responsive sidebar for dashboards

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Shubhankar**
- GitHub: [@your-username](https://github.com/your-username)

---

<p align="center">
  Built with ❤️ using React + Supabase
</p>
