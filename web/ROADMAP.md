# Roadmap Migration Near.io — React Native → Next.js Web

> **Branche :** `feat/web-nextjs`  
> **Source :** `feat/v6-freemium` (React Native / Expo)  
> **Cible :** Next.js 15 App Router + Vercel  
> **Dernière mise à jour :** 2026-06-21

---

## État global

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1 | Scaffold Next.js + config Vercel/TS/Tailwind | ✅ Done |
| 2 | Design system + layout shell + BottomNav | ✅ Done |
| 3 | MapLibre GL web (`MapView`, `MapViewDynamic`, `PlaceMarker`) | ✅ Done |
| 4 | Géolocalisation (`useLocation`) + stores Zustand | ✅ Done |
| 5 | Places + Supabase (`fetchApprovedPlaces`, `PlaceSheet`) | ✅ Done |
| 6 | Boussole web (`useCompass`, `CompassRing`) | ✅ Done |
| 7 | Auth forms + middleware SSR guard | ✅ Done |
| 8 | Page AR web (caméra + overlay directionnel) | ✅ Done |
| 9 | AdSense + Lemon Squeezy freemium | ⏳ TODO |
| 10 | Favoris + Profil + Settings | ⏳ TODO |
| 11 | Pages légales + PWA manifest | ⏳ TODO |
| 12 | Build final + deploy Vercel | ⏳ TODO |

---

## Architecture en place

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, design tokens CSS, fonts
│   │   ├── page.tsx             # Page carte principale
│   │   ├── compass/page.tsx     # Boussole → commerce sélectionné uniquement
│   │   ├── ar/page.tsx          # AR caméra web + overlay directionnel
│   │   ├── favorites/page.tsx   # ❓ TODO Phase 10
│   │   ├── profile/page.tsx     # ❓ TODO Phase 10
│   │   ├── settings/page.tsx    # ❓ TODO Phase 10
│   │   ├── login/page.tsx       # ✅ Form login Supabase
│   │   ├── register/page.tsx    # ✅ Form register
│   │   ├── forgot-password/     # ✅ Reset email
│   │   └── reset-password/      # ❓ TODO (page de saisie nouveau MDP après lien email)
│   ├── components/
│   │   ├── BottomNav.tsx        # ✅ Nav mobile 5 onglets (transparent prop pour AR)
│   │   ├── MapView.tsx          # ✅ MapLibre, dynamic import, ssr:false
│   │   ├── PlaceMarker.tsx      # ✅
│   │   ├── PlaceSheet.tsx       # ✅ Bottom sheet lieu sélectionné
│   │   ├── CompassRing.tsx      # ✅ Boussole sans nord, flèche → commerce
│   │   ├── AdBanner.tsx         # ❓ TODO Phase 9
│   │   └── RemoveAdsButton.tsx  # ❓ TODO Phase 9
│   ├── features/
│   │   ├── auth/authService.ts  # ✅ signIn, signOut, signUp via supabase
│   │   ├── compass/             # ✅ getBearingDeg, formatDistance
│   │   └── places/              # ✅ fetchApprovedPlaces, types
│   ├── hooks/
│   │   ├── useCompass.ts        # ✅ DeviceOrientation, iOS permission gate
│   │   ├── useLocation.ts       # ✅ navigator.geolocation watchPosition
│   │   └── useRemoveAds.ts      # ❓ TODO Phase 9 (check Supabase user_purchases)
│   ├── store/
│   │   ├── appStore.ts          # ✅ selectedPlace, filters, theme
│   │   ├── authStore.ts         # ✅ user Supabase, setUser, clearUser
│   │   └── locationStore.ts     # ✅ coords, heading
│   ├── lib/
│   │   └── supabase.ts          # ✅ createBrowserClient (@supabase/ssr)
│   └── middleware.ts            # ✅ Edge guard SSR : routes privées → /login
├── .env.example
├── CHECKLIST_DEPLOY.md
├── ROADMAP.md               # ce fichier
├── next.config.ts
├── package.json
├── tsconfig.json
└── vercel.json
```

---

## Détails des phases restantes

### Phase 9 — Freemium (AdSense + Lemon Squeezy)

**Composants à créer :**

#### `AdBanner.tsx`
```tsx
// Affiche une vraie pub AdSense si NEXT_PUBLIC_ADSENSE_CLIENT est set
// Sinon affiche un placeholder visuel en dev
// Props : slot?: string, format?: 'auto' | 'rectangle'
// Masqué si useRemoveAds() retourne true
```

#### `RemoveAdsButton.tsx`
```tsx
// Bouton CTA visible si ads non supprimées
// Appelle POST /api/checkout (retourne URL Lemon Squeezy)
// Redirige vers checkout LS dans un nouvel onglet
```

#### `hooks/useRemoveAds.ts`
```ts
// Lit Supabase : SELECT remove_ads FROM user_purchases WHERE user_id = auth.uid()
// Retourne boolean
// Cache dans appStore pour éviter une requête à chaque render
```

**Routes API à créer :**

#### `app/api/checkout/route.ts`
```ts
// POST — crée une session Lemon Squeezy
// Body : { userId: string }
// Retourne : { checkoutUrl: string }
// Variables : LEMON_SQUEEZY_API_KEY, LEMON_SQUEEZY_STORE_ID, LEMON_SQUEEZY_VARIANT_ID
```

#### `app/api/webhook/lemonsqueezy/route.ts`
```ts
// POST — reçoit les webhooks LS
// Vérifie la signature HMAC-SHA256 avec LEMON_SQUEEZY_WEBHOOK_SECRET
// Événement order_created :
//   → UPDATE user_purchases SET remove_ads = true WHERE user_id = meta.custom_data.userId
// Utiliser le client Supabase SERVICE_ROLE (pas anon) pour bypass RLS
// NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY à ajouter dans les env vars Vercel (privée)
```

**Supabase — table requise :**
```sql
CREATE TABLE user_purchases (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  remove_ads BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user can read own" ON user_purchases FOR SELECT USING (auth.uid() = user_id);
-- INSERT/UPDATE uniquement via service_role (webhook)
```

**Dépendances à installer :**
```bash
cd web && npm install @lemonsqueezy/lemonsqueezy.js
```

---

### Phase 10 — Favoris + Profil + Settings

#### `app/favorites/page.tsx`
```tsx
// Liste des lieux favoris depuis Supabase
// Table : user_favorites (user_id, place_id, created_at)
// Composant PlaceFavoriteCard : nom, catégorie, distance, bouton « Naviguer »
// Empty state animé si 0 favoris
// Bouton toggle favori dans PlaceSheet (heart icon, optimistic update)
```

#### `app/profile/page.tsx`
```tsx
// Affiche username, email (masqué partiellement), date d’inscription
// Bouton "Se déconnecter" : supabase.auth.signOut() + clearUser() + redirect /login
// Badge "Sans publicité" si remove_ads = true
// Lien vers /settings
```

#### `app/settings/page.tsx`
```tsx
// Toggle dark/light mode (synché avec appStore.theme)
// Sélecteur unité distance (km / miles) — persisté dans appStore
// Sélecteur rayon de recherche (500m, 1km, 2km, 5km)
// Bouton "Supprimer mon compte" (modale de confirmation)
// Lien vers /legal
```

**Supabase — table requise :**
```sql
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  place_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, place_id)
);
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user own" ON user_favorites USING (auth.uid() = user_id);
```

---

### Phase 11 — Pages légales + PWA + reset-password

#### `app/reset-password/page.tsx`
```tsx
// Page cible du lien email Supabase (/reset-password#access_token=...)
// Lit le token du hash URL
// supabase.auth.updateUser({ password: newPassword })
// Redirection vers / après succès
```

#### `app/legal/page.tsx`
```tsx
// Contenu statique : CGU, Politique de confidentialité, mentions légales
// Route publique (ajout dans PUBLIC_PATHS du middleware)
```

#### PWA `app/manifest.ts`
```ts
// export default function manifest(): MetadataRoute.Manifest
// name: 'Near.io', short_name: 'Near'
// theme_color: '#01696f' (accent teal)
// icons: 192x192 + 512x512
// display: 'standalone', orientation: 'portrait'
// start_url: '/'
```

#### `public/` — icônes PWA
```
public/icon-192.png
public/icon-512.png
public/og-image.png   # 1200x630 pour Open Graph
```

---

### Phase 12 — Build final + Deploy Vercel

```bash
cd web
npm run build   # 0 erreur, 0 warning critique
npm run lint    # 0 erreur
```

**Points de vigilance finaux :**
- `maplibre-gl` : jamais importé en static, uniquement via `dynamic(..., { ssr: false })`
- `'use client'` présent sur tous les composants avec hooks browser
- Aucun import `react-native` dans `web/`
- Middleware : `/legal` et `/reset-password` dans `PUBLIC_PATHS`
- Vercel : Root Directory = `web`, pas la racine du repo

**Variables d’env à ajouter en Phase 9 (pas encore dans .env.example) :**
```
SUPABASE_SERVICE_ROLE_KEY=        # privé, jamais NEXT_PUBLIC_
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_VARIANT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=
```

---

## Contexte technique clé (pour reprendre sans historique)

### Boussole
- **Pas de nord.** Flèche pointe uniquement vers le commerce sélectionné.
- `relativeAngle = (targetBearing - heading + 360) % 360`
- iOS Safari : `DeviceOrientationEvent.requestPermission()` obligatoire sur geste utilisateur
- Implémenté dans `hooks/useCompass.ts` et `components/CompassRing.tsx`

### MapLibre
- Import : `dynamic(() => import('@/components/MapView'), { ssr: false })`
- Style : MapTiler (`NEXT_PUBLIC_MAPTILER_KEY`)
- CSS : `import 'maplibre-gl/dist/maplibre-gl.css'` dans `layout.tsx`

### Auth
- Package : `@supabase/ssr` (pas `auth-helpers-nextjs` qui est déprécié)
- Client browser : `createBrowserClient` dans `lib/supabase.ts`
- Middleware : `createServerClient` avec cookies Edge
- Store : `authStore.ts` (Zustand, `'use client'`)

### Stores Zustand
- Tous wrappés `'use client'`
- `appStore` : `selectedPlace`, `filters`, `theme`, `distanceUnit`, `searchRadius`
- `locationStore` : `coords`, `heading`
- `authStore` : `user`

### Freemium (Phase 9 à faire)
- AdMob **supprimé** (web incompatible)
- Remplacement : **Google AdSense** (validation 1-3j) + **Lemon Squeezy** pour "Remove Ads"
- Pas Stripe : Lemon Squeezy gère TVA EU automatiquement
