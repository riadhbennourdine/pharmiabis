
# PharmIA - Backend (Node.js & MongoDB)

Ce dossier contient le backend de l'application PharmIA. Il s'agit d'un serveur Node.js léger utilisant Express, conçu pour se connecter directement à une base de données MongoDB. Il remplace la précédente implémentation basée sur Strapi.

## Philosophie

Ce backend est simple et direct. Il fournit les points d'API nécessaires pour que le frontend puisse lire et écrire des données, sans la complexité d'un CMS complet.

## Prérequis

- [Node.js](https://nodejs.org/en/) (Version 18.x ou plus récente)
- `npm` ou `yarn`
- Une instance de [MongoDB](https://www.mongodb.com/) accessible (locale ou via un service cloud comme MongoDB Atlas).

---

## 1. Installation

### Étape 1 : Installer les dépendances

Naviguez dans ce dossier (`backend`) et installez les dépendances.

```bash
cd backend
npm install
# ou
# yarn install
```

### Étape 2 : Configurer la connexion à la base de données

Le projet utilise un fichier `.env` pour stocker la chaîne de connexion à MongoDB.

1.  Créez une copie du fichier `.env.example` et nommez-la `.env`.
2.  Ouvrez le nouveau fichier `.env`.
3.  Modifiez la variable `MONGODB_URI` pour qu'elle corresponde à votre chaîne de connexion MongoDB. Assurez-vous d'inclure le nom de votre base de données à la fin de l'URI (par exemple, `/pharmia`).

*Exemple pour une base de données MongoDB locale :*
`MONGODB_URI=mongodb://127.0.0.1:27017/pharmia`

---

## 2. Lancement du Serveur

Pour lancer le serveur en mode développement (avec redémarrage automatique en cas de modification), utilisez :

```bash
npm run dev
```

Pour un lancement en production, utilisez :

```bash
npm start
```

Le serveur démarrera (par défaut sur `http://localhost:3001`).

Au premier lancement, le serveur se connectera à votre base de données et la peuplera automatiquement avec les thèmes et systèmes/organes par défaut si les collections sont vides.

---

## 3. Points d'API (Routes)

Le serveur expose les routes suivantes :

-   `GET /api/data`
    -   Récupère toutes les données nécessaires au démarrage de l'application (thèmes, systèmes/organes, et toutes les mémofiches).

-   `POST /api/memofiches`
    -   Crée une nouvelle mémofiche. Met également à jour ou crée (upsert) les thèmes et systèmes/organes associés.

-   `DELETE /api/memofiches/:id`
    -   Supprime une mémofiche en se basant sur son `id` (et non sur `_id` de MongoDB).

