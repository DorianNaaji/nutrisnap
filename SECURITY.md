# NutriSnap - Sécurité & Configuration

## ⚠️ Avertissements de Sécurité (Important)

### 1. Configuration de Développement (Tunneling)
Pour permettre le test de l'application sur mobile via des services de tunneling (ex: Localtunnel, Ngrok), la commande de lancement utilise le flag :
`--allowed-hosts=all`

**ATTENTION :** 
- **Risque** : Cette configuration désactive la validation de l'en-tête `Host` du serveur de développement, exposant potentiellement l'application à des attaques de type "DNS rebinding" si elle est utilisée dans un environnement non sécurisé.
- **Usage** : **Strictement réservé au développement local.**
- **Production** : Cette option **doit impérativement être retirée** avant tout déploiement en production ou toute mise en ligne sur un serveur public.

### 2. Responsabilité de Traitement (Modèle "Bring Your Own Key")
NutriSnap utilise un modèle "Bring Your Own Key". Une fois votre clé API saisie, les données sont traitées directement par Google. Le développeur (Dorian Naaji) :
- Ne stocke **aucune donnée** sur un serveur tiers.
- N'agit pas en tant que responsable de traitement pour les flux de données transitant par l'API Google Gemini.
- Décline toute responsabilité concernant l'usage, la sécurité ou la confidentialité des données traitées par l'API Google, qui relèvent de la responsabilité exclusive de Google et de l'utilisateur.

### 3. Confidentialité "Zero-Backend"
Toutes les informations (profil, clés, historiques) sont stockées localement dans votre navigateur (IndexedDB). Dorian Naaji n'a aucun accès technique à vos données ou à l'usage que vous faites de votre clé API.
