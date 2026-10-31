# Les Voix du Faso — Plateforme Multimédia & Carte Interactive des Contes et Légendes du Burkina Faso

Projet développé dans le cadre du **Master 1 Informatique (IBAM / Université Joseph Ki-Zerbo)**.  
Plateforme web immersive visant à préserver, numériser et transmettre le patrimoine oral burkinabè à travers une carte interactive 3D/2D, des contes sonores en langues nationales (Mooré, Dioula, Fulfulde, Bissa) et une expérience narrative par étapes.

---

## Sommaire

1. [Fonctionnalités Clés](#-fonctionnalités-clés)
2. [Découpage Administratif du Burkina Faso (2025)](#-découpage-administratif-du-burkina-faso-2025)
3. [Architecture Technique](#-architecture-technique)
4. [Installation & Émulation Locale](#-installation--émulation-locale)
5. [Scripts Utiles](#-scripts-utiles)
6. [Accessibilité (WAVE & WCAG AA)](#-accessibilité-wave--wcag-aa)
---

## 🌟 Fonctionnalités Clés

- **Carte Interactive Bimodale (3D / 2D) :**
  - **Vue 3D Immersive (Three.js & rig 3dviz-pro-max) :** relief latéritique burkinabè, atmosphère dorée au crépuscule (*Dusk Golden Hour*), baobab totémique et falaises de Sindou, totems interactifs des 17 régions avec informations culturelles et orbitales.
  - **Atlas 2D (Leaflet & OpenStreetMap) :** polygones GeoJSON des régions, repère animé et centrage dynamique.
- **Récits et Patrimoine Oral en Langues Nationales :**
  - Mooré : *Nin-kẽem a yembr kibare* (audio transmis).
  - Dioula : *Suruku ni sonsannin* (lu par Afsatou Bokoum, texte d'Alou Keïta).
  - Fulfulde : *Soni so Alla waray, kaananke warataa!* (transmis par Tijjaani Ba).
  - Bissa : *Conte en Bissa* (enregistrement audio).
- **Lecteur Narratif par Étapes :** découpage chronologique, navigation pas-à-pas, synthèse vocale française de secours si audio absent.
- **Moteur de Recherche & Filtrage Linguistique :** recherche instantanée par titre ou territoire et filtre par langue.
- **Espace de Transmission & Contribution :** formulaire permettant de proposer un conte avec transcription texte et fichier audio (persistance locale dans IndexedDB).

---

## 🗺️ Découpage Administratif du Burkina Faso (2025)

Conformément à la réforme administrative officielle adoptée en 2025, l'application intègre :
- **17 Régions administratives** (toponymes endogènes & chefs-lieux) :
  1. **Bankui** (Dédougou)
  2. **Sourou** *(Nouvelle région)* (Tougan)
  3. **Guiriko** (Bobo-Dioulasso)
  4. **Tannounyan** (Banfora)
  5. **Djôrô** (Gaoua)
  6. **Yaagda** (Ouahigouya)
  7. **Nando** (Koudougou)
  8. **Sahel** (Dori)
  9. **Soum** *(Nouvelle région)* (Djibo)
  10. **Kuilsé** (Kaya)
  11. **Oubri** (Ziniaré)
  12. **Kadiogo** (Ouagadougou)
  13. **Nazinon** (Manga)
  14. **Nakambé** (Tenkodogo)
  15. **Goulmou** (Fada N'Gourma)
  16. **Tapoa** *(Nouvelle région)* (Diapaga)
  17. **Sirba** *(Nouvelle région)* (Bogandé)
- **47 Provinces** (avec l'intégration du *Dyamongou* et du *Karo-Peli*).

---

## 🏗️ Architecture Technique

```text
multi/
├── .agents/skills/3dviz-pro-max/  # Compétence de modélisation 3D (recettes, fiches, rigs)
├── .gitignore                    # Exclusions git (fichiers 3D lourds .glb/.blend, .agents/)
└── contes-burkina/               # Application Web React
    ├── public/
    │   ├── geojson/regions.geojson # Données géographiques
    │   ├── images/                 # Visuels des contes
    │   └── *.mp3                   # Fichiers audio des contes
    ├── src/
    │   ├── main.jsx                # Point d'entrée et logique principale
    │   ├── Interactive3DMap.jsx    # Composant Three.js 3D (17 régions, éclairage crépusculaire)
    │   └── styles.css              # Design système & charte accessible
    ├── index.html
    ├── package.json
    └── vercel.json                 # Déploiement en production
```

---

## 🚀 Installation & Émulation Locale

### Prérequis
- **Node.js** (version 18 ou supérieure recommandée) : vérifiez avec `node -v`
- **npm** (inclus avec Node.js)

### Étapes pas-à-pas pour lancer le projet

1. **Ouvrir un terminal** dans la racine du projet (`multi`).

2. **Accéder au répertoire applicatif :**
   ```bash
   cd contes-burkina
   ```

3. **Installer les dépendances :**
   ```bash
   npm install
   ```

4. **Lancer le serveur de développement local (émulation) :**
   ```bash
   npm run dev
   ```

5. **Visualiser l'application :**
   Ouvrez votre navigateur web à l'adresse indiquée (généralement `http://localhost:5173`).

---

## 🛠️ Scripts Utiles

Tous les scripts s'exécutent depuis le dossier `contes-burkina` :

| Commande | Action |
|---|---|
| `npm run dev` | Démarre le serveur local de test (Vite) avec rechargement à chaud |
| `npm run build` | Compile et optimise l'application pour la production (`dist/`) |
| `npm run preview` | Prévisualise localement le livrable compilé de production |

---

## ♿ Accessibilité (WAVE & WCAG AA)

L'application a été auditée et optimisée selon les normes **WCAG 2.1 AA** et les critères du validateur **WAVE (WebAIM)** :
- **0 erreur de contraste :** contrastes de texte supérieurs à 4.8:1 sur fond clair et 8:1 sur fond sombre.
- **Formulaires accessibles :** association stricte des libellés et des champs de saisie (`htmlFor` et `id`).
- **Typographie lisible :** tailles de police réhaussées (≥ 12px) et support natif de `prefers-reduced-motion`.
