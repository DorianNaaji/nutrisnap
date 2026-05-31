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
- [ ] **Styles Globaux (`styles.css`)** : Définition des Design Tokens (Couleurs M3, Spacing, Radius, Elevation).
- [ ] **Thème Material (`material-theme.scss`)** : Migration complète vers une configuration Material 3 basée sur les nouveaux tokens.
- [ ] **Typography** : Intégration de la police "Inter" et de la police d'icônes "Material Symbols Rounded".

### Phase 2 : Refonte des Composants Transverses
- [ ] **Layout & App Root** : Gestion du mode Sombre/Clair via attribut `data-theme`.
- [ ] **Boutons & Cartes** : Standardisation des styles `mat-card` et `mat-button` selon les mapping M3.
- [ ] **Legal Footer** : Mise à jour esthétique pour plus de discrétion.

### Phase 3 : Refonte des Features
- [ ] **Dashboard** : 
    - [ ] Implémenter la nouvelle "Hero Card" en dégradé pour les calories restantes.
    - [ ] Refondre les "Macro Cards" en `Surface Variant`.
    - [ ] Redessiner l'état vide (Empty State) de l'historique.
- [ ] **Profil** :
    - [ ] Réorganiser les formulaires avec le nouveau système de grille.
    - [ ] Harmoniser les boutons d'action (FAB vs Flat buttons).
    - [ ] Refondre la section "Gestion des données" selon le nouveau standard.
- [ ] **Onboarding** :
    - [ ] Moderniser le stepper et les cartes d'accueil.
    - [ ] Appliquer les nouveaux tokens de couleur.

### Phase 4 : Validation & Polissage
- [ ] **Dark Mode** : Vérification des contrastes et de l'accessibilité.
- [ ] **Animations** : Ajout de transitions douces sur les changements d'état.
- [ ] **Audit Final** : Cohérence globale sur tous les écrans.

## 4. Mapping de Couleurs (M3)
| Token | Valeur Light | Valeur Dark | Usage |
| :--- | :--- | :--- | :--- |
| `primary` | `#059669` | `#10b981` | Actions principales, accents |
| `surface` | `#ffffff` | `#1e293b` | Cartes, conteneurs |
| `background` | `#f8fafc` | `#0f172a` | Fond de page |
| `outline` | `#cbd5e1` | `#475569` | Bordures subtiles, dividers |

---
*Ce document servira de feuille de route pour les prochaines étapes de développement.*
