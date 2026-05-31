# Module 9 — Daily Coach IA (Chat libre)

## Vision

Un bouton FAB flottant en bas à gauche du Dashboard (symétrique au FAB scanner en bas à droite) ouvre une page de **chat libre avec Gemini**, enrichi de l'historique nutritionnel de l'utilisateur sur une période choisie. L'utilisateur peut poser n'importe quelle question : bilan, conseil, optimisation, motivation.

---

## Entrée utilisateur

**FAB sur le Dashboard :**
- Icône : `smart_toy` ou `psychology` (Material Symbols)
- Position : `bottom-left`, même level que le FAB caméra
- Couleur : `--secondary-container` / `--on-secondary-container` (distinct du FAB scanner qui est en primary)
- Route : `/coach`

---

## Route & Composant

```
src/app/features/coach/
  coach.component.ts
  coach.component.html
  coach.component.css
```

Route lazy dans `app.routes.ts` :
```typescript
{
  path: 'coach',
  loadComponent: () => import('./features/coach/coach.component').then(m => m.CoachComponent),
  canActivate: [onboardingGuard]
}
```

---

## UI de la page Coach

### Header
- Bouton retour (← Dashboard)
- Titre : "Coach IA"
- Icône indicateur de contexte chargé (optionnel)

### Sélecteur de période (chips ou button-toggle)
```
[ Aujourd'hui ] [ 7 jours ] [ Ce mois ]
```
Dès que la sélection change, le contexte est mis à jour. Pas de rechargement de la conversation.

### Zone de conversation
- Messages de type bulle (user à droite, IA à gauche)
- Chaque message IA peut contenir du markdown basique (gras, listes) → utiliser `innerHTML` avec un parser léger ou `marked` (à évaluer selon poids)
- Scroll automatique vers le bas à chaque nouveau message
- Indicateur de chargement (spinner ou "...") pendant la réponse Gemini

### Input
- `<textarea>` auto-resize (1 ligne → max 4 lignes)
- Bouton Envoyer (icône `send`) activé uniquement si texte non vide et pas en loading
- Raccourci : `Ctrl+Enter` ou `Cmd+Enter` pour envoyer

### État vide (première ouverture)
- Message d'accueil : "Bonjour ! Je suis votre coach nutritionnel. Posez-moi une question sur votre alimentation, je m'appuie sur votre historique des [période]."
- 2-3 questions suggérées sous forme de chips cliquables :
  - "Ai-je mangé assez de protéines ?"
  - "Comment améliorer mon équilibre macro ?"
  - "Résume ma journée en une phrase"

---

## Contexte envoyé à Gemini

### Données chargées selon la période sélectionnée

**Aujourd'hui** → `StorageService.getLogsByDate(today)`
**7 jours** → 7 appels `getLogsByDate` (ou `getLogsByMonth` filtré)
**Ce mois** → `getLogsByMonth(year, month)`

### Format du contexte injecté dans le prompt système

```
Profil utilisateur :
- Sexe : [homme/femme], Âge : [X] ans, Poids : [X] kg, Taille : [X] cm
- Objectif calorique quotidien : [X] kcal
- Objectif : [prise de masse / perte de poids / maintien]
- Niveau d'activité : [sédentaire / modéré / actif / très actif]

Historique nutritionnel ([période]) :
Date       | Repas            | Kcal | Prot | Glucides | Lipides
---------- | ---------------- | ---- | ---- | -------- | -------
2026-06-01 | Poulet au curry  |  635 |   47 |       60 |      23
...

Totaux sur la période :
- Calories : X kcal (moyenne : Y kcal/j)
- Protéines : X g (moyenne : Y g/j)
- Glucides : X g (moyenne : Y g/j)
- Lipides : X g (moyenne : Y g/j)
```

### Prompt système fixe (system instruction)

```
Tu es un coach nutritionnel bienveillant et expert. Tu t'appuies UNIQUEMENT sur les données de l'utilisateur fournies ci-dessus pour répondre.
Tes réponses sont concises (max 3-4 phrases sauf si l'utilisateur demande un détail), en français, en tutoyant l'utilisateur.
Tu n'inventes pas de données. Si une information manque, tu le signales.
Tu n'es pas un médecin. Pour toute question médicale, tu renvoies vers un professionnel de santé.
```

---

## Service Gemini — nouvelle méthode

Ajouter dans `GeminiService` :

```typescript
async askCoach(
  apiKey: string,
  contextData: CoachContext,
  conversation: ChatMessage[],
  userMessage: string
): Promise<string>
```

`CoachContext` :
```typescript
interface CoachContext {
  profile: UserProfile;
  period: 'today' | '7days' | 'month';
  logs: MealLog[];
  dateRange: { from: string; to: string };
}
```

`ChatMessage` :
```typescript
interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
```

Utiliser l'API **multi-turn chat** de Gemini (`startChat` avec `history`) pour maintenir le contexte conversationnel sans tout renvoyer à chaque message.

---

## État local (pas de persistance)

La conversation n'est pas sauvegardée entre sessions — c'est intentionnel (privacy-first). Un signal `messages = signal<ChatMessage[]>([])` dans le composant suffit.

Si l'utilisateur change de période, la conversation est réinitialisée (avec confirmation si > 2 messages).

---

## Gestion d'erreurs

Reprendre les codes d'erreur de `GeminiService.analyzeMeal` :
- 401/403 → clé invalide → rediriger vers Profile pour configurer la clé
- 503 → surcharge → message "L'IA est temporairement surchargée, réessaie dans quelques secondes"
- Réseau → "Impossible de joindre l'IA. Vérifie ta connexion."

---

## Dépendances

- **`StorageService`** : `getLogsByDate`, `getLogsByMonth` (déjà disponibles)
- **`ProfileService`** : `profile()` signal (déjà disponible)
- **`GeminiService`** : nouvelle méthode `askCoach`
- **Markdown rendering** : évaluer `marked` (8 kB gzip) vs rendu manuel — décider au moment de l'implem selon l'impact sur le budget bundle

---

## Points d'attention

| Sujet | Décision |
|---|---|
| Historique Gemini multi-turn | Utiliser `startChat({ history })` pour ne pas renvoyer toute la conv à chaque message |
| Contexte trop long (mois entier) | Limiter à 50 repas max, informer l'utilisateur si troncature |
| Clé API absente | Vérifier avant d'ouvrir la page, rediriger vers Profile si manquante |
| Suggestions initiales | 3 chips fixes hardcodées, pas d'IA pour les générer |
| Accessibilité | `aria-label` sur l'input, rôles `log` sur la zone de conversation |

---

## Statut

⏳ Planifié — après M7 (IA Coach recap) ou en parallèle si M7 est reporté.

La feature est indépendante de M7. Elle peut être développée en M9 séparément sans bloquer sur les recaps journaliers.
