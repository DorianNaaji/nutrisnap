# Rapport d'Initialisation de la Documentation - NutriSnap

## Travail Réalisé
1. **Analyse du POC** : Étude de l'implémentation validée dans `~/ops/nutrisnap-poc`.
   - Utilisation confirmée de **Gemini 2.5 Flash**.
   - Validation de la structure JSON de retour pour l'analyse nutritionnelle.
   - Validation de la logique de compression d'image côté client (Canvas API).
2. **Mise à jour du README** : Passage à Gemini 2.5 Flash dans la stack technique.
3. **Harmonisation des Instructions Initiales** :
   - Mise à jour du modèle d'IA recommandé vers 2.5 Flash.
   - Alignement du schéma JSON cible sur les résultats du POC (plus descriptif et complet).
   - Précision sur le stockage des images en Blob dans Dexie.js.
4. **Mise à jour du Module 3 (Scanner)** :
   - Actualisation du Prompt Système pour correspondre à la structure validée.
   - Intégration des champs `ingredients_detected` et `confidence_score`.

## Prochaines Étapes
- Lancer l'implémentation du **Module 1 : Onboarding - Métabolisme & API**.
- Mise en place du `ProfileService` et de la logique de calcul Mifflin-St Jeor.
- Création de l'interface de bienvenue et de configuration API.

## Notes Techniques
Le modèle Gemini 2.5 Flash a montré une excellente capacité à structurer les données en JSON nativement via l'option `responseMimeType: 'application/json'`, ce qui simplifie grandement le parsing côté Angular.
