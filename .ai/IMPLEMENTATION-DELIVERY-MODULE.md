# DELIVERY-MODULE.md - Plan de Déploiement & DevX (OVH)

Ce document décrit le plan d'action pour automatiser le déploiement de NutriSnap sur l'hébergement OVH.

---

## 🚀 Étape 3 : Optimisation DevX - Déploiement Auto (Watch & Sync)

### Nouveaux Scripts NPM
- `npm run start` : Développement local standard sur port 4200.
- `npm run start:sync` : Mode hybride qui lance le build Angular en mode watch **ET** le script de synchronisation FTP en temps réel.

### Architecture du script `deploy.js`
Le script utilisera `basic-ftp` pour une gestion robuste des transferts et `chokidar` pour surveiller les changements dans `dist/`.

#### Caractéristiques du script :
1. **Logging Avancé** : Chaque transfert doit être loggé dans la console avec horodatage et statut (SUCCESS/ERROR).
2. **Gestion des Variables d'Env** : Chargement via un fichier `.env` local (exclu de Git).
   - `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`, `FTP_REMOTE_DIR`.
3. **Optimisation** : Seuls les fichiers modifiés sont envoyés (Delta Sync).
4. **Résilience** : Gestion automatique des déconnexions FTP.

---

## 🛠️ Actions — Prochaine session DevX/Deploy

- **[ ] Action 1** : Installer les dépendances `basic-ftp` et `dotenv`.
- **[ ] Action 2** : Créer le script `scripts/deploy.js` (logging horodaté, delta sync, reconnexion auto).
- **[ ] Action 3** : Configurer les scripts dans `package.json` (`start`, `start:sync`, `build:prod`).
- **[ ] Action 4** : Créer `.env.example` et documenter la procédure dans `README.md`.
- **[ ] Action 5** : Vérifier le build production (budget warnings) et configurer `angular.json` si nécessaire.

## Variables d'environnement requises (.env)
```
FTP_HOST=
FTP_USER=
FTP_PASSWORD=
FTP_REMOTE_DIR=
```
