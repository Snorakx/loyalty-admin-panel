# Loyalty Admin Panel

Panel administracyjny dla systemu kart lojalnościowych.

## 🚀 Uruchamianie

### Development
```bash
npm install
npm run dev
```

Aplikacja będzie dostępna na `http://localhost:5174`

## 🏗️ Architektura

### View-Service-Repository Pattern
- **Views**: Screens (tylko UI + wywołania service)
- **Services**: Business logic + caching (Singleton pattern)
- **Repositories**: Data layer (Supabase calls)
- **Utils**: Logger, validators, helpers

### Performance Optimizations
- **Singleton Services**: `AuthService`, `TenantService` używają singleton pattern
- **Smart Caching**: 30s cache dla user data i dashboard data
- **Request Deduplication**: useRef guards zapobiegają podwójnym requestom w React StrictMode
- **Logger**: Konfigurowalny logger z poziomami (DEBUG, INFO, WARN, ERROR)

### Komponenty UI
- **Button**: Primary, secondary, outline, danger variants
- **Input**: Text input z placeholder
- **Card**: Container z shadow
- **DashboardStats**: KPI cards z ikonami
- **LocationList**: CRUD lokalizacji z QR generator

### SCSS Design System
- **Variables**: Kolory, typography, spacing
- **Mixins**: Reusable styles (max 2 zagnieżdżenia)
- **CSS Modules**: Scoped styles per komponent

## 🔧 Konfiguracja

1. Skopiuj `env.example` do `.env`
2. Uzupełnij zmienne Supabase
3. (Opcjonalnie) Ustaw `VITE_LOG_LEVEL` (DEBUG, INFO, WARN, ERROR)
4. Uruchom `npm run dev`

### Environment Variables

```bash
# Supabase (wymagane)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Logger (opcjonalnie)
# Domyślnie: DEBUG w dev, INFO w production
VITE_LOG_LEVEL=DEBUG
```

## 📦 Build

```bash
npm run build
```

## 🚀 Deploy

- **Web**: Netlify (subdomain: `admin.twoja-domena.com`)

## 🔐 Autentykacja

- Email/password dla business owners
- Supabase Auth integration
- RLS (Row Level Security) per tenant_id
