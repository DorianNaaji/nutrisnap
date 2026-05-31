# Module 6 : Meal Detail + History & Calendar

## Contexte
Ce module regroupe trois corrections de bugs bloquantes sur le dashboard et deux nouvelles features étroitement liées : la page de détail d'un repas et la vue calendrier/historique.

---

## Partie A — Bug Fixes Dashboard (prérequis)

### Bug 1 — Macros NaN au premier repas

**Root cause** : `gemini.service.ts` demande à Gemini un JSON avec les clés `prot / carb / fat` mais `MealLog.macros` (et tout le reste de l'app : `LogService`, dashboard) attend `proteins / carbs / fats`. Dans `scanner.component.ts`, `response.macros` est stocké directement sans remapping → accès à `.proteins` = `undefined` → NaN.

**Fix** : Dans `scanner.component.ts`, mapper explicitement à la création du `mealLog` :
```typescript
macros: {
  proteins: response.macros.prot ?? 0,
  carbs: response.macros.carb ?? 0,
  fats: response.macros.fat ?? 0
},
```

### Bug 2 — "Tout voir" sans action

**Root cause** : `<button mat-button color="primary">Tout voir</button>` n'a aucun `routerLink` ni handler.

**Fix** : Ajouter `routerLink="/history"` sur ce bouton (route créée dans cette session).

### Bug 3 — Clic sur un repas sans action

**Root cause** : Les `div.log-row` n'ont aucun handler de navigation.

**Fix** : Ajouter `(click)="goToMeal(log.id)"` sur chaque `log-row`. `goToMeal(id)` navigue vers `/meal/:id`. Ajouter `cursor: pointer` et un effet hover en CSS.

---

## Partie B — Meal Detail (`/meal/:id`)

### Objectif
Page standalone affichant le détail complet d'un repas enregistré.

### Route
```
/meal/:id   →   MealDetailComponent   (guard: onboardingGuard)
```

### UI
- **Header** : bouton retour (← Historique ou ← Dashboard selon la provenance), titre du repas
- **Photo** : image plein-largeur si `imageBlob` présent, placeholder sinon
- **Hero calories** : grands chiffres, badge confidence (low/medium/high avec couleur)
- **Macro cards** : 3 cards (Protéines / Glucides / Lipides) identiques au style dashboard
- **Analysis summary** : texte Gemini en card surface-variant
- **Coach tip** : si présent dans le log, affiché en card accent
- **Liste ingrédients** : si présente (`log.ingredients`), tableau nom / poids / calories
- **Danger zone** : bouton "Supprimer ce repas" (mat-stroked-button warn) avec confirmation dialog Material (`MatDialog`)
- **Timestamp** : date et heure du repas en footer discret

### Modèle
`MealLog` déjà complet. Ajouter `coachTip?: string` dans le modèle (optionnel, pour persister le coach_tip Gemini).

### Navigation retour
Utiliser `Location.back()` ou fallback vers `/dashboard` pour fonctionner depuis dashboard ET depuis history.

---

## Partie C — History & Calendar (`/history`)

### Objectif
Vue calendrier mensuelle permettant de visualiser en un coup d'œil les apports caloriques jour par jour, et de naviguer dans le passé pour consulter ou compléter un jour donné.

### Route
```
/history   →   HistoryComponent   (guard: onboardingGuard)
```

### UI — Layout général
- **Header** : titre "Historique", navigation mois ← Mois courant →
- **Grille calendrier** : 7 colonnes (L-M-M-J-V-S-D), 5-6 lignes
  - Chaque cellule = un jour
  - Si le jour a des logs : afficher les kcal consommées + **dot colorée** :
    - Vert `--success` : 80-105% de l'objectif
    - Orange `--warn` : 50-79% ou > 105%
    - Rouge `--error` : < 50% (journée incomplète ou significativement sous l'objectif)
    - Gris : aucun log
  - Jour courant : mise en évidence avec `--primary-container`
  - Jours futurs : grisés, non cliquables
- **Sélection d'un jour** : clic → affiche un panel en bas (ou navigate vers une vue journée)

### Vue journée depuis le calendrier
Option A (recommandée pour la v1) : panel "drawer" ou section dépliable en bas de page, affichant la liste des repas du jour sélectionné avec :
  - Total kcal / objectif
  - Liste des repas (identique à la timeline dashboard), chaque repas cliquable → `/meal/:id`
  - Bouton "Scanner un repas" → `/scanner` (si le jour est aujourd'hui)

Option B : route dédiée `/history/:date` — plus propre pour le futur (partage de lien, deep-link) mais plus de code.

**Recommandation** : implémenter Option A pour la v1, prévoir la migration vers Option B quand le module IA Coach nécessitera des deep-links par date.

### Données
`StorageService.getLogsByDate(date)` est déjà disponible. Ajouter `getLogsSummaryByMonth(year, month)` retournant un `Map<string, { totalCalories: number, logCount: number }>` pour charger tout le mois en une requête Dexie (range query sur `date`).

### Navigation depuis le dashboard
- Bouton "Tout voir" → `routerLink="/history"`
- Bouton retour dans history → `/dashboard`

---

## Plan d'exécution

| Étape | Fichiers touchés | Priorité |
|---|---|---|
| A1 — Fix NaN macros | `scanner.component.ts` | Bloquant |
| A2 — Fix "Tout voir" | `dashboard.component.html` | Bloquant |
| A3 — Fix clic repas | `dashboard.component.html` + `.ts` | Bloquant |
| B1 — Modèle + route | `meal.model.ts`, `app.routes.ts` | Prérequis |
| B2 — MealDetailComponent | Nouveau fichier | Feature |
| C1 — Méthode Dexie | `storage.service.ts` | Prérequis |
| C2 — HistoryComponent | Nouveau fichier | Feature |
| C3 — Styles calendrier | `history.component.css` | Feature |
