# 🌿 Organic Shop

A full-stack e-commerce platform for organic products — built with React, Node.js, MySQL, and Supabase Auth. Features a complete storefront, shopping cart, order management, and a powerful admin dashboard.

**Live Demo:** [organic-shop-nu.vercel.app](https://organic-shop-nu.vercel.app)

---

## ✨ Features

### Storefront
- Product listing with categories, filters, and search
- Product detail pages with variants (size, color)
- Shopping cart with delivery area selection
- Order placement with Cash on Delivery support
- Order tracking
- Blog posts
- User login & account management (Supabase Auth)

### Admin Dashboard (`/admin`)
- 📊 Dashboard with sales analytics, revenue chart, inventory alerts
- 📦 Order management with status updates and courier dispatch (Steadfast, RedX, Pathao)
- 🛍️ Product management (create, edit, price bulk edit)
- 🗂️ Category & brand management
- 👥 Customer management with analytics
- 🎟️ Coupon management
- 📣 Campaign tracking
- 🖼️ Banner & slider management
- ⭐ Reviews management
- 📝 Blog & pages management
- 📱 Social media links
- 💰 Accounts (income/expense tracking)
- 📈 Reports: Sales, Stock, Customer Analytics, Fraud Check
- 🔌 Integrations: SMS Gateway, Steadfast, RedX, Pathao couriers
- 🎯 Tracking pixels (Facebook, Google Tag Manager)
- ⚙️ General settings (site name, logo, phone, address)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui, Radix UI |
| State | TanStack Query |
| Routing | React Router DOM v6 |
| Auth | Supabase Auth |
| Backend | Node.js, Express |
| Database | MySQL (Railway) |
| Deployment | Vercel (frontend), Railway (backend) |

---

## 📁 Project Structure

```
├── src/                    # Frontend (React + Vite)
│   ├── pages/              # All pages
│   │   ├── admin/          # Admin dashboard pages
│   │   └── ...             # Public storefront pages
│   ├── components/         # Reusable UI components
│   ├── context/            # Cart context
│   ├── lib/                # API helpers, utilities
│   ├── hooks/              # Custom React hooks
│   └── integrations/       # Supabase client
│
├── server/                 # Backend (Node.js + Express)
│   ├── index.js            # Express app & API routes
│   ├── db.js               # MySQL connection pool
│   ├── password.js         # Password hashing
│   ├── schema.mysql.sql    # Full database schema
│   └── scripts/
│       ├── create-admin.js # Create admin user script
│       └── seed-demo.js    # Seed demo data script
│
├── public/                 # Static assets
├── vercel.json             # Vercel deployment config
└── .env.example            # Frontend env template
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- A [Supabase](https://supabase.com) project
- A [Railway](https://railway.app) account (for backend hosting)

---

### 1. Clone the Repository

```bash
git clone https://github.com/SourovKarmokar/Organic-Shop.git
cd Organic-Shop
```

---

### 2. Frontend Setup

```bash
npm install
```

Create `.env` from the example:

```bash
cp .env.example .env
```

Fill in the values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-ref
VITE_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

---

### 3. Backend Setup

```bash
cd server
npm install
```

Create `server/.env` from the example:

```bash
cp .env.example .env
```

Fill in the values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=organic_shop
PORT=5000
CORS_ORIGIN=http://localhost:8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### 4. Database Setup

Import the schema into MySQL:

```bash
mysql -u root -p organic_shop < server/schema.mysql.sql
```

Create the admin user:

```bash
cd server
node scripts/create-admin.js
```

Optionally seed demo data:

```bash
node scripts/seed-demo.js
```

---

### 5. Supabase Setup

Run these SQL queries in your Supabase **SQL Editor**:

```sql
-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create is_admin function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$$;
```

Then create an admin user in Supabase **Authentication → Users**, and assign the role:

```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'your-email@example.com';
```

---

### 6. Start the Backend

```bash
cd server
node index.js
```

The API runs at `http://localhost:5000`.

---

## 🌐 Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Framework: **Vite** | Output: `dist`
4. Add environment variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ref |
| `VITE_API_URL` | Your Railway backend URL |

### Backend → Railway

1. Create a new project at [railway.app](https://railway.app)
2. Add **GitHub repo** service → set Root Directory to `server`
3. Add **MySQL** database service
4. Set environment variables in the server service:

| Variable | Value |
|---|---|
| `MYSQLHOST` | `${{MySQL.MYSQLHOST}}` |
| `MYSQLUSER` | `${{MySQL.MYSQLUSER}}` |
| `MYSQLPASSWORD` | `${{MySQL.MYSQLPASSWORD}}` |
| `MYSQLDATABASE` | `railway` |
| `MYSQLPORT` | `${{MySQL.MYSQLPORT}}` |
| `PORT` | `5000` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` |

5. Import the schema via Railway MySQL Console:
```bash
mysql -u root -p$MYSQL_ROOT_PASSWORD railway
```
Then paste the contents of `server/schema.mysql.sql`.

---

## 📜 Available Scripts

### Frontend
| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

### Backend
| Command | Description |
|---|---|
| `node index.js` | Start Express server |
| `node scripts/create-admin.js` | Create admin user |
| `node scripts/seed-demo.js` | Seed demo data |

---

## 🔒 Environment Variables

### Frontend (`.env`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project reference ID |
| `VITE_API_URL` | Backend API base URL |

### Backend (`server/.env`)
| Variable | Description |
|---|---|
| `DB_HOST` / `MYSQLHOST` | MySQL host |
| `DB_PORT` / `MYSQLPORT` | MySQL port (default: 3306) |
| `DB_USER` / `MYSQLUSER` | MySQL username |
| `DB_PASSWORD` / `MYSQLPASSWORD` | MySQL password |
| `DB_NAME` / `MYSQLDATABASE` | Database name |
| `PORT` | Express server port (default: 5000) |
| `CORS_ORIGIN` | Allowed frontend origin URL |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |

---

## 📄 License

MIT License — free to use and modify.

---

## 🙏 Credits

Built with [React](https://react.dev), [shadcn/ui](https://ui.shadcn.com), [Supabase](https://supabase.com), [Railway](https://railway.app), and [Vercel](https://vercel.com).
