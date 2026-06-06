# Near.io

Near.io est une application mobile Expo / React Native / TypeScript qui guide l'utilisateur vers le commerce alimentaire le plus proche et idéalement ouvert, avec boussole temps réel, vue carte, pseudo mode AR caméra et favoris persistés localement.

## Stack

- Expo SDK 53
- React Native + TypeScript
- Expo Router
- Zustand
- react-native-mmkv
- expo-location
- expo-camera
- expo-haptics
- react-native-maps
- react-native-reanimated
- @gorhom/bottom-sheet

## Installation

```bash
npm install
```

Puis lancer :

```bash
npm run start
npm run ios
npm run android
```

## Variables d'environnement

Créer un fichier `.env` à partir de `.env.example`.

| Variable | Description | Requis |
|---|---|---|
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Clé Google Places API v1 (New) | Non |
| `EXPO_PUBLIC_OVERPASS_URL` | Endpoint Overpass API | Non (défaut OSM public) |
| `EXPO_PUBLIC_DEFAULT_RADIUS_METERS` | Rayon de recherche initial en mètres | Non (défaut 1000) |
| `EXPO_PUBLIC_ENABLE_GOOGLE_ENRICHMENT` | Activer l'enrichissement Google Places | Non (défaut true) |

## Fonctionnement data

- OSM / Overpass fournit la base des commerces proches.
- Google Places enrichit progressivement les meilleurs résultats quand une clé est disponible.
- Sans clé Google, l'app fonctionne en mode OSM only avec statut d'ouverture souvent limité à `inconnu`.
- En cas d'échec réseau complet, des données mock locales prennent le relais.

## Compromis AR dans Expo

Le mode AR est un mode caméra + overlay directionnel robuste, pas une intégration ARKit/ARCore 3D native. Ce choix reste compatible Expo managed workflow et évite une dette d'intégration native inutile. Pour une vraie AR 3D (anchors, occlusion), il faudrait passer en bare workflow avec ViroReact ou RealityKit natif.

## Limitations connues

- Le heading natif n'est pas homogène selon les devices ; Near.io applique un lissage EMA pour limiter le jitter.
- Les horaires temps réel dépendent de la qualité des données OSM et/ou Google Places.
- `react-native-maps` peut nécessiter une configuration native légère selon la cible build.
- L'API Google Places v1 peut demander des ajustements de champs selon votre projet GCP.

## Prochaines évolutions

- Historique récent enrichi
- Cache intelligent des lieux
- Itinéraire pas à pas
- Tri contextuel selon préférences utilisateur
- Enrichissement Places batch plus fin
- Mode offline complet

## Checklist démarrage

1. `cp .env.example .env`
2. Ajouter la clé Google Places si souhaité
3. `npm install`
4. `npm run start`
5. Tester permissions localisation + caméra sur device réel (le simulateur ne fournit pas de heading fiable)
