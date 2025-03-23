# CVATS - Générateur de CV optimisé pour ATS

Une application web moderne permettant de créer des CV optimisés pour les systèmes ATS (Applicant Tracking Systems).

## Fonctionnalités

- 🔐 Authentification via Firebase (Google, Email/Password)
- 📝 Formulaire interactif pour la saisie des informations
- 💾 Sauvegarde automatique dans Firebase Firestore
- 🎯 Génération de CV optimisé pour les ATS
- 📄 Export en PDF
- 📊 Dashboard utilisateur pour gérer plusieurs CV

## Technologies utilisées

- Frontend : React.js, Tailwind CSS
- Backend : Node.js, Express
- Base de données : Firebase Firestore
- Authentification : Firebase Auth
- PDF Generation : react-pdf

## Prérequis

- Node.js (v18 ou supérieur)
- npm ou yarn
- Compte Firebase

## Installation

1. Cloner le repository
```bash
git clone https://github.com/votre-username/cvats.git
cd cvats
```

2. Installer les dépendances
```bash
# Installation des dépendances du frontend
cd client
npm install

# Installation des dépendances du backend
cd ../server
npm install
```

3. Configurer les variables d'environnement
```bash
# Dans le dossier client
cp .env.example .env.local
# Dans le dossier server
cp .env.example .env
```

4. Démarrer l'application
```bash
# Démarrer le backend
cd server
npm run dev

# Démarrer le frontend (dans un nouveau terminal)
cd client
npm run dev
```

## Structure du projet

```
cvats/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── pages/        # Pages de l'application
│   │   ├── services/     # Services (Firebase, API)
│   │   └── styles/       # Styles Tailwind
│   └── public/           # Assets statiques
└── server/               # Backend Express
    ├── src/
    │   ├── controllers/  # Contrôleurs
    │   ├── routes/       # Routes API
    │   └── middleware/   # Middleware
    └── config/          # Configuration
```
