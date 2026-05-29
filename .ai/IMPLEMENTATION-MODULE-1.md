# Module 1 : Onboarding - Métabolisme & API

## Objectif
Permettre à l'utilisateur de configurer son profil métabolique et de valider sa clé API Gemini pour débloquer l'application.

## Étapes de l'Onboarding
1. **Écran de Bienvenue** : Présentation des valeurs (Privacy, Gratuité via Bring Your Own Key).
2. **Consentement RGPD** : Explication claire que les données restent dans IndexedDB.
3. **Formulaire Métabolique** :
   - Sexe (Homme/Femme)
   - Âge (ans)
   - Poids (kg)
   - Taille (cm)
   - Niveau d'activité (Sédentaire à Extrêmement actif)
4. **Définition de l'Objectif** :
   - Perte de poids (Doux -300, Modéré -500, Agressif -750 kcal)
   - Maintenance
   - Prise de masse
5. **Configuration API** : Champ de saisie pour la clé Gemini API.

## Logique Métabolique (Mifflin-St Jeor)
L'application doit calculer automatiquement :
- **BMR** : `10*poids + 6.25*taille - 5*age (+5 homme / -161 femme)`
- **TDEE** : `BMR * activite`
- **Objectif Calorique** : `TDEE - deficit` (Minimum floor à 1200 kcal).

## Validation Technique
- Créer un `ProfileService` utilisant les Angular Signals pour stocker l'état en mémoire.
- Implémenter une méthode `validateApiKey()` qui fait un appel simple (ex: "Hello" text-only) pour confirmer que la clé est valide avant de fermer l'onboarding.

## Évolutivité & Gestion des données
- **Page Profil** : L'utilisateur doit pouvoir modifier à tout moment ses statistiques (poids, body fat, etc.).
- **Data Control** : La page profil doit proposer :
  - L'export complet de la base de données (JSON).
  - La suppression totale des données locales (IndexedDB).
- **Privacy Policy** : Rappel clair que les données transitent par Google via l'API Key, et que le développeur (Dorian Naaji) est totalement déresponsabilisé de l'utilisation de l'API.

## Étape IA "Coach de vie"
À la fin de l'onboarding, une étape finale doit générer une analyse par Gemini basée sur les données métaboliques pour offrir un feedback de "coach" (conseils sur le déficit, l'activité, etc.).
