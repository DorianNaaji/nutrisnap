# Module 3 : Scanner - Caméra & Gemini Vision

## Objectif
Le cœur de l'application : capturer un repas, le décrire si besoin, et obtenir une analyse nutritionnelle instantanée.

## 1. Capture & Image Processing (Multi-Mode)
- **Caméra** : Flux live avec `capture="environment"`.
- **Mode Multi-Photos** : Pouvoir accumuler plusieurs clichés (ex: plat + boisson) avant validation.
- **Mode Texte Seul** : Permettre de décrire le repas sans photo pour obtenir une estimation.
- **Tagging** : Sélection du type (Petit-déj, Déjeuner, Dîner, Collation).
- **Compression (Canvas API)** : Max 1024px, JPEG 0.7, < 200Ko.

## 2. Intégration Gemini 2.5 Flash & Contexte
- **Analyse Contextuelle** : Envoyer à l'IA l'historique de la journée (kcal consommées) et l'objectif total.
- **Prompt Système Strict (Gestion Hallucinations)** :
  ```text
  Tu es un expert en nutrition. Analyse ce repas.
  Contexte : L'utilisateur a consommé {X} sur {Y} kcal.
  [Optionnel] Précisions : {userText}

  Réponds UNIQUEMENT en JSON :
  {
    "status": "success | error",
    "food_name": "nom",
    "calories": number,
    "macros": { "prot": number, "carb": number, "fat": number },
    "analysis_summary": "description",
    "coach_tip": "Conseil personnalisé (ex: 'Allez-y doucement sur le diner' ou 'Bravo pour les protéines')",
    "error_message": "Si status=error, raison du refus (image floue, pas de nourriture...)"
  }
  ```

## 3. UI du Scanner
- Overlay "Viseur" Material Design.
- Bouton de déclenchement central.
- Champ texte "Ajouter une précision..." flottant.
- Loader élégant (ProgressBar déterminée ou indeterminate).


## 4. UX & Performance
- **Feedback visuel** : L'analyse pouvant prendre plusieurs secondes (Gemini 2.5 Flash), un spinner Material (mat-progress-spinner) est OBLIGATOIRE.
- **Skeleton Screens** : Affichage d'un skeleton pour les macros pendant le chargement pour réduire la perception d'attente.
- **Message d'état** : Afficher des messages changeants (ex: "Identification des ingrédients...", "Calcul des calories...") pour informer l'utilisateur.