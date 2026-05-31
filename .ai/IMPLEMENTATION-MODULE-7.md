# Module 7 : IA Coach — Analyse de Progression

## Objectif
Donner à l'utilisateur une vision long-terme de ses progrès. S'appuie sur l'historique NutriDB et l'API Gemini pour des analyses personnalisées.

**Prérequis** : Module 6 (Meal Detail + History) doit être terminé — la vue calendrier sert de point d'entrée naturel vers le coach.

---

## Fonctionnalités

### 7.1 — Récapitulatif IA de fin de journée
- Disponible dans le dashboard (bouton ou trigger automatique si heure > 19h)
- Envoie à Gemini : profil utilisateur + logs du jour complets (macros agrégées, nombre de repas, répartition dans la journée)
- Reçoit : bilan textuel coach (ton encourageant), points forts, points d'amélioration, suggestion pour demain
- Affiché dans une bottom sheet Material ou une card dédiée en bas du dashboard
- Persisté dans `settings` ou dans un nouveau champ `DailyRecap` pour éviter de re-appeler Gemini

### 7.2 — Analyse Historique Multi-jours
- Accessible depuis `/history` (bouton "Analyse IA")
- Envoie à Gemini un récapitulatif structuré des 7 ou 30 derniers jours :
  - Calories moyennes, écart-type
  - Moyenne macros
  - Évolution du poids si saisie (champ optionnel)
- Reçoit : analyse des tendances, ajustements d'objectifs suggérés, conseils sport/alimentation
- Affiché dans une page dédiée `/coach` ou dans une bottom sheet depuis `/history`

### 7.3 — Graphiques d'Évolution (optionnel v1, prioritaire v2)
- Courbes sur 7j / 30j : calories consommées vs objectif
- Barres : répartition macro moyenne
- Library : `chart.js` avec wrapper Angular (ou `ngx-charts`)
- Accessible depuis `/history` → tab "Graphiques"

---

## Données requises (nouvelles)

### Ajout au modèle `MealLog`
```typescript
coachTip?: string;  // conseil Gemini au moment du scan
```

### Nouveau type `DailyRecap`
```typescript
interface DailyRecap {
  id?: number;
  date: string;        // YYYY-MM-DD
  summary: string;     // Texte coach Gemini
  generatedAt: number; // timestamp
}
```

### Nouvelle table NutriDB
```typescript
// storage.service.ts — version 2
recaps: '++id, date'
```
(Nécessite une migration Dexie : `this.version(2).stores({ recaps: '++id, date' })`)

---

## GeminiService — nouvelles méthodes

```typescript
async getDailyRecap(key: string, profile: UserProfile, logs: MealLog[], stats: MetabolicStats): Promise<string>
async getWeeklyAnalysis(key: string, profile: UserProfile, dailySummaries: DailySummary[]): Promise<string>
```

---

## Plan d'exécution

| Étape | Détail | Priorité |
|---|---|---|
| 7.1 — Recap journée | GeminiService + bottom sheet dashboard | MVP |
| 7.2 — Analyse 7j/30j | GeminiService + page `/coach` ou sheet `/history` | MVP |
| 7.3 — Graphiques | chart.js ou ngx-charts, intégré à `/history` | V2 |
| Migration Dexie v2 | Nouvelle table `recaps` | Prérequis 7.1 |
