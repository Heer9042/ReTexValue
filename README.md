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
- [Factory Approval System](#-factory-approval-system)
- [Email Configuration](#-email-configuration)
- [Form Validation](#-form-validation)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Environment Variables](#-environment-variables)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [Architecture Updates](#-architecture-updates)

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

### Step 2: Run Migration Script

**Execute the consolidated database.sql file:**

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire content of `database.sql`
3. Paste and run the script
4. Verify success messages in the output

**What this script does:**
- ✅ Sets up factory approval system with verification_status
- ✅ Creates RLS policies for security
- ✅ Sets up packages, transactions, bulk_requests tables
- ✅ Configures storage buckets
- ✅ Creates triggers for auto-verification
- ✅ Grants necessary permissions

### Step 3: Verify Setup

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Verify factory verification system
SELECT role, verification_status, COUNT(*) 
FROM profiles 
GROUP BY role, verification_status;
```

---

## 🏭 Factory Approval System

### Overview

The platform includes a complete factory seller approval workflow:

- **Registration**: When users register as sellers, they are marked as `unverified`
- **Login Blocking**: Unverified factories cannot login until approved
- **Admin Approval**: Admins review and approve factory registrations at `/admin/factory-registrations`
- **Email Notification**: Factories receive approval confirmation

### Workflow

1. **User Registration** (`/register`)
   - User checks "I want to register as a Seller"
   - Role set to `factory`, verification_status set to `unverified`
   - Confirmation screen shows "pending approval" message

2. **Login Attempt** (`/login`)
   - Unverified factories see: "Your seller account is pending admin approval"
   - Automatically signed out
   - Must wait for admin approval

3. **Admin Review** (`/admin/factory-registrations`)
   - View all pending factory registrations
   - Filter by unverified/verified status
   - Search by name, email, company
   - Click "Approve" to verify a factory
   - Optional: Add approval notes

4. **Post-Approval**
   - verification_status changed to `verified`
   - Factory can now login normally
   - Full access to factory dashboard

### Technical Implementation

**Database Fields:**
- `verification_status`: 'unverified' | 'verified' (only 2 states)
- `is_verified`: boolean flag
- `verified_at`: timestamp of approval

**RLS Policies:**
- Users can only view/update their own profiles
- Admin authorization handled at application level (not in RLS to avoid recursion)

---

## 📧 Email Configuration

### Supabase Email Setup

By default, Supabase sends confirmation emails. To ensure they work properly:

#### Step 1: Enable Email Confirmations

1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. Enable **"Enable email confirmations"**

#### Step 2: Configure Email Templates

1. Navigate to **Authentication** → **Email Templates**
2. Customize **"Confirm signup"** template:

```html
<h2>Welcome to ReTexValue!</h2>
<p>Click below to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>Join the circular economy revolution! 🌿</p>
```

#### Step 3: Production SMTP (Recommended)

For production, use custom SMTP to avoid rate limits:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Enable **Custom SMTP**
3. Configure your provider (Gmail, SendGrid, AWS SES):

**Gmail Example:**
```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: [app-password]
Sender: your-email@gmail.com
```

**Note**: For Gmail, create an App Password in Google Account settings.

#### Step 4: Configure URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: Your deployment URL
3. Add **Redirect URLs**:
   - `https://yourdomain.com/login`
   - `http://localhost:5173/**` (for development)

### Troubleshooting Email Issues

**Problem**: Emails not arriving

**Solutions**:
- Check spam/junk folder
- Verify Supabase email rate limits (free tier is limited)
- Check **Logs** → **Auth Logs** in Supabase
- Confirm email provider is enabled in Auth settings

**Development Only**: To skip email verification during development:
- Disable "Enable email confirmations" in Auth settings
- ⚠️ Only use in development!

---

## ✅ Form Validation

All major forms include comprehensive client-side validation:

### Contact Form (`/contact`)
- **Name**: Min 2 chars, letters only
- **Email**: Valid email format
- **Message**: 10-1000 chars with counter
- Real-time error display

### Bulk Request Form (`/buyer/bulk-request`)
- **Quantity**: 0-10,000,000 kg
- **Target Price**: Optional, max ₹100,000/kg
- **Deadline**: Must be future date
- **Description**: 10-500 chars with counter
- Instant validation on change

### Submit Proposal Form (`/factory/submit-proposal`)
- **Price**: Required, max ₹10,000/kg
- **Delivery Date**: Cannot be past, must be before deadline
- **Message**: 5-500 chars with counter
- Date validation with buyer deadline checks

### Features
- ✅ Real-time error clearing on input
- ✅ Visual feedback (red borders)
- ✅ Character counters
- ✅ Form submission blocking if invalid
- ✅ Comprehensive error messages

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

## � Architecture Updates

### Database-Direct Architecture

The platform has transitioned from localStorage caching to real-time database architecture:

**Key Changes:**
- ✅ Removed all localStorage caching (14 instances)
- ✅ Fixed infinite loop bug with `realtimeInitialized` flag
- ✅ Implemented Supabase real-time subscriptions for:
  - `profiles` table
  - `listings` table
  - `bulk_requests` table
  - `transactions` table
- ✅ Added optimistic UI updates with error rollback

### Data Fetching Pattern

Every page follows this pattern:

```javascript
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function PageName() {
  const { data, fetchData } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchData();
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchData]);

  if (loading) {
    return <div className="animate-spin">Loading...</div>;
  }

  // Rest of component...
}
```

### Pages Updated (26 Total)

- **Admin Pages (10)**: Dashboard, Analytics, BulkRequests, ManageListings, Transactions, Reports, Settings, PendingApprovals, ManageUsers, ManageFactoryRegistrations
- **Factory Pages (7)**: Dashboard, Analytics, BulkRequests, Inventory, Proposals, SubmitProposal, Upload
- **Buyer Pages (6)**: Dashboard, Analytics, Marketplace, Orders, BulkRequest, Proposals
- **Profile/Settings pages**: Use user context only

---

## 🐛 Troubleshooting

### Payment Transaction Recording Error

**Symptom**: "Payment successful but failed to record transaction"

**What it means**:
- ✅ Payment was charged successfully  
- ❌ Transaction record failed to save in database
- ⚠️ User is charged but no order exists

**Root Causes:**

1. **RLS Policy Issue** (Most Common)
   - The `transactions` table RLS is too restrictive
   - Check browser console for error code `42501` (permission denied)

2. **User Authentication Mismatch**
   - `auth.uid()` doesn't match profile `id`

3. **Foreign Key Constraint**
   - Invalid `listing_id` or `buyer_id` reference

**Fix:**

Run `database.sql` which includes correct RLS policies:

```sql
-- Buyers can insert their own transactions
CREATE POLICY "Buyers can insert own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = buyer_id);
```

**Verify User Profile:**

```sql
SELECT id, email, role FROM public.profiles 
WHERE id = auth.uid();
```

If no result, create the profile:

```sql
INSERT INTO public.profiles (id, email, role)
VALUES (auth.uid(), 'user@email.com', 'buyer')
ON CONFLICT DO NOTHING;
```

### Factory Approval Issues

**Symptom**: Factory can login despite being unverified

**Fix**: 
- Ensure `database.sql` has been run
- Check `verification_status` field exists in profiles table
- Verify trigger function `set_new_user_verification()` is active

**Symptom**: Admin can't see pending factories

**Fix**:
- Navigate to `/admin/factory-registrations` (NOT `/admin/users`)
- Check AppContext has `fetchUsers()` exported
- Verify RLS policies allow admins to read all profiles

### Infinite Recursion in RLS Policies

**Symptom**: "infinite recursion detected in policy for relation 'profiles'"

**Cause**: RLS policies querying the same table they protect

**Fix**: 
- Run the updated `database.sql` which removes recursive policies
- Admin authorization is now handled at application level
- Never use SELECT inside WITH CHECK clauses

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
