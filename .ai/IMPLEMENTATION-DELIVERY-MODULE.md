# DELIVERY-MODULE.md - Plan de Déploiement & DevX (OVH)

Ce document décrit le plan d'action itératif pour mettre en œuvre, automatiser et optimiser le déploiement de NutriSnap sur l'hébergement OVH (`nutrisnap.dorian-naaji.fr`).

---

## 📋 Étape 1 : Validation du Déploiement Manuel sur OVH
L'objectif est de s'assurer que l'application fonctionne parfaitement sur l'hébergement mutualisé d'OVH et que tous les aspects techniques (HTTPS, routage, scanner) sont fonctionnels.

1. **Génération du build de production** :
   ```bash
   npm run build
   ```
2. **Transfert FTP** :
   - Se connecter à l'espace FTP d'OVH (via FileZilla ou un client équivalent).
   - Uploader le contenu de `dist/nutrisnap/browser/` dans le dossier cible associé au sous-domaine (ex: `/www/nutrisnap/` ou `/nutrisnap/`).
3. **Tests de validation** :
   - Accéder à `https://nutrisnap.dorian-naaji.fr/` depuis un navigateur de bureau et mobile.
   - Vérifier que le rechargement de la page sur les routes secondaires (ex: `/profile` ou `/scanner`) ne renvoie pas de 404 (validation du `.htaccess`).
   - Tester l'activation de la caméra sur appareil mobile iOS/Android (validation du HTTPS).

---

## 🧹 Étape 2 : Nettoyage de la configuration
Une fois le déploiement de production validé, nous ferons le ménage dans le projet :
- Retrait définitif des scripts et dépendances liés aux tunnels locaux temporaires (`localhost.run`, `localtunnel`, `pinggy`) dans `package.json` et `angular.json` si le développement se fait directement via le flux de déploiement automatique.

---

## 🚀 Étape 3 : Optimisation DevX - Déploiement Auto (Watch & Sync)
Pour éviter d'avoir à faire des transferts FTP manuels après chaque modification pendant les phases de développement, nous allons mettre en place un système de **déploiement automatique en temps réel**.

### Principe de fonctionnement de l'auto-redeploy :
Nous allons créer un script Node.js (ex: `deploy.js` utilisant la bibliothèque `basic-ftp` ou `ftp-deploy`) et l'associer au watcher d'Angular.

1. **Commande de développement synchronisé** :
   On lance Angular en mode watch pour reconstruire l'application à chaque sauvegarde :
   ```bash
   ng build --watch
   ```
2. **Watcher de synchronisation** :
   Un script surveille le dossier `dist/nutrisnap/browser/` et envoie automatiquement par FTP uniquement les fichiers modifiés vers le serveur OVH.
### Configuration du script :
- Les identifiants FTP OVH seront chargés via des variables d'environnement (`process.env.FTP_HOST`, `process.env.FTP_USER`, `process.env.FTP_PASSWORD`).
- Ces variables devront être définies localement sur la machine de développement ou via un fichier `.env` (impérativement exclu de Git par `.gitignore`).


---

## 🛠️ Actions Immédiates
- **[ ] Action 1** : Lancer le build de production local pour vérifier qu'aucune erreur ne se produit.
- **[ ] Action 2** : Attendre que vous ayez configuré le sous-domaine `nutrisnap.dorian-naaji.fr` sur OVH et récupéré vos accès FTP.
- **[ ] Action 3** : Uploader manuellement une première version pour valider le `.htaccess` et la caméra.
- **[ ] Action 4** : Implémenter le script de déploiement automatique.
