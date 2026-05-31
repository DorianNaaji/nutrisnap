# SESSION REPORT — DevX / Déploiement OVH

**Date** : 31 mai 2026  
**Commit** : à venir

---

## 1. Infrastructure de déploiement

### Stack
- **`npm run start:sync`** : lance `ng build --watch` + `node scripts/deploy.js` en parallèle via `concurrently`
- **`scripts/deploy.js`** : `chokidar` surveille `dist/nutrisnap/browser/`, `basic-ftp` uploade chaque fichier modifié vers OVH via FTP

### Bug corrigé — concurrence FTP
`basic-ftp` ne supporte qu'un seul transfert à la fois. Le premier build Angular écrit ~20 fichiers simultanément → `chokidar` fire tous les events en parallèle → crash client FTP.

**Fix** : queue séquentielle avec `Set` (déduplication automatique) + flag `isProcessing`. Les fichiers s'accumulent dans le Set et sont uploadés un par un.

### Bug corrigé — déconnexion FTP OVH
OVH coupe les connexions FTP inactives (FIN packet inattendu). Deux fixes :
- **Retry récursif** dans `uploadFile(localPath, attempt)` — jusqu'à 3 tentatives avec reconnexion entre chaque
- **Keepalive** — `NOOP` FTP toutes les 30s pour maintenir la connexion active

---

## 2. Déploiement OVH

### Configuration multisite OVH
- Sous-domaine `nutrisnap.dorian-naaji.fr` → dossier racine FTP : `/nutrisnap`
- `www/` → blog WordPress existant (dorian-naaji.fr/blog/) — **ne pas toucher**
- Les deux coexistent sans interférence (dossiers racine distincts dans la config Apache multisite)

### Variables d'environnement (`.env`, non versionné)
```
FTP_HOST=ftp.cluster129.hosting.ovh.net
FTP_USER=...
FTP_PASSWORD=...
FTP_REMOTE_DIR=/nutrisnap
```

---

## 3. Routing SPA — résolution du 404 sur F5

### Problème
Accès direct à `https://nutrisnap.dorian-naaji.fr/onboarding` → Apache retourne 404 car `/onboarding` n'existe pas comme fichier physique.

### Tentatives échouées
- `FallbackResource /index.html` — non supporté sur OVH (requiert `AllowOverride Indexes`)
- `RewriteRule ^(.*)$ index.html [L]` avec `RewriteBase /` — chemin relatif mal résolu par Apache OVH
- `<IfModule mod_rewrite.c>` wrapper — peut être ignoré silencieusement selon la config mod_rewrite OVH

### Solution finale
```apache
Options +FollowSymLinks -Indexes

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L,QSA]

ErrorDocument 404 /index.html
```

**Clé** : `Options +FollowSymLinks` est obligatoire sur OVH mutualisé pour activer `RewriteEngine`. Sans lui, le moteur de rewrite s'active mais les règles sont silencieusement ignorées.
`ErrorDocument 404` en filet de sécurité.

---

## 4. Anti-indexation — état final

Trois couches en place :
1. `robots.txt` — `Disallow: /` pour tous les agents
2. `<meta name="robots">` dans `index.html` — `noindex, nofollow, noarchive, nosnippet`
3. `.htaccess` — `X-Robots-Tag` header HTTP + bot blocking User-Agent (403)

---

## 5. Fixes UI

- **Favicon** : cache-buster `?v=2` dans `index.html` + switch vers `favicon-1.ico` (128×128)
- **Métriques corporelles** : `advanced-grid` forcé en `1fr` (une colonne) dans onboarding ET profile — labels trop longs pour un affichage 2 colonnes sur mobile

---

## 6. Règles à retenir pour OVH

| Problème | Solution |
|---|---|
| Routing SPA (F5 = 404) | `Options +FollowSymLinks` + `RewriteRule ^(.*)$ /index.html [L,QSA]` + `ErrorDocument 404 /index.html` |
| FallbackResource | Ne pas utiliser sur OVH mutualisé |
| Fichiers cachés FTP | WinSCP → Ctrl+Alt+H pour afficher les `.htaccess` |
| FTP idle disconnect | Keepalive NOOP toutes les 30s |
| Upload concurrent FTP | Queue séquentielle, un seul transfert à la fois |
