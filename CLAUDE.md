# NutriSnap — Agent Onboarding

## Projet

PWA de tracking nutritionnel **privacy-first**. Pas de compte, pas de serveur, pas de télémétrie. Toutes les données restent dans IndexedDB (Dexie.js) sur l'appareil. L'analyse IA utilise la clé Gemini personnelle de l'utilisateur (BYOK).

**Stack** : Angular 17+ (standalone), Angular Material 3, Dexie.js (IndexedDB), Google Gemini 2.5 Flash.

---

## Structure du projet

```
src/
  app/
    core/
      services/
        storage.service.ts    ← NutriDB (Dexie) v2 : profile, logs, settings, recaps
        profile.service.ts    ← Signals, calcul métabolique (Mifflin-St Jeor / Katch-McArdle)
        theme.service.ts      ← Dark/Light/System, APP_INITIALIZER, data-theme sur <html>
        update.service.ts     ← SwUpdate polling 5min, snackbar "Mettre à jour"
        gemini.service.ts     ← analyzeMeal, getCoachFeedback, getDailyRecap, getWeeklyAnalysis
        log.service.ts        ← dailyLogs signal, dailyStats computed, addLog/deleteLog
        export.service.ts     ← Export/Import JSON
      models/
        profile.model.ts
        meal.model.ts         ← MealLog (macros: proteins/carbs/fats), DailyStats, DailyRecap
    features/
      onboarding/             ← 5 étapes : Welcome → RGPD → Métabolisme → Objectif → API
      dashboard/              ← Ring calories, macro cards, timeline, FAB scanner + FAB coach
      scanner/                ← Capture photo + galerie + analyse Gemini
      profile/                ← Édition profil + card Apparence (thème)
      meal-detail/            ← (M6) Détail d'un repas : photo, macros, ingrédients, suppression
      history/                ← (M6) Calendrier mensuel + vue journée + Analyse IA multi-jours
      privacy/                ← Page RGPD complète (route publique /privacy)
    shared/
      components/
        design-system/
          card.component.ts   ← NsCardComponent (mat-card wrappé)
        legal-footer/
        recap-sheet/          ← RecapSheetComponent — bottom sheet partagé pour les textes IA
  styles.css                  ← Design tokens (:root light, [data-theme="dark"])
  material-theme.scss         ← Material 3 theme (light + dark)
```

---

## Design System

Tout est tokenisé. Jamais de valeur hardcodée dans les composants.

**Tokens principaux** (définis dans `styles.css` `:root`) :
- `--primary` / `--primary-container` / `--on-primary-container`
- `--background` / `--surface` / `--surface-variant` / `--outline`
- `--sp-1` à `--sp-12` (spacing, base 4px)
- `--radius-sm/md/lg/xl/full` (8/12/16/28/9999px)
- `--shadow-sm/md/lg`

**Dark mode** : `[data-theme="dark"]` dans `styles.css` et `material-theme.scss`. Le `ThemeService` pose cet attribut sur `document.documentElement`.

---

## Règles CSS — à respecter absolument

| Situation | Technique |
|---|---|
| Override Material (global) | `html .mat-class` — spécificité 0,1,1 > 0,1,0 de Material |
| Override dans un composant | Styles du composant + encapsulation Angular (pas besoin de `html .`) |
| Style atteignant un composant enfant | Impossible depuis le CSS parent. Toujours passer par `styles.css` |
| `border-radius` d'un `mat-card` | Setter `--mat-card-elevated-container-shape`, pas `border-radius` directement |
| `overflow: hidden` sur `mat-card` enfant | Dans `styles.css`, pas dans le composant parent |
| Jamais | `!important`, `::ng-deep` — dette technique, 0 dans le projet |

---

## NutriDB (Dexie.js)

**Base** : `NutriSnapDB` v2

| Table | Clé | Modèle |
|---|---|---|
| `profile` | `id` (singleton 1) | `UserProfile` — données métaboliques + apiKey |
| `logs` | `++id` indexé `date, timestamp` | `MealLog` — repas + imageBlob |
| `settings` | `id` (singleton `'app'`) | `AppSettings { theme, language }` |
| `recaps` | `++id` indexé `date` | `DailyRecap` — résumé IA journalier (M7) |

**API StorageService** : `getProfile/saveProfile`, `addMealLog/getLogsByDate/getLogsByMonth/getLogById/deleteLog`, `getSettings/saveSettings`, `getRecapByDate/saveRecap`, `clearAllData`.

**⚠️ Mapping critique** : `MealLog.macros` utilise les clés `proteins / carbs / fats`. Le prompt Gemini retourne `prot / carb / fat` → remapping obligatoire dans `scanner.component.ts` avant de persister.

---

## Services clés

**ProfileService** — signals : `profile()`, `metabolicStats()`. Méthodes : `loadProfile()`, `updateProfile(partial)`.

**ThemeService** — signals : `currentTheme()` (`light|dark|system`), `resolvedTheme()` (`light|dark`). Méthode : `setTheme(theme)` → persiste + applique. Init via `APP_INITIALIZER`.

**GeminiService** — `analyzeMeal`, `getCoachFeedback`, `getDailyRecap`, `getWeeklyAnalysis`. Instance `GoogleGenerativeAI` invalidée automatiquement si la clé API change (cache par `cachedKey`). Modèle : `gemini-2.5-flash`.

---

## État d'avancement

| Module | Statut |
|---|---|
| M1 — Onboarding 5 étapes | ✅ Complet |
| M2 — Data Engine (Dexie) | ✅ Complet |
| M2.5 — Profile page | ✅ Complet |
| M3 — Scanner Gemini | ✅ Complet (bug macros NaN à corriger en M6) |
| M4 — Dashboard & Dark Mode | ✅ Complet (bugs "Tout voir" + clic repas à corriger en M6) |
| M5 — PWA / Offline | ✅ Complet (installable HTTPS, testé sur mobile) |
| Delivery — DevX / Deploy OVH | ✅ Complet (FTP sync, SPA routing, anti-indexation) |
| M6 — Meal Detail + History & Calendar | ✅ Complet |
| SW Cache Busting | ✅ Complet (@angular/service-worker, SwUpdate snackbar, .htaccess no-cache) |
| M7 — IA Coach (recap journalier + analyse multi-jours) | ✅ Complet |
| M8 — i18n | ⏳ Planifié |
| M9 — Daily Coach Chat IA | ⏳ Planifié |

---

## Documentation complète

Tout est dans `.ai/` :
- `INITIAL_INSTRUCTIONS.md` — vision produit complète
- `IMPLEMENTATION-MODULE-[1-9].md` — specs par module
- `IMPLEMENTATION-DELIVERY-MODULE.md` — plan deploy OVH ✅ fait
- `SESSION_REPORT-*.md` — rapports de session (lire les plus récents en premier)
- `design-overhaul/IMPLEMENTATION-DESIGN-OVERHAUL-MODULE.md` — design system

**Lire en priorité avant de toucher au CSS** : `SESSION_REPORT-31-05-2026-FIXES.md` et `SESSION_REPORT-31-05-2026-DARK-THEME.md`.
**Session la plus récente** : `SESSION_REPORT-01-06-2026.md` (SW cache busting, M7 IA Coach, fixes).
