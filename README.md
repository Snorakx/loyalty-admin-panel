# Loyalty Admin Panel

Admin panel for the loyalty card system.

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5174`

## 🏗️ Architecture

### View-Service-Repository Pattern
- **Views**: Screens (UI only + service calls)
- **Services**: Business logic + caching (Singleton pattern)
- **Repositories**: Data layer (Supabase calls)
- **Utils**: Logger, validators, helpers

### Performance Optimizations
- **Singleton Services**: `AuthService`, `TenantService` use singleton pattern
- **Smart Caching**: 30s cache for user data and dashboard data
- **Request Deduplication**: useRef guards prevent duplicate requests in React StrictMode
- **Logger**: Configurable logger with levels (DEBUG, INFO, WARN, ERROR)

### UI Components
- **Button**: Primary, secondary, outline, danger variants
- **Input**: Text input with placeholder
- **Card**: Container with shadow
- **DashboardStats**: KPI cards with icons
- **LocationList**: Location CRUD with QR generator

### SCSS Design System
- **Variables**: Colors, typography, spacing
- **Mixins**: Reusable styles (max 2 nesting levels)
- **CSS Modules**: Scoped styles per component

## 🔧 Configuration

1. Copy `env.example` to `.env`
2. Fill in Supabase variables
3. (Optional) Set `VITE_LOG_LEVEL` (DEBUG, INFO, WARN, ERROR)
4. Run `npm run dev`

### Environment Variables

```bash
# Supabase (required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Logger (optional)
# Default: DEBUG in dev, INFO in production
VITE_LOG_LEVEL=DEBUG
```

## 📦 Build

```bash
npm run build
```

## 🚀 Deploy

- **Web**: Netlify (subdomain: `admin.your-domain.com`)

## 🔐 Authentication

- Email/password for business owners
- Supabase Auth integration
- RLS (Row Level Security) per tenant_id
