# muti_media

Application web React présentant des contes et informations culturelles du Burkina Faso. Le code applicatif principal se trouve dans le dossier `contes-burkina`.

## Architecture

```text
multi/
├── .gitignore                 # Exclusions communes du dépôt
└── contes-burkina/
    ├── .github/
    │   └── workflows/
    │       └── ci.yml         # Installation et build sur GitHub Actions
    ├── public/
    │   ├── geojson/
    │   ├── images/
    │   └── *.mp3              # Fichiers audio publics
    ├── scripts/
    │   └── build-secure.mjs   # Build de production sécurisé
    ├── src/
    │   ├── main.jsx           # Point d'entrée React
    │   └── styles.css         # Styles de l'application
    ├── .gitignore             # Exclusions propres à l'application
    ├── index.html
    ├── package.json
    ├── package-lock.json
    └── vercel.json            # Configuration de déploiement Vercel
```

## Technologies

- React 18
- Vite 6
- Leaflet
- GitHub Actions
- Vercel

## Installation locale

```powershell
cd contes-burkina
npm ci
cp .env.production .env.local
npm run dev
```

Sur Windows PowerShell, créer ou modifier `.env.local` avec :



Les fichiers commençant par `.env` sont ignorés par Git. Les variables préfixées `VITE_` sont visibles dans le navigateur et ne doivent contenir aucun secret.

```





