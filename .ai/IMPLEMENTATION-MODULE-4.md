# Module 4 : UI/UX - Dashboard & Design Material 3

## Objectif
Transformer les données brutes en une interface "Google-like" propre, motivante et intuitive.

## Principes de Design (Material 3)
- **Couleurs** : Thème dynamique basé sur le vert (#1A5236).
- **Formes** : Radius de 24px pour les cartes et boutons.
- **Typographie** : Roboto (Headers) et Inter/Google Sans pour le corps.

## Écrans Principaux

### Gestion de l'attente (Loading State)
- L'analyse IA est asynchrone et peut durer 3-8 secondes.
- Utiliser une animation de transition fluide entre la capture et l'affichage du résultat.
- Intégrer un bouton d'annulation si le temps de réponse dépasse 15 secondes.
1. **Dashboard (Accueil)** :
   - **Calorie Ring** : Un anneau central affichant `Consommé / Objectif`.
   - **Macros Cards** : 3 petites cartes pour Protéines, Glucides, Lipides avec barres de progression.
   - **Timeline** : Liste des repas du jour (Photo miniature + Nom + Calories).
### 2. Analytics & Historique (Premium)
- **Dashboard Avancé** :
  - **Graphiques d'évolution** : Courbe sur 7 jours (Kcal, Macros) via `ngx-charts`.
  - **Widgets Macros** : Affichage en anneaux/Pie Charts `Consommé vs Restant`.
- **Vue Calendrier** : 
  - Sélecteur de date (Vue mensuelle).
  - Remontée dans le temps pour consulter les jours passés.
- **Contextual Recap** : 
  - Résumé IA de la journée (En fin de journée ou sur demande).
  - L'IA analyse l'historique complet du jour par rapport à l'objectif pour donner un bilan final.
3. **Écran de Détail** :
   - Affichage de la photo en grand.
   - Détail des items détectés par l'IA.
   - Bouton d'édition manuelle (si l'IA s'est trompée).

## Mode Sombre / Clair ✅ Implémenté
- `ThemeService` : signal-based, résout `system` via `MediaQueryList`, applique `[data-theme]` sur `<html>` via `effect()`.
- Persistance dans NutriDB (`settings` table, clé `'app'`).
- Configurable dans `/profile` → card "Apparence" avec `mat-button-toggle-group` (Système / Clair / Sombre).
- `APP_INITIALIZER` charge le thème avant le premier rendu → pas de FOUC.
- Tokens dark définis dans `styles.css` (`[data-theme="dark"]`) et `material-theme.scss`.


## 5. Intelligence Conversationnelle & Ludique (Gamification)
- Analyse du Reste a Manger (RAM) : Transformer les macros restantes en equivalents alimentaires reels.
  - Exemple : "Il te reste 40g de glucides, soit environ une belle pomme ou 50g de pates."
- Statut AJR Dynamique : Barres colorees (Vert/Orange/Rouge) et tooltips pedagogiques.
- Feedback Emotionnel : Emojis et messages bases sur la qualite nutritionnelle.