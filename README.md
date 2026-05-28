# NutriSnap - PWA Nutritionnelle Privacy-First

NutriSnap est une application mobile-first permettant de suivre sa nutrition quotidienne grâce à l'intelligence artificielle Gemini 1.5 Flash. 

## 🚀 Vision
- **Privacy-First** : Aucune donnée ne quitte le téléphone (sauf vers l'API Gemini).
- **Zéro Backend** : Pas de base de données centrale, pas de compte utilisateur.
- **BYOK** : L'utilisateur utilise sa propre clé API Google Gemini.
- **Expérience Premium** : Interface Material Design 3 ultra-fluide.

## 🛠 Stack Technique
- **Framework** : Angular 17+ (Signals, Standalone Components)
- **UI** : Angular Material 3
- **Stockage** : Dexie.js (IndexedDB)
- **IA** : Google Gemini 2.5 Flash API

## 📖 Instructions de Développement
Toutes les spécifications détaillées par module se trouvent dans le dossier `.ai/`.
Si vous êtes un agent IA, veuillez lire ces fichiers dans l'ordre (1 à 5) pour comprendre le plan de développement.

1. `.ai/IMPLEMENTATION-MODULE-1.md` : Onboarding & Profil
2. `.ai/IMPLEMENTATION-MODULE-2.md` : Data Engine & Persistence
3. `.ai/IMPLEMENTATION-MODULE-3.md` : Scanner & Gemini Vision
4. `.ai/IMPLEMENTATION-MODULE-4.md` : UI/UX & Dashboard
5. `.ai/IMPLEMENTATION-MODULE-5.md` : PWA & Offline
