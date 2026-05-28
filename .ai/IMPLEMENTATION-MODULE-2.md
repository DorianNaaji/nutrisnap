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

## Services à implémenter
1. **`StorageService`** : Wrapper autour de Dexie pour :
   - Sauvegarder/Récupérer le profil.
   - Ajouter une entrée de log (repas).
   - Récupérer les logs d'une journée spécifique (index sur le champ `date`).
   - Supprimer une entrée.
2. **`ExportService`** :
   - Fonction `exportToJson()` : Téléchargement d'un fichier JSON contenant toute la DB.
   - Fonction `importFromJson()` : Restauration des données avec validation du schéma.

## Gestion des Images
- Les images ne doivent pas être stockées en Base64 (trop lourd pour les index).
- Utiliser des **Blobs** ou des **ArrayBuffers** pour le stockage dans IndexedDB.
- Implémenter une logique de nettoyage : si la DB dépasse une certaine taille (ex: 50Mo), proposer à l'utilisateur de purger les anciennes photos tout en gardant les données textuelles.

## Performance
- Utiliser les Angular Signals pour synchroniser l'UI avec la base de données de manière réactive.
