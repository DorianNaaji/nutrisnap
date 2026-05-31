# IMPLEMENTATION-DESIGN-OVERHAUL-MODULE.md - Refonte Design System "Premium Health OS"

## 1. Vision & Principes
Transition d'un design "pastel/artisanal" vers une interface type **Health OS (SaaS Premium)** :
- **Crédibilité scientifique** : Palette sobre, typographie "Inter", contrastes élevés.
- **Material 3 (M3)** : Utilisation stricte des rôles de surface (Surface, Surface Variant) et élévations douces.
- **Design System Centralisé** : Utilisation de CSS Variables (Design Tokens) pour une maintenance simplifiée et un support Dark Mode natif.

## 2. Audit de l'existant
- **Onboarding** : Stepper standard, design un peu "flat", manque de profondeur.
- **Dashboard** : Cartes hétérogènes, manque de hiérarchie visuelle claire.
- **Profil** : Formulaires denses, boutons de sauvegarde redondants, couleurs de gestion de données inélégantes.
- **Scanner** : Non audité en détail mais devra suivre la nouvelle charte.

## 3. Plan d'exécution

### Phase 1 : Infrastructure & Tokens (Core)
- [x] **Styles Globaux (`styles.css`)** : Design Tokens définis (Couleurs M3, Spacing, Radius, Elevation, State overlays).
- [x] **Thème Material (`material-theme.scss`)** : Migration complète Material 3 — light + dark définis.
- [x] **Typography** : Inter + Material Symbols Rounded intégrés.

### Phase 2 : Refonte des Composants Transverses
- [x] **Layout & App Root** : Dark/Light/System via `[data-theme]` sur `<html>` — `ThemeService` + `APP_INITIALIZER`.
- [x] **Boutons & Cartes** : `mat-card` et `mat-button` standardisés, `NsCardComponent` partagé.
- [x] **Legal Footer** : Intégré discret sur Onboarding et Profile.

### Phase 3 : Refonte des Features
- [x] **Dashboard** : Hero Card calories, Macro Cards Surface Variant, Empty State, Timeline repas.
- [x] **Profil** : Formulaires réorganisés, section Apparence (toggle thème), Données avancées en expansion panel, Gestion des données.
- [x] **Onboarding** : Stepper modernisé, tokens appliqués, card arrondie (`--mat-card-elevated-container-shape`).

### Phase 4 : Validation & Polissage
- [x] **Dark Mode** : ThemeService complet, persistance NutriDB, réactif aux préférences système en temps réel.
- [ ] **Animations** : Transitions douces sur changements d'état (non encore travaillées).
- [x] **Audit CSS** : 0 `!important`, 0 `::ng-deep` — dette technique éliminée (session 31/05/2026).

## 4. Mapping de Couleurs (M3)
| Token | Valeur Light | Valeur Dark | Usage |
| :--- | :--- | :--- | :--- |
| `primary` | `#059669` | `#10b981` | Actions principales, accents |
| `surface` | `#ffffff` | `#1e293b` | Cartes, conteneurs |
| `background` | `#f8fafc` | `#0f172a` | Fond de page |
| `outline` | `#cbd5e1` | `#475569` | Bordures subtiles, dividers |

---
*Ce document servira de feuille de route pour les prochaines étapes de développement.*
