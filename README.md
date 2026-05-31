# NutriSnap - PWA Nutritionnelle Privacy-First

NutriSnap est une application mobile-first permettant de suivre sa nutrition quotidienne grâce à l'intelligence artificielle Gemini 2.5 Flash.

## 🚀 Vision
- **Privacy-First** : Aucune donnée ne quitte le téléphone (sauf vers l'API Gemini).
- **Zéro Backend** : Pas de base de données centrale, pas de compte utilisateur.
- **Bring Your Own Key** : L'utilisateur utilise sa propre clé API Google Gemini.
- **Expérience Premium** : Interface Material Design 3 ultra-fluide.

## 🛠 Stack Technique
- **Framework** : Angular 17+ (Signals, Standalone Components)
- **UI** : Angular Material 3
- **Stockage** : Dexie.js (IndexedDB)
- **IA** : Google Gemini 2.5 Flash API

## 🎨 Architecture CSS
Les styles suivent une hiérarchie de spécificité stricte — **aucun `!important` ni `::ng-deep`** dans le codebase :
- **Design Tokens** dans `src/styles.css` (`:root`) — couleurs, espacements, rayons, élévations.
- **Overrides Material** via préfixe `html .class` (spécificité 0,1,1 > 0,1,0 de Material).
- **Styles composants** via l'encapsulation émulée Angular (`[_ngcontent-xxx]` implicite).
- **Overrides Stepper** centralisés dans `src/styles.css` (section "STEPPER OVERRIDES").

## 📖 Instructions de Développement
Toutes les spécifications détaillées par module se trouvent dans le dossier `.ai/`.
Si vous êtes un agent IA, veuillez lire ces fichiers dans l'ordre (1 à 5) pour comprendre le plan de développement.

1. `.ai/IMPLEMENTATION-MODULE-1.md` : Onboarding & Profil
2. `.ai/IMPLEMENTATION-MODULE-2.md` : Data Engine & Persistence
3. `.ai/IMPLEMENTATION-MODULE-3.md` : Scanner & Gemini Vision
4. `.ai/IMPLEMENTATION-MODULE-4.md` : UI/UX & Dashboard
5. `.ai/IMPLEMENTATION-MODULE-5.md` : PWA & Offline

## 🚢 Déploiement & DevX (OVH)

L'application est conçue pour être déployée sur un hébergement mutualisé (ex: OVH) via FTP.

### Mode Développement Synchronisé
Pour voir vos changements en temps réel sur votre serveur de production (nécessaire pour tester la caméra en HTTPS sur mobile) :

1. **Configuration** : Copiez le fichier `.env.example` vers `.env` et remplissez vos accès :
   ```bash
   cp .env.example .env
   ```

2. **Lancer la synchronisation** :
   ```bash
   npm run start:sync
   ```
   Ce script lance `ng build --watch` et synchronise chaque modification via FTP automatiquement avec un logging détaillé.
