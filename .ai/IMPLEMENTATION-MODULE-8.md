# Module 8 : Internationalisation (i18n)

## Statut : ⏳ Planifié

## Contexte
L'application est actuellement en français "hardcodé". La locale `fr-FR` est déclarée globalement dans `app.config.ts` (LOCALE_ID) ce qui assure le formatage correct des dates, nombres et monnaies. Toutes les chaînes UI sont en français dans les templates.

## Ce qui est déjà en place
- `LOCALE_ID = 'fr-FR'` dans `app.config.ts` → dates et nombres formatés en français nativement
- `language: 'fr'` dans `AppSettings` (NutriDB)

## Ce qu'il reste à faire

### 8.1 — Angular i18n (extraction + traduction)
- Annoter les templates avec `i18n` attributes sur toutes les chaînes UI
- Générer le fichier de messages source : `ng extract-i18n`
- Créer les fichiers de traduction : `messages.fr.xlf`, `messages.en.xlf`
- Configurer `angular.json` avec les locales cibles (`fr`, `en`)
- Build multi-locale : `ng build --localize`

### 8.2 — Sélecteur de langue
- Ajouter un sélecteur dans `/profile` (card Apparence, à côté du thème)
- Persister le choix dans `AppSettings.language`
- Recharger l'app avec la bonne locale (ou préfixe d'URL `/fr/`, `/en/`)

### 8.3 — Contenus dynamiques (Gemini)
- Passer la langue de l'utilisateur dans les prompts Gemini (`analyzeMeal`, `getCoachFeedback`)
- Gemini répond déjà en français si le prompt est en français — il suffira d'adapter les prompts selon la langue choisie

## Points d'attention
- Les données en IndexedDB (noms de repas, résumés Gemini) sont dans la langue de création — pas de migration nécessaire, les nouvelles analyses utiliseront la bonne langue
- Les dates et nombres sont déjà localisés via `LOCALE_ID` → pas de travail supplémentaire sur ce point
- Prévoir `/en/` vs `/fr/` dans le routing ou rechargement complet au changement de langue (plus simple)

## Priorité
Basse — à traiter après M7 (IA Coach). L'app est fonctionnelle en français, c'est suffisant pour la v1.
