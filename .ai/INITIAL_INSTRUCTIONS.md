# NutriSnap - Full Application Specification

## 1. Vision du Projet
NutriSnap est une PWA (Progressive Web App) "Privacy-First" permettant le suivi nutritionnel automatisé par IA. L'application est conçue pour être ultra-rapide, élégante (Style Google/Material 3) et sans coût d'infrastructure pour l'utilisateur (Modèle "Bring Your Own Key").

## 2. Stack Technique & Design System
- **Framework** : Angular (v17+) avec Signals pour une réactivité optimale.
- **UI Library** : Angular Material (M3 Theme).
- **Design System** :
  - **Typographie** : Roboto / Google Sans (si disponible).
  - **Couleurs** : 
    - Primaire : #1A5236 (Deep Green)
    - Surface : #FBFCF8 (Off-White)
    - Accents : Material Design 3 Color Palette (M3).
  - **Styles** : Angles arrondis (24px+ pour les boutons/cards), ombres douces, animations de transition fluides.
- **Persistence** : IndexedDB via **Dexie.js** pour la gestion des logs, des images compressées et du profil.
- **Architecture** : "Zero-Backend", tout le traitement (IA, Calculs, Stockage) se fait dans le navigateur.
- **IA** : Google Gemini 2.5 Flash (Analyses multi-modales ultra-rapides).

## 3. Architecture des Composants (Clean Design)
- **Core Components** :
  - `LayoutComponent` : Shell avec barre de navigation inférieure (Material Bottom Navigation).
  - `CameraService` : Gestion de l'accès caméra et compression Canvas (JPEG 70%, 1024px max).
  - `GeminiService` : Orchestrateur "Bring Your Own Key" pour l'API Vision (Utilise `gemini-2.5-flash`).
- **Feature Modules** :
  - **Dashboard** : Anneau de progression central (Calories), widgets de macros, timeline quotidienne.
  - **Scanner** : Interface de capture plein écran avec feedback visuel.
  - **Stats** : Graphiques hebdomadaires/mensuels (via chart.js ou ngx-charts).
  - **Profile** : Calculateur métabolique (Mifflin-St Jeor), gestion de la clé API, export/import JSON.

## 4. Spécifications Techniques Avancées
### Gestion des Images
Pour éviter de saturer IndexedDB, chaque photo capturée doit être :
1. Redimensionnée à 1024px max (largeur/hauteur) tout en conservant le ratio.
2. Compressée en JPEG (qualité 0.7).
3. Stockée en Blob dans Dexie.

### Prompt Système Gemini 2.5 Flash
Basé sur le POC validé :
```text
Tu es un expert en nutrition. Analyse cette image de repas.
[Optionnel] Précisions de l'utilisateur : {userText}

Retourne un objet JSON valide avec cette structure précise :
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
## 5. Roadmap de Développement
1. **Module 1 : Onboarding** - Création du profil métabolique et validation de la clé API.
2. **Module 2 : Data Engine** - Schéma Dexie.js et services de persistence.
3. **Module 3 : Scanner** - Intégration caméra + Gemini Vision.
4. **Module 4 : UI/UX** - Raffinement Material Design 3, mode sombre/clair adaptatif.
5. **Module 5 : PWA** - Service Worker, Manifest, et Offline Support.
