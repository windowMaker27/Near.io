# Near.io — Roadmap Migration Web (Next.js + Vercel)
> Branche : `feat/web-nextjs` | Dernière mise à jour : 2026-06-21

---

## Statut global

| Phase | Titre | Statut |
|-------|-------|--------|
| 0 | Scaffold & config | ✅ Fait |
| 1 | Layout racine — BurgerMenu + FilterDrawer | ✅ Fait |
| 2 | Boussole principale (page `/`) | ✅ Fait |
| 3 | Composants UI core | ✅ Fait (embarqués P1+P2) |
| 4 | Page Map (MapLibre GL JS) | ⏳ À faire |
| 5 | Auth + Profil + Favoris | ⏳ À faire |
| 6 | SubmitPlaceModal | ⏳ À faire |
| 7 | Ads (AdSense web) | ⏳ À faire |
| 8 | Pages secondaires (AR stub, Réglages, Légal) | ⏳ À faire |
| 9 | QA, SEO, Vercel deploy | ⏳ À faire |

---

## Phase 0 — Scaffold & config ✅

- [x] `create-next-app` TypeScript App Router
- [x] `@supabase/ssr` + client browser/server
- [x] `globals.css` design tokens (theme Near.io)
- [x] `SplashLoader`, `LoadingView`, `EmptyState` migrés
- [x] Stores Zustand (`authStore`, `themeStore`, `adsStore`, `favoritesStore`, `filterStore`, `placesStore`)
- [x] `useTheme`, `useRemoveAds` hooks
- [x] `lib/supabase.ts` browser + server

---

## Phase 1 — Layout racine : BurgerMenu + FilterDrawer ✅

**Livraisons :**
- [x] `src/components/BurgerMenu.tsx` — `Animated` → `framer-motion`, `expo-router` → `next/navigation`
- [x] `src/components/FilterDrawer.tsx` — `PanResponder` → CSS pointer events + framer-motion
- [x] `src/components/TargetCard.tsx` — DOM pur
- [x] `src/components/PlaceNavigator.tsx` — DOM pur
- [x] Pas de navbar — burger menu haut-gauche uniquement

---

## Phase 2 — Boussole principale (page `/`) ✅

**Livraisons :**
- [x] `app/page.tsx` — interface unique boussole, pas d'explorer
- [x] `src/components/CompassDial.tsx` — CSS, spring physique JS
- [x] `src/hooks/useCompass.ts` — `DeviceOrientationEvent` web + `requestPermission` iOS Safari
- [x] `src/hooks/useNearbyPlaces.ts` — `navigator.geolocation.watchPosition`
- [x] `src/components/PlaceDetailSheet.tsx` — bottom sheet CSS `transform: translateY`
- [x] Header fixe : logo `near.` + burger + nom commerce + cœur favori
- [x] Bouton "Afficher sur la carte" → `/map?placeId=xxx`
- [x] `PlaceNavigator` pagination n/total
- [x] Slots publicitaires AdBanner (top + mid)

---

## Phase 4 — Page Map (MapLibre GL JS) ⏳

**Objectif :** Page `/map` — carte avec markers, centré sur user.

- `react-native-maplibre` → `maplibre-gl` + `dynamic(() => import(...), { ssr: false })`
- Markers custom SVG
- `PlaceDetailSheet` au tap marker
- Param `?placeId=` → open sheet au load

---

## Phase 5 — Auth + Profil + Favoris ⏳

- `/login` + `/register` → `@supabase/ssr` (cookies)
- `/profile` → avatar, username, stats, logout
- `/favorites` → liste avec `FavoriteButton`

---

## Phase 6 — SubmitPlaceModal ⏳

- Multi-step : catégorie → nom/adresse → horaires → confirmation
- `AnimatePresence` framer-motion
- Modal web : `position: fixed`, backdrop blur, trap focus

---

## Phase 7 — Ads (AdSense web) ⏳

| Slot natif (AdMob) | Slot web (AdSense) |
|---|---|
| `AdBannerTop` 320×50 | `ins.adsbygoogle` 320×50 |
| `AdBannerMid` 320×100 | `ins.adsbygoogle` 320×100 |
| `AdSidebarRect` 300×250 | `ins.adsbygoogle` 300×250 |
| `AdInterstitial` | Non supporté → skip |

---

## Phase 8 — Pages secondaires ⏳

| Page | Contenu |
|------|---------|
| `/ar` | Stub "AR non disponible sur web" + lien app mobile |
| `/settings` | Toggle thème, distance, reset filtres |
| `/legal` | Texte légal (migration directe) |

---

## Phase 9 — QA + SEO + Vercel ⏳

- [ ] `metadata` Next.js par page
- [ ] `robots.txt` + `sitemap.xml`
- [ ] Test boussole iOS Safari
- [ ] PWA manifest
- [ ] Lighthouse ≥ 90
- [ ] Variables Vercel

---

## Estimation restante

| Phase | Durée |
|-------|-------|
| 4 Map | ~2h |
| 5 Auth/Profil/Favoris | ~2h |
| 6 SubmitPlaceModal | ~2h |
| 7 Ads | ~1h |
| 8 Pages secondaires | ~1h |
| 9 QA + Deploy | ~1h |
| **Total restant** | **~9h** |
