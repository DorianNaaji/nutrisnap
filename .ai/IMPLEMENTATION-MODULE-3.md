# Module 3 : Scanner - Caméra & Gemini Vision

## Objectif
Le cœur de l'application : capturer un repas, le décrire si besoin, et obtenir une analyse nutritionnelle instantanée.

## 1. Capture & Image Processing (Flex-Mode)
- **Flux Caméra** : `navigator.mediaDevices.getUserMedia` ou input file.
- **Mode Flexible** :
  - **Photos cumulées** : L'utilisateur peut prendre une ou plusieurs photos (ex: son assiette, son verre, l'étiquette d'un dessert).
  - **Texte complémentaire** : Un champ de texte est toujours disponible pour ajouter des précisions (ex: "environ 200g de riz") ou pour décrire le repas si aucune photo n'est prise.
  - **Analyse Mixte** : L'IA reçoit l'ensemble des photos ET le texte pour une analyse globale.
- **Tagging obligatoire** : Type de repas (Petit-déj, Déjeuner, Dîner, Collation).

## 2. Intégration Gemini 2.5 Flash (Intelligence Contextuelle)
- **Contexte envoyé** :
  - Images (Base64).
  - Description utilisateur.
  - Historique calorique du jour (kcal consommées).
  - Objectif calorique total (Profil).
- **Gestion des Hallucinations & Erreurs** :
  - Format JSON avec champ `status` obligatoire.
  - Si l'utilisateur saisit du texte incohérent ou une photo non-alimentaire, l'IA doit renvoyer `status: "error"` avec un message explicatif dans `error_message`.

## 3. UI du Scanner
- Overlay "Viseur" Material Design.
- Bouton de déclenchement central.
- Champ texte "Ajouter une précision..." flottant.
- Loader élégant (ProgressBar déterminée ou indeterminate).


## 4. UX & Performance
- **Feedback visuel** : L'analyse pouvant prendre plusieurs secondes (Gemini 2.5 Flash), un spinner Material (mat-progress-spinner) est OBLIGATOIRE.
- **Skeleton Screens** : Affichage d'un skeleton pour les macros pendant le chargement pour réduire la perception d'attente.
- **Message d'état** : Afficher des messages changeants (ex: "Identification des ingrédients...", "Calcul des calories...") pour informer l'utilisateur.