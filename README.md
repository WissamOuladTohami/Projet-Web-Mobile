# 🚚 Fleet Manager — Projet Web & Mobile

Application de **gestion de flotte** (véhicules + chauffeurs) avec **suivi GPS** en temps réel.

## ✨ Fonctionnalités

- 📊 **Dashboard** : indicateurs + graphiques
- 🚗 **Véhicules** : CRUD + statut (active/offline)
- 👤 **Chauffeurs** : CRUD + affectation
- 🗺️ **Carte GPS** : dernière position de chaque véhicule + rafraîchissement auto
- 🧾 **Carburant** : logs de consommation
- 🕒 **Historique** : trajectoire d’un véhicule

## 🧱 Architecture du repo

```
Projet_Web_Mobile/
├─ fleet-api/        # API Node.js (Express) + MySQL + Socket.IO
├─ fleet-web/        # Front React (Vite) + Leaflet
└─ fleet-android/    # App Android (driver) : envoi des positions GPS
```

## 🛠️ Stack technique

- **Backend** : Node.js, Express, MySQL , JWT, Socket.IO
- **Frontend** : React + Vite, Axios, React Router, Leaflet, Recharts
- **Mobile** : Android (Java), Retrofit, Google Location Services

## ✅ Prérequis

- Node.js + npm
- MySQL (ex: phpMyAdmin)
- Android Studio (pour lancer l’app mobile)

## 🗄️ Base de données

La base utilisée est `fleet_db`.

- Table des positions GPS : `vehicle_positions`
  - Colonnes : `id`, `vehicle_id`, `latitude`, `longitude`, `recorded_at`

Si besoin, tu peux importer ton dump SQL (ex: `fleet_db.sql`) dans MySQL.

## 🔐 Variables d’environnement (API)

Fichier : `fleet-api/.env`

Exemple :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=fleet_db
JWT_SECRET=fleet_secret_key_2024
PORT=3000
```

## ▶️ Lancer le projet

### 1) Démarrer l’API (`fleet-api`) 🚀

Dans un terminal :

```powershell
cd fleet-api
npm.cmd install
npm.cmd run dev
```

API dispo sur :
- `http://localhost:3000/` → doit retourner `{"message":"Fleet API running"}`

### 2) Démarrer le Front (`fleet-web`) 🌐

Dans un autre terminal :

```powershell
cd fleet-web
npm.cmd install
npm.cmd run dev
```

Front dispo sur :
- `http://localhost:5173/`

### 3) Lancer l’app Android (`fleet-android`) 📱

- Ouvre `fleet-android` avec Android Studio
- Lance sur un émulateur ou un téléphone
- Connecte-toi, puis démarre la mission pour envoyer les coordonnées GPS

## 🔎 Endpoints utiles (API)

- `POST /api/auth/login` : login (retourne un JWT)
- `GET /api/vehicles` : liste véhicules
- `GET /api/positions/all-last` : **tous les véhicules + dernière position (si existe)**
- `POST /api/positions` : enregistrer une position GPS

> Les routes sont protégées par JWT : il faut `Authorization: Bearer <token>`.

## 🧭 Dépannage (FAQ)

### ❌ `{"message":"Token manquant"}`

- Tu n’es pas connecté côté front
- Ou le token n’est pas envoyé dans les headers

👉 Reconnecte-toi sur `/login` et vérifie que `localStorage.token` existe.

### ❌ Carte GPS vide

Vérifie dans MySQL que `vehicle_positions` contient des lignes :
- si vide → l’app Android n’envoie pas encore les positions
- sinon → vérifie la route `GET /api/positions/all-last` (status 200)

### ❌ `Erreur serveur Unknown column ...`

Ton schéma SQL ne correspond pas au code (nom de colonne différent).
La table `vehicle_positions` doit contenir `recorded_at` (et pas `updated_at`).

## 📌 Notes

- L’API utilise Socket.IO (serveur HTTP) dans `fleet-api/server.js`
- Le front rafraîchit les positions toutes les 5 secondes dans la page Carte GPS

