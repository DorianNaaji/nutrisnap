# Module 2 : Data Engine - Dexie.js & Persistence

## Objectif
Mettre en place une couche de persistance robuste et performante pour stocker l'historique et les images sans dépendre d'un serveur.

## Schéma de Base de Données (Dexie.js)
```typescript
db.version(1).stores({
  profile: '++id, age, weight, height, activity, goal, apiKey',
  logs: '++id, date, calories, proteins, carbs, fats, ingredients, analysisSummary, confidence, imageBlob',
  settings: 'id, theme, language'
});
```

## Fonctionnalités Profil
- Implémenter la vue `ProfileComponent` permettant de modifier l'ensemble des données métaboliques (poids, body fat, etc.).
- Ajouter les fonctionnalités d'export et de suppression des données locales (IndexedDB).

## Gestion des Images
- Les images ne doivent pas être stockées en Base64 (trop lourd pour les index).
- Utiliser des **Blobs** ou des **ArrayBuffers** pour le stockage dans IndexedDB.
- Implémenter une logique de nettoyage : si la DB dépasse une certaine taille (ex: 50Mo), proposer à l'utilisateur de purger les anciennes photos tout en gardant les données textuelles.

## Performance
- Utiliser les Angular Signals pour synchroniser l'UI avec la base de données de manière réactive.
