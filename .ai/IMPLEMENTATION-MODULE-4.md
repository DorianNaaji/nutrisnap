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
2. **Timeline Historique** :
   - Navigation par date (Calendrier Material).
   - Groupement par jour.
3. **Écran de Détail** :
   - Affichage de la photo en grand.
   - Détail des items détectés par l'IA.
   - Bouton d'édition manuelle (si l'IA s'est trompée).

## Mode Sombre / Clair
- Support natif du Dark Mode via les thèmes Angular Material 3.
- Transition fluide entre les modes.


## 5. Intelligence Conversationnelle & Ludique (Gamification)
- Analyse du Reste a Manger (RAM) : Transformer les macros restantes en equivalents alimentaires reels.
  - Exemple : "Il te reste 40g de glucides, soit environ une belle pomme ou 50g de pates."
- Statut AJR Dynamique : Barres colorees (Vert/Orange/Rouge) et tooltips pedagogiques.
- Feedback Emotionnel : Emojis et messages bases sur la qualite nutritionnelle.