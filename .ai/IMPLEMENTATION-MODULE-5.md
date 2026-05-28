# Module 5 : PWA - Offline & Installation

## Objectif
Faire de NutriSnap une véritable application mobile installable, fonctionnant même sans connexion (pour la consultation).

## Configuration PWA
1. **Manifest.webmanifest** :
   - Icones (192x192, 512x512).
   - Splash screens.
   - `display: standalone`.
   - `theme_color`: #1A5236.
2. **Service Worker** :
   - Mise en cache des assets statiques (JS, CSS, Polices).
   - Stratégie "Cache First" pour les ressources UI.
   - Stratégie "Network Only" pour les appels API Gemini (nécessite internet).

## Fonctionnalités "App-Like"
- **Installation Prompt** : Proposer l'installation après 2 ou 3 utilisations réussies.
- **Offline Mode** : Affichage d'un bandeau "Mode hors-ligne" ; les logs restent consultables mais le scanner est désactivé.
- **Badge API** : Afficher le nombre de calories restantes sur l'icône de l'app (si supporté par le navigateur).

## Finalisation
- Audit Lighthouse pour valider les performances et l'accessibilité (A11y).
- Test sur iOS (Safari) et Android (Chrome) pour valider l'expérience "Standalone".
