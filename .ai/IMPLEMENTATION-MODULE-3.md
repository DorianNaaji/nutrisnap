# Module 3 : Scanner - Caméra & Gemini Vision

## Objectif
Le cœur de l'application : capturer un repas, le décrire si besoin, et obtenir une analyse nutritionnelle instantanée.

## 1. Capture & Image Processing
- **Caméra** : Utiliser `navigator.mediaDevices.getUserMedia` pour un flux live ou un input file avec `capture="environment"`.
- **Compression (Canvas API)** :
  - Redimensionnement : Max 1024px sur le plus grand côté.
  - Format : JPEG.
  - Qualité : 0.7 (70%).
  - Objectif : Obtenir un fichier < 200Ko pour un envoi ultra-rapide.

## 2. Intégration Gemini 2.5 Flash
- **Service** : `GeminiService`.
- **Payload** : 
  - Image (Base64/InlineData).
  - Texte (Prompt utilisateur optionnel).
- **Prompt Système Strict** :
  ```text
  Tu es un expert en nutrition. Analyse cette image de repas.
  [Optionnel] Précisions de l'utilisateur : {userText}

  Réponds UNIQUEMENT en JSON avec cette structure exacte :
  {
    "food_name": "nom précis du plat",
    "calories": number,
    "macros": { "prot": number, "carb": number, "fat": number },
    "ingredients_detected": [
      { "name": "nom", "est_weight_g": number, "confidence": number }
    ],
    "analysis_summary": "courte description de l'analyse",
    "confidence_score": "low|medium|high",
    "vegan_alternative": { "name": "string", "calories": number } | null
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