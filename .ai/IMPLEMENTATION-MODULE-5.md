# Module 5 : PWA / Offline

## Statut : ✅ Complet (testé sur mobile HTTPS, 31/05/2026)

## Réalisé
- Service Worker Angular (`ngsw-config.json`) en place
- `manifest.webmanifest` configuré (icônes, `display: standalone`, `theme_color`)
- App installable sur mobile via HTTPS OVH (`nutrisnap.dorian-naaji.fr`)
- Anti-indexation : `robots.txt` + `<meta robots>` + `.htaccess` X-Robots-Tag

## Notes
- L'URL de production est `https://nutrisnap.dorian-naaji.fr`
- Le déploiement se fait via `npm run start:sync` (FTP delta sync OVH)
- Voir `SESSION_REPORT-31-05-2026-DEPLOY.md` pour les détails techniques OVH
