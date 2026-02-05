# 🌿 ReTexValue - Smart Textile Waste to Value Platform

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646cff?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase)](https://supabase.com/)

> **Transform textile waste into digital assets** - A comprehensive B2B marketplace connecting textile factories with buyers through AI-powered classification and sustainable trading.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Database Setup](#-database-setup)
- [Premium Packages](#-premium-packages-new)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ReTexValue** is a full-stack web application that revolutionizes textile waste management by creating a digital marketplace where:

- 🏭 **Factories** upload and monetize their textile waste
- 🛒 **Buyers** discover and purchase recycled materials at competitive prices
- 👨‍💼 **Admins** oversee platform operations, approve listings, and manage users
- 🤖 **AI** automatically classifies materials and estimates values

The platform promotes **circular economy** principles by tracking environmental impact (CO2 savings, water conservation) and providing transparent pricing.

---

## ✨ Features

### 🏭 For Factories

- **AI-Powered Upload**: Drag-and-drop image upload with automatic textile classification
- **Inventory Management**: Real-time dashboard for all listings
- **Bulk Request Responses**: Submit proposals for buyer requests
- **Analytics**: Track sales, revenue, and environmental impact
- **Secure Payments**: Integrated Razorpay payment gateway

### 🛒 For Buyers

- **Smart Marketplace**: Browse verified listings with advanced filters
- **Bulk Requests**: Post requirements and receive competitive quotes
- **Proposal Comparison**: Review and accept factory proposals
- **Order Tracking**: Monitor purchase history and status
- **Analytics Dashboard**: Spending insights and purchase trends

### 👨‍💼 For Admins

- **User Management**: Approve, reject, or block users
- **Listing Approvals**: Review and approve factory uploads
- **Package Management**: Create and manage subscription plans (NEW!)
- **Platform Analytics**: User growth, revenue, transaction trends
- **Bulk Request Monitoring**: Oversee B2B trading activity
- **Reports & Logs**: Generate comprehensive platform reports

### 🤖 AI Features

- **Material Classification**: Identify fabric type, grade, and quality
- **Value Estimation**: AI-powered price recommendations
- **Environmental Impact**: Calculate CO2 and water savings
- **Contamination Detection**: Quality assessment

---

## 🛠️ Tech Stack

| Category             | Technologies                                   |
| -------------------- | ---------------------------------------------- |
| **Frontend**         | React 19, Vite, React Router v7                |
| **Styling**          | Tailwind CSS v4, Lucide Icons, Framer Motion   |
| **Backend**          | Supabase (PostgreSQL, Authentication, Storage) |
| **State Management** | React Context API                              |
| **Payments**         | Razorpay                                       |
| **Build Tools**      | Vite, PostCSS, ESBuild                         |
| **Dev Tools**        | ESLint, Prettier                               |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ReTexValue.git
cd ReTexValue

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database migrations
# See "Database Setup" section below

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Note your project URL and API keys

### Step 2: Run Migration Scripts

Execute these SQL files in order via **Supabase Dashboard → SQL Editor**:

#### A. Core Tables (if using existing schema)

```sql
-- Run initial schema migrations
-- Your existing tables: profiles, listings, transactions, etc.
-- If transactions table doesn't exist, run:
-- Execute: create_transactions_table.sql
```

#### B. Premium Packages (NEW Feature)

```sql
-- 1. Create packages table with sample data
-- Execute: packages_schema.sql
```

```sql
-- 2. Set up Row Level Security policies
-- Execute: packages_rls_policies.sql
```

**Important**: The RLS policies are **required** for the public packages page to work.

### Step 3: Verify Setup

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check packages data
SELECT name, price, status FROM packages;

-- Verify RLS policies
SELECT * FROM pg_policies WHERE tablename = 'packages';
```

---

## 📦 Premium Packages (NEW!)

### Overview

The Premium Packages feature allows admins to create subscription tiers that are displayed publicly on the `/packages` route.

### Features

✅ **Admin Management** (`/admin/packages`)

- Create, edit, delete packages
- Set pricing, duration, and features
- Toggle featured status
- Manage package limits (listings, AI credits, bulk requests)

✅ **Public Display** (`/packages`)

- Beautiful pricing cards
- Featured package highlighting
- Responsive design
- Dark mode support

### Package Creation

**Admin Panel:**

```
1. Login as admin
2. Navigate to /admin/packages
3. Click "Add Package"
4. Fill form:
   - Name, Price, Duration
   - Max Listings, AI Credits
   - Features list
   - Badge color, Featured toggle
5. Click "Create Package"
```

**Sample Package Structure:**

```javascript
{
  name: "Professional",
  price: 999,
  durationDays: 30,
  maxListings: 50,
  aiCredits: 100,
  prioritySupport: true,
  isFeatured: true,
  features: [
    "50 Listings per month",
    "Advanced AI Classification",
    "Priority Support"
  ]
}
```

### Security (RLS Policies)

The packages feature uses Row Level Security:

- ✅ **Public users** can view active packages
- ✅ **Authenticated users** can view all packages
- ✅ **Only admins** can create/edit/delete packages

**If packages don't show on `/packages`:**

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
ON packages FOR SELECT
USING (status = 'active');

-- See packages_rls_policies.sql for complete policies
```

---

## 📁 Project Structure

```
ReTexValue/
├── src/
│   ├── assets/              # Images and static files
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx       # Main navigation
│   │   ├── Footer.jsx       # Site footer
│   │   ├── Avatar.jsx       # User avatar with fallback
│   │   ├── AdminSidebar.jsx # Admin navigation
│   │   └── *Layout.jsx      # Layout wrappers
│   ├── context/
│   │   └── AppContext.jsx   # Global state management
│   ├── lib/
│   │   ├── supabase.js      # Supabase client
│   │   └── ai.js            # AI classification engine
│   ├── pages/
│   │   ├── Landing.jsx      # Homepage
│   │   ├── Packages.jsx     # Public pricing page (NEW)
│   │   ├── admin/           # Admin pages (8 pages)
│   │   │   └── ManagePackages.jsx  # Package CRUD (NEW)
│   │   ├── buyer/           # Buyer pages (8 pages)
│   │   └── factory/         # Factory pages (8 pages)
│   ├── App.jsx              # Main app & routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── packages_schema.sql      # Database table creation (NEW)
├── packages_rls_policies.sql # Security policies (NEW)
├── .env                     # Environment variables
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 👥 User Roles

### 🏭 Factory

**Access**: `/factory/*`

- Upload textile waste with images
- View inventory and sales analytics
- Submit proposals for bulk requests
- Manage profile and settings

### 🛒 Buyer

**Access**: `/buyer/*`

- Browse marketplace listings
- Purchase materials
- Create bulk requests
- Review and accept proposals
- Track orders

### 👨‍💼 Admin

**Access**: `/admin/*`

- Approve/reject user registrations
- Review and approve listings
- Manage packages (NEW)
- Monitor bulk requests
- View platform analytics
- Generate reports
- Configure platform settings

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key

# Database (for backend operations)
DATABASE_URL=your_postgres_connection_string

# Supabase Service Role (admin operations)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay (Payment Gateway)
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
# VITE_RAZORPAY_KEY_SECRET=backend_only
```

**Security Note**: Never commit `.env` to version control. The `VITE_` prefix exposes variables to the frontend, so only use it for public keys.

---

## 🎨 Key Features Explained

### 🌙 Dark Mode

Toggle between light and dark themes via navbar. Theme preference is persisted in localStorage.

### 🔒 Protected Routes

Role-based routing ensures users only access authorized pages:

```javascript
<ProtectedRoute role="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### ⚡ Optimistic Updates

UI updates immediately while database syncs in the background for better UX.

### 📱 Responsive Design

Mobile-first approach with breakpoints for tablets and desktops.

### 🤖 AI Classification

Simulated AI (can be replaced with real ML model):

- Analyzes uploaded images
- Classifies fabric type and grade
- Estimates market value
- Calculates environmental impact

### 💳 Payment Integration

Razorpay modal for secure transactions with order tracking.

---

## 🐛 Troubleshooting

### Issue: Packages Don't Show on Public Page

**Symptom**: Admin can create packages, but `/packages` shows "Packages Coming Soon"

**Cause**: Row Level Security policies not applied

**Fix**:

```sql
-- Run packages_rls_policies.sql in Supabase SQL Editor
-- This enables public read access to active packages
```

**Verify**:

```bash
# Open browser console (F12) and check for:
✅ [fetchPackages] Fetched X packages from Supabase

# If you see error code 42501:
❌ RLS policies not applied - run the SQL file
```

### Issue: Infinite Loading on Login

**Symptom**: App shows loading spinner indefinitely

**Cause**: Supabase project paused or timeout

**Fix**:

1. Check Supabase dashboard - unpause project if needed
2. The app has 10-second timeout and offline mode as fallback
3. Check browser console for specific error

### Issue: Avatar Not Updating

**Symptom**: Profile picture doesn't change after upload

**Cause**: Browser cache

**Fix**: Hard refresh (`Ctrl+Shift+R`) or wait for cache-busting

### Issue: Cannot Create Listings

**Symptom**: Upload fails or hangs

**Fix**:

1. Check Supabase Storage buckets exist: `avatars`, `products`
2. Verify bucket permissions allow authenticated uploads
3. Check file size limits

### Database Connection Issues

**Symptom**: "Failed to fetch" errors

**Fix**:

```bash
# 1. Verify .env variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_KEY

# 2. Check Supabase project status
# Visit: https://app.supabase.com

# 3. Test connection
# Browser console should show:
✅ Connected to Supabase
```

---

## 🎯 Development Tips

### Running Development Server

```bash
npm run dev
# App runs on http://localhost:5173
# Hot Module Replacement enabled
```

### Code Organization

- **Components**: Reusable UI elements in `/components`
- **Pages**: Route-specific views in `/pages`
- **Context**: Global state in `AppContext.jsx`
- **Utilities**: Helper functions in `/lib`

### State Management

All global state is managed via `AppContext`:

```javascript
const { user, packages, listings, addPackage } = useApp();
```

### Adding New Features

1. Create page component in appropriate folder
2. Add route in `App.jsx`
3. Update sidebar navigation if needed
4. Add API functions to `AppContext.jsx`

---

## 📊 Database Tables

### Core Tables

- `profiles` - User information and roles
- `listings` - Factory inventory uploads
- `transactions` - Purchase records
- `bulk_requests` - Buyer requirements
- `proposals` - Factory quotes
- `packages` - Subscription plans (NEW)

### Storage Buckets

- `avatars` - User profile pictures
- `products` - Listing images

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder via Netlify dashboard
```

### Environment Variables

Remember to set all `VITE_*` variables in your hosting platform's environment settings.

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use ESLint configuration provided
- Follow existing naming conventions
- Add comments for complex logic
- Write meaningful commit messages

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

**Your Team Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- **Supabase** for backend infrastructure
- **Tailwind CSS** for styling framework
- **Lucide** for beautiful icons
- **Razorpay** for payment processing
- All contributors and testers

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ReTexValue/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ReTexValue/discussions)
- **Email**: support@retexvalue.com

---

## 🗺️ Roadmap

### Completed ✅

- User authentication & role-based access
- Factory inventory management
- AI-powered classification
- Marketplace with filters
- Bulk request system
- Admin dashboard
- Premium packages feature
- Dark mode
- Razorpay integration

### In Progress 🚧

- Real ML model integration
- Email notifications
- Advanced analytics
- Mobile app

### Planned 🔮

- API for third-party integrations
- Multi-language support
- Advanced search with Elasticsearch
- Blockchain for supply chain tracking
- Carbon credit marketplace

---

<div align="center">

**Made with 💚 for a sustainable future**

[⭐ Star us on GitHub](https://github.com/yourusername/ReTexValue) | [🐛 Report Bug](https://github.com/yourusername/ReTexValue/issues) | [💡 Request Feature](https://github.com/yourusername/ReTexValue/issues)

</div>
