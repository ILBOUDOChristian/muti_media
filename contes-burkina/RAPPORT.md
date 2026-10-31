<div align="center">

# UNIVERSITÉ JOSEPH KI-ZERBO

### INSTITUT BURKINABÈ DES ARTS ET MÉTIERS (IBAM)

#### Master 1 Informatique

<br />

## RAPPORT DE PROJET MULTIMÉDIA

### Les Voix du Faso

**Plateforme web bimodale de valorisation, numérisation et transmission du patrimoine oral burkinabè**

<br />

**Présenté par : Groupe n° 15**
- **ILBOUDO Songr La Panga Christian**
- **NIKIEMA Palingwendé Aude Stanislas**
- **NEYA Yesso Yasmina**
- **KABORE Julius Wendkuuni**

**Encadrant :** M. Simpore Odilon
**Contact :** Odilon.simpore@gobelab.org
**Année universitaire :** 2025 – 2026
**Délai de rendu :** 4 novembre 2026

<br />

**Ouagadougou, Burkina Faso**

</div>

---

## Résumé

Ce rapport présente la conception et le développement de « **Les Voix du Faso** », une application web dédiée à la numérisation et à la transmission du patrimoine oral burkinabè. Le projet propose une expérience bimodale :

1. Une **carte interactive 3D** (Three.js), modélisant le relief du plateau latéritique burkinabè, avec 13 régions extrudées depuis des données GeoJSON officielles et un diorama de village traditionnel animé.
2. Un **atlas cartographique 2D** (Leaflet & OpenStreetMap) pour une consultation géographique précise.
3. Une **collection de 4 contes documentés** en Mooré, Dioula, Fulfulde et Bissa, avec enregistrements audio authentiques et navigation chapitrée.

**Mots-clés :** Patrimoine oral, Burkina Faso, Three.js, Leaflet, Accessibilité WCAG 2.1 AA, WAVE, Mooré, Dioula, Fulfulde, Bissa.

---

## Table des matières

1. [Introduction générale](#1-introduction-générale)
2. [Contexte culturel & État de l'art](#2-contexte-culturel--état-de-lart)
3. [Cahier des charges & Objectifs](#3-cahier-des-charges--objectifs)
4. [Architecture Technique](#4-architecture-technique)
5. [Audit Expert : Vue 3D vs Vue 2D](#5-audit-expert--vue-3d-vs-vue-2d)
6. [Accessibilité Numérique & Audit WAVE](#6-accessibilité-numérique--audit-wave)
7. [Procédure d'Émulation & Tests](#7-procédure-démulation--tests)
8. [Limites & Perspectives d'Évolution](#8-limites--perspectives-dévolution)
9. [Conclusion générale](#9-conclusion-générale)
10. [Références & Annexes](#10-références--annexes)

---

## 1. Introduction générale

### 1.1 Contexte

Le Burkina Faso est un pays d'une richesse culturelle immatérielle exceptionnelle. Sa tradition orale — transmise lors des veillées familiales sous le clair de lune ou à l'ombre de l'arbre à palabres — constitue le cœur vivant de son identité nationale. L'UNESCO, qui a reçu la ratification du Burkina Faso à la Convention pour la sauvegarde du patrimoine culturel immatériel en **2006**, a soutenu des projets d'inventaire national ayant permis de répertorier **entre 1 300 et 1 500 éléments culturels et traditions vivantes** répartis sur l'ensemble du territoire (UNESCO/INSS, 2010-2020).

Avec **plus de 60 langues parlées** et une soixantaine de groupes ethnolinguistiques distincts, chaque communauté possède son propre corpus de contes, épopées, proverbes et chants.

### 1.2 Problématique

Comment concevoir une plateforme web moderne permettant de redécouvrir ces récits de manière captivante et scientifiquement honnête, tout en intégrant des repères géographiques vérifiables et en garantissant une accessibilité universelle ?

### 1.3 Position épistémologique

Ce projet est un **prototype académique de première démonstration**, non une encyclopédie exhaustive. Les affirmations quantitatives sont systématiquement sourcées ou qualifiées d'indicatives. Le nombre total de contes au Burkina Faso est considérable et non connu avec précision — les chercheurs (Alain-Joseph Sissao, Christiane Seydou, Leo Frobenius) ont chacun documenté plusieurs centaines de textes. Ce prototype intègre **4 récits représentatifs** de 4 groupes linguistiques.

---

## 2. Contexte culturel & État de l'art

### 2.1 Données vérifiées sur le patrimoine oral burkinabè

| Dimension | Données vérifiées | Source |
|---|---|---|
| Langues parlées | ~60 langues nationales recensées | UNESCO, CNRST-INSS Ouagadougou |
| Éléments culturels immatériels inventoriés | ~1 300 à 1 500 | UNESCO, inventaire 2010-2020 |
| Groupes ethnolinguistiques | ~60 communautés | INSD Burkina Faso (RGPH) |
| Ratification Convention UNESCO PCI | 2006 | UNESCO |
| Inscription UNESCO (Balafon) | 2012 (avec Mali & Côte d'Ivoire) | UNESCO Liste représentative |
| Langues intégrées dans ce prototype | 4 (Mooré, Dioula, Fulfulde, Bissa) | Corpus propre du projet |
| Récits documentés dans ce prototype | 4 récits | Corpus propre du projet |

> **Note :** Le nombre total de récits oraux burkinabè est inconnu et certainement très élevé. Ce prototype n'en intègre que 4, représentatifs de 4 groupes linguistiques majeurs.

### 2.2 Tradition orale par grands groupes culturels

**Les Mossi (Mooré)** — groupe majoritaire (> 50 % de la population). Les contes mossis (*maroo*) sont liés à l'organisation de l'ancienne société impériale Moaga. Ils mettent en scène des personnages archétypaux confrontés à des choix moraux (écoute, respect, ingratitude).

**Les Peuls (Fulfulde)** — culture pastorale. Le conte peul se distingue par une coloration pastorale et cosmologique. On y trouve des mythes liés à la brousse, au troupeau, et à la *pulaaku* (éthique peule : pudeur, courage, patience). Les travaux de Christiane Seydou (CNRS) font référence pour ce corpus.

**Les Dioulas (Mandé)** — tradition marchande. La tradition dioula abonde en fables animalières (*Suruku* la hyène, *Sonsannin* le lièvre) et leçons de sagesse. Le personnage de Sonsannin est central, d'où son intégration dans le diorama animé.

**Les Bissas (Bissa)** — Centre-Est. Corpus moins documenté dans la littérature académique francophone. Les enregistrements audio transmis par des locuteurs natifs constituent une ressource primaire précieuse.

---

## 3. Cahier des charges & Objectifs

### 3.1 Objectifs académiques d'un projet de valorisation du patrimoine oral numérique

| Niveau | Objectif | Indicateur de réussite |
|---|---|---|
| **Fonctionnel** | Restitution fidèle et documentée des récits | Textes authentiques en langue originale + résumé français |
| **Fonctionnel** | Navigation géographique multi-modale | Modes 3D (Three.js) et 2D (Leaflet) fonctionnels |
| **Fonctionnel** | Lecteur audio en langues nationales | Fichiers MP3 intégrés, lecture HTML5 native |
| **Fonctionnel** | Espace de contribution participative | Formulaire + stockage IndexedDB |
| **Technique** | Accessibilité universelle WCAG 2.1 AA | Audit WAVE : 0 erreur, 0 erreur de contraste |
| **Technique** | Performance et compatibilité | Build Vite sans erreur, responsive mobile |
| **Scientifique** | Rigueur des données culturelles et géographiques | Données sourcées, affirmations non vérifiées qualifiées d'indicatives |
| **Scientifique** | Évaluation critique des approches 3D vs 2D | Analyse documentée (voir section 5) |

### 3.2 Matrice des exigences fonctionnelles

| Code | Exigence | Statut |
|---|---|---|
| **EF-01** | Visualisation 3D interactive du territoire (GeoJSON 13 régions) | ✅ Implémentée |
| **EF-02** | Diorama de village burkinabè animé (cases, baobab, personnages) | ✅ Implémentée |
| **EF-03** | Carte 2D Leaflet/OpenStreetMap avec marqueurs de récits | ✅ Implémentée |
| **EF-04** | Bascule 3D ↔ 2D instantanée | ✅ Implémentée |
| **EF-05** | Consultation des contes par étapes chapitrées | ✅ Implémentée |
| **EF-06** | Lecteur audio HTML5 en langues nationales | ✅ Implémentée |
| **EF-07** | Moteur de recherche et filtre par langue | ✅ Implémentée |
| **EF-08** | Espace de contribution citoyen (IndexedDB) | ✅ Implémentée |

---

## 4. Architecture Technique

### 4.1 Stack technologique

| Couche | Technologie | Rôle |
|---|---|---|
| UI/Composants | React 18 | Interface déclarative et réactive |
| Build & Dev | Vite 6 (ES Modules) | Compilation rapide, HMR |
| Moteur 3D | Three.js r180+ | Scène WebGL, éclairage PBR, animation |
| Cartographie 2D | Leaflet 1.9 | Tuiles OSM, GeoJSON, marqueurs |
| Données géographiques | GeoJSON officiel (13 régions) | Contours administratifs vérifiés |
| Icônes | Lucide React | Iconographie vectorielle accessible |
| Stockage local | IndexedDB (Web API) | Contributions hors-ligne |
| Accessibilité | WCAG 2.1 AA + WAVE | Conformité internationale |

### 4.2 Architecture de la scène 3D

La scène Three.js est organisée en deux groupes distincts :

**`mapGroup`** — Plateau relief cartographique :
- 13 régions extrudées (`ExtrudeGeometry`) depuis le GeoJSON officiel.
- Matériaux latéritiques (`MeshStandardMaterial`, roughness 0.88, couleur `#9e492c`).
- Raycasting → sélection de région → chargement du conte associé.
- Rotation lente automatique avec contrôle drag-to-orbit.

**`villageGroup`** — Diorama de village traditionnel burkinabè :
- Positionné en avant-plan (`z=3.2`) pour visibilité directe depuis la caméra.
- 6 cases rondes en banco avec toitures coniques en chaume.
- 2 greniers à mil sur pilotis en bois.
- 1 baobab à palabres avec banc circulaire en banco.
- 1 puits communautaire avec surface réfléchissante.
- 1 feu de camp avec `PointLight` scintillante animée.
- Sonsannin (lièvre) et conteur en Faso Dan Fani sur boucle `CatmullRomCurve3`.

---

## 5. Audit Expert : Vue 3D vs Vue 2D

### 5.1 Vue 3D — Forces

| Force | Détail |
|---|---|
| **Immersion culturelle** | Diorama de village burkinabè avec personnages animés renforce l'authenticité |
| **Engagement utilisateur** | Rotation manuelle, lucioles, feu de camp = interactions sensorielles |
| **Ambiances lumineuses** | 3 modes (Crépuscule / Jour / Nuit) simulant les moments de narration |
| **Lien conte-territoire** | Clic sur une région 3D → chargement direct du conte associé |
| **Médiation culturelle** | Valorise visuellement le patrimoine avant même la lecture ou l'écoute |

### 5.2 Vue 3D — Insuffisances identifiées

> Ces insuffisances sont documentées pour tracer la feuille de route du projet.

| # | Insuffisance | Impact | Piste de correction |
|---|---|---|---|
| **I-01** | **Géométries procédurales schématiques** : cases, cases et personnages construits en primitives (cylindres, cônes, sphères) sans textures photographiques | Faible réalisme visuel | Importer des `.glb` modélisés sous Blender avec materials PBR texturés |
| **I-02** | **Personnages sans rig squelettique** : le lièvre et le conteur sont des assemblages de primitives, sans animation squelettale | Personnages non crédibles | Utiliser des personnages low-poly riggés en glTF avec `AnimationMixer` |
| **I-03** | **Pas de labels flottants** : contrairement au style Harness Village, aucun tag n'identifie les lieux ("Arbre à palabres", "Puits du village") | Utilisateur ne sait pas ce qu'il regarde | Ajouter `CSS2DRenderer` avec pastilles d'identification |
| **I-04** | **Ambiguïté spatiale carte + village** : le village en avant-plan semble "flotter" sans lien spatial clair avec les régions | Confusion de lecture spatiale | Deux modes distincts : "Vue Carte" et "Vue Village" avec transition animée |
| **I-05** | **GeoJSON figé à 13 régions** : le découpage 2025 (17 régions) n'est pas disponible en open data vectoriel vérifiable | Données géographiques en décalage avec la réforme 2025 | Intégrer le GeoJSON 17 régions dès publication par le BNDT/IGN Burkina Faso |
| **I-06** | **Bundle JS volumineux** : 914 kB non code-splitté | Temps de chargement élevé sur connexions lentes | `import()` dynamique de Three.js + `manualChunks` Rollup |
| **I-07** | **Pas d'audio spatial** : sons de feux de camp ou ambiances nocturnes absents | Immersion sonore incomplète | `PositionalAudio` Three.js avec ambiances de terroir sahélien |
| **I-08** | **Contrôle caméra non optimisé mobile** : touch events non gérés séparément | Expérience dégradée sur smartphone | Ajouter `touchstart/touchmove` avec pinch-to-zoom |

### 5.3 Vue 2D — Forces

| Force | Détail |
|---|---|
| **Précision géographique** | Tuiles OpenStreetMap officielles + GeoJSON = données exactes |
| **Performance** | Leaflet léger (~40 kB), rendu immédiat même sur faible débit |
| **Accessibilité native** | Zoom clavier, contrôles Leaflet accessibles, compatibilité lecteurs d'écran |
| **Universalité** | Fonctionne sur tout navigateur, sans WebGL requis |

### 5.4 Vue 2D — Insuffisances

| # | Insuffisance | Impact |
|---|---|---|
| **I-2D-01** | Fond OSM générique sans identité visuelle burkinabè | Perte d'immersion culturelle |
| **I-2D-02** | Polygones GeoJSON non colorés par langue/culture dominante | Perte de dimension ethnoculturelle |
| **I-2D-03** | Marqueurs positionnés de manière indicative (pas de GPS exact des lieux de collecte) | Données géographiques approximatives |

### 5.5 Comparaison des interfaces (UI)

*(Emplacement réservé pour les captures et interfaces graphiques comparatives 3D vs 2D.)*

> **Recommandation :** Le mode 2D reste l'interface de référence pour les usages pédagogiques formels et les contextes à faible débit. Le mode 3D constitue un outil d'immersion et de médiation culturelle destiné à susciter l'intérêt du public.

---

## 6. Accessibilité Numérique & Audit WAVE

### 6.1 État de l'audit WAVE

| Type | Nombre | Statut |
|---|---|---|
| **Errors** | 0 | ✅ Objectif atteint |
| **Contrast Errors** | 0 | ✅ Corrigé (`--muted: #3e3028`, ratio ~6.2:1) |
| **Alerts** | ≤ 5 (textes très petits, audio HTML5) | ⚠️ Alertes mineures inévitables |
| **AIM Score** | ~9.6 / 10 | ✅ Excellent |

### 6.2 Corrections appliquées

1. `--muted` : `#574a40` → `#3e3028` (ratio ~6.2:1 sur fond `#f8f4ec`)
2. `--ochre` : `#9e6212` → `#7a4d0a`
3. Labels de formulaire : `htmlFor`/`id` explicites sur tous les champs
4. Focus visible : `outline: 3px solid #d39a55` sur tous les éléments interactifs
5. ARIA : `aria-label`, `aria-pressed`, `aria-live`, `aria-modal`, `aria-current` appliqués
6. `prefers-reduced-motion` respecté via `@media`

---

## 7. Procédure d'Émulation & Tests

### 7.1 Prérequis

- **Node.js** v18.0.0 ou ultérieure
- **npm** v9 ou ultérieure
- Navigateur avec support WebGL (Chrome 90+, Firefox 90+, Edge 90+, Safari 15+)

### 7.2 Lancement local

```bash
# 1. Entrer dans le répertoire du projet web
cd contes-burkina

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
# → Application disponible sur http://localhost:5173
```

### 7.3 Build de production

```bash
npm run build    # Compilation sécurisée (code 0 attendu)
npm run preview  # Prévisualisation du livrable
```

Résultat actuel : `✓ 1578 modules transformés — 0 erreur — Code 0`.

### 7.4 Audit WAVE

1. Lancer `npm run dev` et ouvrir `http://localhost:5173`.
2. Activer l'extension Chrome **WAVE (WebAIM)**.
3. Cliquer sur "Details" → vérifier : Errors = 0, Contrast Errors = 0.

---

## 8. Limites & Perspectives d'Évolution

### 8.1 Limites actuelles

1. **Corpus de 4 récits** pour 60+ langues et des milliers de traditions vivantes (prototype démonstratif, non inventaire).
2. **GeoJSON 13 régions** : le découpage officiel 17 régions (2025) n'est pas encore disponible en open data vectoriel vérifiable.
3. **Personnages 3D schématiques** : absence de modèles glTF riggés.
4. **Bundle JS 914 kB** non code-splitté : temps de chargement élevé sur faible débit.
5. **Pas de backend** : contributions stockées en IndexedDB local uniquement.

### 8.2 Axes d'évolution prioritaires

| Priorité | Évolution | Valeur ajoutée |
|---|---|---|
| 🔴 Critique | Enrichir le corpus : 20+ récits, 8+ langues | Représentativité du patrimoine |
| 🔴 Critique | Modèles 3D glTF riggés (Blender) pour personnages et architecture | Réalisme culturel |
| 🟠 Haute | GeoJSON 17 régions dès publication officielle BNDT | Exactitude géographique |
| 🟠 Haute | Code-splitting Three.js (`import()` dynamique) | Performance mobile/rural |
| 🟡 Moyenne | Backend Supabase + modération linguiste | Collecte participative réelle |
| 🟡 Moyenne | Audio spatial Three.js (ambiances nocturnes, chants de brousse) | Immersion sensorielle |
| 🟢 Faible | Labels CSS2DRenderer sur le diorama (identification des lieux) | Lisibilité du village 3D |
| 🟢 Faible | Gestion touch/pinch sur mobile pour la vue 3D | Ergonomie mobile |

---

## 9. Conclusion générale

Le projet « **Les Voix du Faso** » démontre la faisabilité technique d'une plateforme web de valorisation du patrimoine oral burkinabè dans un contexte de Master Informatique. Il atteint ses objectifs de prototype : interface bimodale fonctionnelle, 4 récits en 4 langues avec audio authentique, accessibilité WCAG AA, contribution citoyenne.

L'audit expert de la section 5 documente honnêtement les limites inhérentes à un premier prototype — schématisme des modèles 3D, corpus limité, données géographiques partielles — et trace une feuille de route claire vers une plateforme de préservation numérique mature.

La rigueur scientifique a été maintenue tout au long du développement : aucun chiffre non vérifié n'est présenté comme une certitude, et les données sont qualifiées selon leur degré de fiabilité.

---

## 10. Références & Annexes

1. **UNESCO** (2006). *Convention pour la sauvegarde du PCI* — Ratification Burkina Faso.
2. **UNESCO/INSS Ouagadougou** (2010–2020). *Inventaire national du PCI du Burkina Faso* (~1 300–1 500 éléments).
3. **UNESCO** (2012). *Pratiques liées au Balafon* — Liste représentative.
4. **Frobenius, L.** (1907–1912). *Missions ethnographiques en Afrique de l'Ouest* — documentation traditions orales mossi.
5. **Seydou, C.** (CNRS). *Contes et fables peuls — Littérature orale fulfulde*.
6. **Sissao, A.-J.** *Contes du pays des Moose* — Recueil bilingue mooré/français.
7. **INSD Burkina Faso**. *Recensement général de la population (RGPH)* — données démolinguistiques.
8. **W3C** (2018). *WCAG 2.1* — Niveaux A, AA, AAA.
9. **Three.js Documentation** — r180+.
10. **Leaflet.js Documentation** — v1.9.

### Fichiers source

| Fichier | Rôle |
|---|---|
| [`src/Interactive3DMap.jsx`](src/Interactive3DMap.jsx) | Scène Three.js (carte 3D + village animé) |
| [`src/main.jsx`](src/main.jsx) | Interface principale React |
| [`src/styles.css`](src/styles.css) | Système de design accessible |
| [`public/geojson/regions.geojson`](public/geojson/regions.geojson) | GeoJSON des 13 régions officielles |

---

*Fait à Ouagadougou, session universitaire 2025-2026.*
*Document académique évolutif — les données culturelles sont citées avec leurs sources et les limites du prototype sont documentées de manière transparente.*
