# Byline — Premium Editorial CMS & Social Publishing Platform

Byline is a production-ready, full-stack content management system and social blogging platform engineered with a premium, human-curated editorial aesthetic. Inspired by high-authority publications like *Medium*, *The Verge*, *Stripe*, and *Apple*, Byline features sophisticated typographic hierarchies, editorial white space, micro-animations, and responsive bento grid layouts.

---

## Key Features

### 🎨 Premium Design & Aesthetics
* **Starry Night Dark Mode:** Deep, cinematic dark mode paired with a clean, high-contrast light mode, utilizing HSL curated color palettes to prevent flash of unstyled content (FOUC).
* **High-Fidelity Typography:** Proportional line heights, Source Serif 4 headings for an elegant print publication look, and Inter for clean body copy.
* **Micro-Animations:** Fluid, staggered list entries, animated social shares, and interactive action items powered by Framer Motion.

### 💬 Social & User-to-User Interactions
* **Follow Graph:** Readers can follow their favorite journalists and authors directly, with live follower counts.
* **Personalized Timeline Feed (`/feed`):** A custom chronological feed showing only articles from followed authors.
* **@Mentions Autocomplete:** Dynamic `@` suggestions when typing in the comment box, complete with inline styled highlights.
* **Interactive Reaction Bar:** Animated emoji reactions (❤️, 🔥, 💡, 👏, 😮) utilizing persistent local storage states and backend sync.
* **Dynamic Comment Likes:** Interactive animations for liking comments and nested replies.
* **Live Reading Count Badge:** Real-time indicator showing active viewer counts on articles.

### 🛠️ CMS Admin Panel
* **Advanced Editor:** Draft, schedule, or publish articles with inline markdown parsing and previews.
* **Line-Trend Analytics:** Interactive charts showcasing unique page views and article popularity.
* **Role-Based Security:** Strict access control distinguishing Super Admins, Admins, Authors, and Registered Users.
* **Media Library:** Asset management with instant copy-to-clipboard image URLs.
* **Newsletter Broadcasts:** Inline signups, verification logs, and a markdown dispatch center to mail subscribers.
* **Audit Logging:** Detailed security trail logging all critical admin actions for Super Admins.

---

## Technology Stack

* **Core Framework:** Next.js 16 (App Router), React 19, TypeScript
* **Styling & Motion:** Tailwind CSS, Framer Motion, Lucide Icons
* **Database & BaaS:** Supabase PostgreSQL (via custom Mongoose-compatible adapter layer)
* **API Layer:** Express.js integrated directly via Next.js App Router Catch-All API route (`/api/[[...path]]`)
* **Authentication:** JWT Authentication & Password Hashing via bcryptjs

---

## Project Structure

```text
byline-blogs/
├── src/
│   ├── app/                  # Next.js App Router (pages, layouts, /api catch-all route)
│   ├── backend/              # Integrated Express API (controllers, models, middleware, routes)
│   ├── components/           # UI & Interactive components (Navbar, Footer, AdminLayout, etc.)
│   ├── context/              # Context Providers (AuthContext, ThemeContext, ToastContext)
│   ├── hooks/                # Custom React Hooks
│   ├── lib/                  # Database utilities
│   └── services/             # Axios API Client service layer
├── public/                   # Static assets & uploads directory
├── next.config.ts            # Next.js configuration
├── package.json              # Unified project dependencies & scripts
└── tsconfig.json             # TypeScript configuration
```

---

## Installation & Setup

### Prerequisites
* Node.js (v18+)
* npm (v9+)

### 1. Environment Setup
Configure `.env` in the root directory:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
JWT_SECRET=your_super_secure_jwt_secret_key
NODE_ENV=development
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Initial Database Content (Optional)
```bash
npm run seed
```

**Default Credentials:**
* **Super Admin:** `admin@byline.com` / `adminpassword123`
* **Author Clara:** `clara@byline.com` / `authorpassword123`
* **Author Julian:** `julian@byline.com` / `authorpassword123`

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` (or `http://localhost:5000`) in your browser to view the application.

### 5. Production Build
```bash
npm run build
```

---

## License
MIT License. Created by Ahmed Saffar.
