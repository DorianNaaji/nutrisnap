# Design System - NutriSnap "Premium Health OS"

Ce document détaille les principes visuels et techniques de l'interface NutriSnap.

## 1. Identité Visuelle
L'application utilise une charte **Premium Health OS**, inspirée des outils de santé haut de gamme.
- **Primaire** : Vert Émeraude (`#059669`) pour les actions et la vitalité.
- **Surfaces** : Blanc Pur (`#ffffff`) pour une clarté clinique et maximale.
- **Typographie** : "Inter" (Sans-serif moderne).
- **Icônes** : Material Symbols Rounded.

## 2. Infrastructure Technique (Socle)
Le design system repose sur des **Design Tokens** (Variables CSS) définis dans `src/styles.css`.
- `--primary` : Couleur de marque.
- `--surface` : Fond des cartes et conteneurs.
- `--background` : Fond de page (Gris-bleu très léger `#f8fafc`).
- `--radius-xl` : Arrondi standard des cartes (28px).

## 3. Issue : Tonal Palette Tinting (L'incident du fond jaune)

### Le Problème
Angular Material 3 (M3) utilise un algorithme de **génération de palettes tonales**. Par défaut, M3 dérive les couleurs de "Surface" à partir de la couleur "Primaire".
Comme notre primaire est un Vert, l'algorithme générait des surfaces légèrement teintées en jaune/vert (ex: `#F3F4ED`) pour créer une "harmonie". Ce comportement donnait un aspect "sale" ou "jaunâtre" aux cartes.

### La Solution
Pour garantir des surfaces blanc pur, nous avons dû court-circuiter l'algorithme M3 à deux niveaux :

1. **Variables Système (Globales)** : Dans `material-theme.scss`, nous forçons les tokens système M3 à pointer vers le blanc pur.
   ```css
   --md-sys-color-surface: #ffffff;
   --md-sys-color-surface-container: #ffffff;
   --md-sys-color-surface-variant: #ffffff;
   ```

2. **Surcharge de Composant** : Dans `styles.css`, la classe `.mat-mdc-card` (utilisée par notre composant `ns-card`) force la variable interne MDC.
   ```css
   .mat-mdc-card {
     --mdc-card-container-color: #ffffff !important;
     background-color: var(--mdc-card-container-color) !important;
   }
   ```

## 4. Composants Réutilisables
### `ns-card`
Utiliser systématiquement `<ns-card>` au lieu de `mat-card` directement.
- `variant="surface"` : Fond blanc (par défaut).
- `variant="surface-variant"` : Fond gris-bleu neutre (pour le dashboard).

## 5. Maintenance
Pour changer l'identité de l'application, modifier uniquement les tokens dans `:root` de `styles.css`. Ne pas réintroduire de couleurs en dur dans les composants.
