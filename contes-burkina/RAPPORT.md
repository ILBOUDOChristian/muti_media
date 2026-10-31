<div align="center">

# UNIVERSITÉ JOSEPH KI-ZERBO

### INSTITUT BURKINABÈ DES ARTS ET MÉTIERS (IBAM)

#### Master 1 Informatique

<br />

## RAPPORT DE PROJET

### Les Voix du Faso

**Plateforme immersive de préservation et de transmission du patrimoine oral burkinabè**

<br />

**Présenté par : Groupe n° 15**  
ILBOUDO Songr La Panga Christian  
NIKIEMA Palingwendé Aude Stanislas  
NEYA Yesso Yasmina  
KABORE Julius Wendkuuni  
**Encadrant : Simpore Odilon**  
**Année universitaire : 2026**

<br />

**Ouagadougou, Burkina Faso**

</div>

---

## Résumé

Ce rapport présente le prototype web « Les Voix du Faso », conçu pour mettre en valeur les contes et récits oraux burkinabè. L’application propose une carte interactive 2D des régions, une collection de récits consultables par langue, une lecture par étapes et des lecteurs audio pour des contenus en Mooré, Fulfulde, Dioula et Bissa. Une scène animée en relief CSS enrichit la page d’accueil.

Le prototype est réalisé avec React, Vite, Leaflet et des données géographiques au format GeoJSON. La compilation de production réussit. Le projet démontre les principaux parcours de l’expérience, mais plusieurs travaux restent nécessaires avant une mise en service patrimoniale : validation des sources et des droits, localisation confirmée des récits, stockage serveur et captures d’écran réelles du fonctionnement.

**Mots-clés :** patrimoine oral, Burkina Faso, conte, Mooré, Fulfulde, Dioula, carte interactive, transmission numérique.

---

## Table des matières

1. [Introduction générale](#1-introduction-générale)
2. [Contexte et cahier des charges](#2-contexte-et-cahier-des-charges)
3. [Analyse et conception](#3-analyse-et-conception)
4. [Réalisation de l’application](#4-réalisation-de-lapplication)
5. [Tests et résultats](#5-tests-et-résultats)
6. [Limites et perspectives](#6-limites-et-perspectives)
7. [Conclusion générale](#7-conclusion-générale)
8. [Références et annexes](#8-références-et-annexes)

---

## 1. Introduction générale

### 1.1 Contexte

Les contes, légendes et récits transmis oralement portent des langues, des mémoires locales et des savoirs. Leur conservation dépend notamment de la possibilité de documenter les textes et les enregistrements, leur provenance, les personnes qui les transmettent et les conditions de diffusion.

Le projet « Les Voix du Faso » propose une interface numérique où les récits peuvent être découverts par territoire et écoutés dans leur langue. Il s’inscrit dans une démarche de valorisation du patrimoine oral burkinabè.

### 1.2 Problématique

Comment concevoir une application web qui rende des récits oraux burkinabè faciles à découvrir et à écouter, tout en reliant leur contenu à leur langue, à leur provenance et à leur territoire ?

### 1.3 Objectif général

Développer un prototype web immersif permettant de parcourir le Burkina Faso et de découvrir des contes et récits enrichis de texte, de supports audio et d’une expérience de lecture interactive.

### 1.4 Objectifs spécifiques

- représenter les régions du Burkina Faso sur une carte interactive ;
- organiser les récits et permettre une recherche par titre et par langue ;
- présenter le récit sous forme de courtes étapes ;
- intégrer les fichiers audio fournis pour les récits concernés ;
- proposer une identité visuelle évoquant la transmission orale ;
- préparer un parcours de contribution de nouveaux récits.

### 1.5 Organisation du rapport

Le rapport décrit le cahier des charges, la conception de l’expérience, les choix techniques, la réalisation du prototype, les vérifications effectuées et les travaux restant à accomplir.

## 2. Contexte et cahier des charges

### 2.1 Public visé

La plateforme s’adresse aux personnes qui souhaitent écouter et lire des récits du Burkina Faso : public scolaire, familles, médiateurs culturels, chercheurs et membres des communautés détentrices des traditions.

### 2.2 Besoins fonctionnels

| Référence | Besoin | État dans le prototype |
|---|---|---|
| BF-01 | Parcourir une carte des régions du Burkina Faso | Carte 2D Leaflet/GeoJSON avec zoom sur la région du récit et repère animé à effet de profondeur |
| BF-02 | Découvrir une fiche de récit | Réalisé dans la collection et le panneau de récit |
| BF-03 | Filtrer la collection par langue et rechercher un récit | Réalisé côté interface |
| BF-04 | Lire un récit en plusieurs étapes | Réalisé avec navigation par boutons |
| BF-05 | Écouter les fichiers audio disponibles | Réalisé pour les quatre enregistrements disponibles |
| BF-06 | Partager un nouveau récit | Formulaire réalisé; enregistrement local au navigateur seulement |
| BF-07 | Enrichir les récits avec des illustrations animées | Scène d’accueil animée et quatre images associées aux récits; les images des fiches ne sont pas animées |

### 2.3 Besoins non fonctionnels

- Interface responsive pour écran de bureau et téléphone.
- Navigation et libellés compréhensibles en français.
- Réduction des animations lorsque le système le demande.
- Contenus consultables sans prétendre à une provenance non documentée.
- Lecteur audio natif du navigateur pour les fichiers MP3 fournis.

### 2.4 Périmètre

La version actuelle est un prototype front-end. Elle ne comprend pas de serveur, de compte utilisateur, de base de données distante, de processus de modération ni de système de publication des contributions.

## 3. Analyse et conception

### 3.1 Parcours utilisateur

1. La personne arrive sur la page d’accueil et comprend la vocation du projet.
2. Elle accède à l’exploration territoriale et choisit une région ou un marqueur existant.
3. Elle lit un récit par étapes et lance l’enregistrement audio lorsqu’il est disponible.
4. Elle parcourt la collection, recherche un récit ou filtre les contenus par langue.
5. Elle peut proposer un récit via le formulaire de contribution.

### 3.2 Organisation des contenus

Chaque récit est défini dans le code avec un titre, une langue, un genre, un texte découpé en étapes et, lorsqu’un fichier est disponible, une adresse audio. Certaines localisations d’origine et certains crédits restent à documenter.

### 3.3 Direction visuelle

L’interface emploie une palette chaude, des typographies éditoriales et des motifs inspirés du paysage. La scène du baobab est construite en CSS avec plusieurs plans et des mouvements doux. Elle illustre l’ambiance du projet; elle ne constitue pas une animation documentaire associée à un récit précis.

### 3.4 Architecture générale

```text
React (interface et état de l’application)
├── Collection de récits définie dans src/main.jsx
├── Lecteurs audio HTML pour les MP3 de public/
├── Leaflet + tuiles OpenStreetMap
└── GeoJSON des régions dans public/geojson/regions.geojson
```

## 4. Réalisation de l’application

### 4.1 Page d’accueil

La page présente le projet, son intention et un accès direct à la carte. Le panneau d’exploration met le conte Mooré « Nin-kẽem a yembr kibare » en avant à l’ouverture.

**Figure 1 — Page d’accueil et identité visuelle**  
*[Capture d’écran réelle à insérer : écran d’accueil complet, titre, illustration du baobab et boutons d’accès.]*

### 4.2 Carte interactive

La carte utilise Leaflet, les tuiles OpenStreetMap et un fichier GeoJSON comprenant 13 régions. Le visiteur peut zoomer, survoler les régions et cliquer sur les marqueurs définis. Les nouveaux récits transmis n’ont pas tous de région d’origine confirmée et ne sont donc pas positionnés arbitrairement.

**Figure 2 — Exploration géographique du Burkina Faso**  
*[Capture d’écran réelle à insérer : carte cadrée sur le Burkina Faso, régions visibles, marqueur sélectionné et fiche de récit.]*

### 4.3 Collection et recherche

La collection permet de rechercher un titre ou un lieu mentionné dans la fiche et de filtrer les contenus par langue. La sélection d’une carte de récit ouvre son panneau de lecture.

**Figure 3 — Collection, recherche et filtre linguistique**  
*[Capture d’écran réelle à insérer : cartes de récits et filtre Dioula, Mooré ou Fulfulde.]*

### 4.4 Récits et supports audio

| Récit | Langue | Support audio associé | Crédit documenté |
|---|---|---|---|
| Nin-kẽem a yembr kibare | Mooré | `public/Conte_01_Nikeema.mp3` | Non indiqué dans les éléments transmis |
| Soni so Alla waray, kaananke warataa! | Fulfulde | `public/03_Soni_Alla_waraay.mp3` | Tijjaani Ba |
| Suruku ni sonsannin | Dioula | `public/15 cont dioull vol2.mp3` | Texte : Alou Keïta; audio : Afsatou Bokoum |
| Conte en Bissa | Bissa | `public/Bissa.mp3` | Non indiqué dans les éléments transmis; transcription à recueillir |

Les textes sont présentés en étapes afin de faciliter la lecture. Les commandes audio utilisent le lecteur HTML natif. La correspondance entre chaque texte et son enregistrement, les droits de diffusion et le consentement des personnes concernées doivent être confirmés avant publication.

**Figure 4 — Récit Mooré avec texte et lecteur audio**  
*[Capture d’écran réelle à insérer : titre, étape du récit, attribution et lecteur MP3 en état prêt à lire.]*

**Figure 5 — Récit Fulfulde avec texte et lecteur audio**  
*[Capture d’écran réelle à insérer : récit « Soni so Alla waray, kaananke warataa! », crédit et lecteur MP3.]*

**Figure 6 — Récit Dioula et crédits**  
*[Capture d’écran réelle à insérer : récit « Suruku ni sonsannin », lecteur audio et crédits du texte et de l’enregistrement.]*

### 4.5 Expérience narrative

Les chapitres disposent de commandes précédent/suivant et de repères de progression. Une scène d’accueil en relief CSS complète l’expérience visuelle. La préférence système de réduction des animations est prise en compte.

**Figure 7 — Progression dans les étapes d’un récit**  
*[Capture d’écran réelle à insérer : lecteur affichant une étape intermédiaire et les commandes de navigation.]*

### 4.6 Contribution

Le formulaire collecte le nom du transmetteur, le texte proposé, la région et la langue. Pour l’instant, la soumission est conservée dans le stockage local du navigateur; elle n’est pas envoyée à l’équipe du projet.

**Figure 8 — Formulaire de proposition d’un récit**  
*[Capture d’écran réelle à insérer : formulaire rempli avec données fictives, puis écran de confirmation locale.]*

## 5. Tests et résultats

### 5.1 Vérification technique

La commande suivante a été exécutée :

```text
npm.cmd run build
```

Résultat : la compilation Vite termine avec succès et produit les fichiers de production dans `dist/`.

### 5.2 Résultats observés dans le code

- Carte régionale 2D configurée avec Leaflet.
- Collection avec recherche et filtre linguistique.
- Textes Mooré, Fulfulde et Dioula fournis dans le projet, et un enregistrement supplémentaire en Bissa.
- Quatre fichiers audio associés aux récits.
- Formulaire de contribution local.
- Scène décorative animée sur la page d’accueil.

### 5.3 Vérifications encore nécessaires

- Parcours complet dans un navigateur de bureau et sur téléphone.
- Vérification auditive de chaque MP3 et de sa correspondance avec le texte.
- Validation des textes, traductions, crédits et consentements avec les communautés concernées.
- Contrôle des captures d’écran et des dimensions responsive.
- Tests du formulaire, notamment sa persistance et ses cas d’erreur.

## 6. Limites et perspectives

### 6.1 Limites

- La carte reste en 2D; le repère utilise une animation CSS avec effet de profondeur, sans terrain 3D réel.
- Le repère cartographique anime une aire linguistique ou un lieu de lecture documenté; il ne prétend pas indiquer l’origine exacte du conte lorsqu’elle n’est pas fournie.
- Les récits réels n’ont pas encore de localisation géographique confirmée. Les marqueurs actuellement en place sont liés à des récits de démonstration.
- Trois contenus de démonstration plus anciens restent dans la collection et doivent être remplacés ou explicitement identifiés comme exemples.
- Les quatre images transmises sont intégrées dans `public/images/` et associées aux récits Bissa, Mooré, Dioula et Fulfulde. Les visuels génériques ont été retirés; les quatre fichiers audio sont conservés.
- Les propositions, transcriptions et fichiers audio joints sont stockés uniquement dans IndexedDB du navigateur; ils ne sont ni envoyés à un serveur ni modérés.
- Les droits, consentements, sources et métadonnées des enregistrements doivent être documentés.
- Les captures d’écran réelles ne sont pas encore insérées dans cette version du rapport.

### 6.2 Perspectives d’évolution

1. Remplacer les contenus de démonstration par des récits documentés.
2. Confirmer et enregistrer la région, le lieu de collecte, les personnes détentrices et les conditions de diffusion de chaque récit.
3. Ajouter les crédits et obtenir les autorisations de diffusion des quatre images et des enregistrements.
4. Connecter le formulaire à une API et à une base de données avec modération.
5. Ajouter une véritable vue 3D de la carte si elle apporte un bénéfice d’exploration mesurable.
6. Réaliser les captures d’écran demandées et les insérer aux figures 1 à 8.

## 7. Conclusion générale

Le prototype « Les Voix du Faso » met en place une première expérience de découverte du patrimoine oral : carte régionale interactive, collection filtrable, textes narratifs et fichiers audio en langues nationales. La compilation de production est opérationnelle et quatre enregistrements transmis par le commanditaire sont associés à leurs récits.

Le projet répond ainsi à plusieurs objectifs du cahier des charges, mais sa publication patrimoniale demande encore un travail de validation et de documentation. Les priorités sont de confirmer les localisations et les droits, puis de mettre en place un stockage serveur pour les contributions.

## 8. Références et annexes

### 8.1 Ressources du projet

- Source de l’interface : `src/main.jsx`.
- Feuille de styles : `src/styles.css`.
- Carte régionale : `public/geojson/regions.geojson`.
- Enregistrements : dossier `public/`.
- Dépendances et commandes : `package.json`.

### 8.2 Captures d’écran à joindre

Les figures 1 à 8 de la section 4 sont les emplacements prévus pour les captures réelles de l’application. Elles doivent être prises dans le navigateur, numérotées, recadrées sans masquer les contrôles et accompagnées de leur légende. Aucune capture fictive n’est utilisée dans ce rapport.

### 8.3 Identité académique

- Établissement : Université Joseph Ki-Zerbo.
- Institut : Institut Burkinabè des Arts et Métiers (IBAM).
- Formation : Master 1 Informatique.
- Groupe 15 : ILBOUDO Songr La Panga Christian; NIKIEMA Palingwendé Aude Stanislas; NEYA Yesso Yasmina; KABORE Julius Wendkuuni.
- Encadrant : Simpore Odilon (nom actualisé pour ce projet).
- Année universitaire : 2026, conformément au rapport de référence.
