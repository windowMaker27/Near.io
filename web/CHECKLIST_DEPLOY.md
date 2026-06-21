# Checklist Déploiement Vercel — Near.io Web

Coche chaque étape avant de merger `feat/web-nextjs` → `main`.

---

## 1. Variables d’environnement

Dans Vercel Dashboard → Settings → Environment Variables :

| Variable | Source | Requis |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase projet → Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase projet → Settings → API | ✅ |
| `NEXT_PUBLIC_MAPTILER_KEY` | maptiler.com (plan gratuit OK) | ✅ |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Google AdSense → ca-pub-XXXX | ⚠️ après validation |
| `NEXT_PUBLIC_ADSENSE_SLOT` | Google AdSense → unité d’annonce | ⚠️ après validation |
| `LEMON_SQUEEZY_API_KEY` | app.lemonsqueezy.com → Settings → API | ✅ |
| `LEMON_SQUEEZY_STORE_ID` | app.lemonsqueezy.com | ✅ |
| `LEMON_SQUEEZY_VARIANT_ID` | ID du produit "Remove Ads" | ✅ |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | Généré dans Webhooks LS | ✅ |

---

## 2. Supabase — Configuration

- [ ] `Site URL` = `https://ton-domaine.vercel.app` (ou domaine custom)
- [ ] `Redirect URLs` contient `https://ton-domaine.vercel.app/**`
- [ ] RLS activé sur toutes les tables
- [ ] Table `user_purchases` existe avec colonne `remove_ads BOOLEAN DEFAULT false`
- [ ] Extension `postgis` activée (nécessaire pour `fetchApprovedPlaces` avec filtre geo)

---

## 3. MapLibre GL

- [ ] `NEXT_PUBLIC_MAPTILER_KEY` rempli
- [ ] Le style URL répond (test : ouvrir dans navigateur)
- [ ] `MapViewDynamic` utilisé partout (`ssr: false`) — jamais `MapView` directement
- [ ] CSS MapLibre importé dans `layout.tsx` : `import 'maplibre-gl/dist/maplibre-gl.css'`

---

## 4. Boussole / AR

- [ ] Sur iPhone Safari : bouton "Activer la direction" visible avant tout mouvement
- [ ] Sur Android Chrome : orientation fonctionne sans permission
- [ ] Page AR : caméra demandée au montage, flux stoppé au démontage
- [ ] HTTPS obligatoire (Vercel = HTTPS par défaut ✔)

---

## 5. Google AdSense

1. Créer un compte sur https://adsense.google.com
2. Ajouter le site Vercel et attendre la validation (1–3 jours)
3. Créer une unité d’annonce → copier `client` et `slot`
4. Ajouter dans `web/src/app/layout.tsx` :
   ```tsx
   import Script from 'next/script';
   // dans <head> ou après <body> :
   <Script
     src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
     strategy="afterInteractive"
     crossOrigin="anonymous"
     data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
   />
   ```
5. `AdBanner` affiche automatiquement les vraies pubs dès que les vars sont setées

---

## 6. Lemon Squeezy — Freemium

- [ ] Produit "Remove Ads" créé sur https://app.lemonsqueezy.com
- [ ] Prix configuré (ex : 1,99€ une fois)
- [ ] Webhook configuré vers `https://ton-domaine.vercel.app/api/webhook/lemonsqueezy`
- [ ] Événements webhook : `order_created`
- [ ] `LEMON_SQUEEZY_WEBHOOK_SECRET` identique dans LS et dans Vercel env

---

## 7. Build local avant push

```bash
cd web
npm install
npm run build   # doit passer sans erreur
npm run lint    # 0 erreur
```

Points de vigilance :
- `maplibre-gl` : importé uniquement dans `MapView.tsx` via `import()` dynamique — ne pas importer en static
- Tous les composants client avec hooks browser (`useEffect`, `useState`) ont `'use client'` en tête
- Aucun `AppState`, `StyleSheet`, `TouchableOpacity`, `View`, `Text` RN dans `/web`

---

## 8. Déploiement Vercel

```bash
# Depuis la racine du repo
vercel --cwd web
# ou via GitHub integration (recommandé) :
# Settings → Root Directory = web
```

- [ ] Root Directory Vercel = `web`
- [ ] Framework = Next.js (détecté auto)
- [ ] Build Command = `npm run build` (défaut OK)
- [ ] Output Directory = `.next` (défaut OK)

---

## 9. Vérifications post-deploy

- [ ] `/login` accessible sans auth
- [ ] `/` redirige vers `/login` si non connecté
- [ ] Carte MapLibre se charge (pas d’erreur console 401/403 MapTiler)
- [ ] Geolocalisation demandée au premier accès carte
- [ ] Boussole → bouton permission visible sur iPhone
- [ ] AR → caméra demandée, flux vidéo visible
- [ ] Pubs : placeholder visible en dev, AdSense en prod
- [ ] Checkout Lemon Squeezy redirige bien
- [ ] Dark mode toggle fonctionne
- [ ] `npm run build` en CI Vercel = 0 erreur, 0 warning critique
