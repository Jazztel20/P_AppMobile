# Passion Lecture – Backend (AdonisJS 6 + MySQL)

## Description

API REST de l'application **Passion Lecture**, fournissant les données du catalogue de livres, l'authentification des utilisateurs, la gestion des commentaires, notes et tags.

---

## Technologies

| Outil            | Version |
|------------------|---------|
| AdonisJS         | 6.x     |
| TypeScript       | 5.x     |
| Lucid ORM        | inclus  |
| MySQL            | 8.0     |
| VineJS           | validations |
| OAT (tokens)     | auth    |

---

## Prérequis

- **Node.js** v20.19+ ou v22.12+
- **Docker & Docker Compose** (pour MySQL + phpMyAdmin)

---

## Démarrage rapide

### 1. Démarrer la base de données

```bash
cd Backend
docker-compose up -d
```

Cela lance :
- **MySQL 8** sur le port `6033` (conteneur `db`)
- **phpMyAdmin** sur http://localhost:8081 (user: `db_user` / pass: `db_user_pass`)

### 2. Installer les dépendances

```bash
cd Backend/p-web-back-end
npm install
```

### 3. Vérifier le fichier `.env`

Le fichier `.env` doit exister avec les valeurs correspondant au docker-compose :

```env
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=zcfbfM04L7GVNZmFGrMQEu3kPWiYdL7m
NODE_ENV=development

DB_HOST=127.0.0.1
DB_PORT=6033
DB_USER=db_user
DB_PASSWORD=db_user_pass
DB_DATABASE=db_passion_lecture
```

### 4. Exécuter les migrations

```bash
node ace migration:run
```

### 5. Peupler la base de données (données de test)

```bash
node ace db:seed
```

> ℹ️ Le seeder 4 (`4_book_seeder.ts`) tente de charger des fichiers `.epub` depuis le dossier `../../books/`. Placez vos fichiers epub dans `P_PassionLecture/books/` avant de lancer le seed.

### 6. Démarrer le serveur

```bash
node ace serve --watch
```

L'API sera disponible sur **http://localhost:3333**

---

## Structure du projet

```
p-web-back-end/
├── app/
│   ├── controllers/     # Logique des routes HTTP
│   ├── middleware/      # Middlewares AdonisJS
│   ├── models/          # Modèles Lucid (ORM)
│   └── validators/      # Validation des entrées (VineJS)
├── config/              # Configuration (CORS, DB, Auth, ...)
├── database/
│   ├── migrations/      # Schémas de base de données
│   └── seeders/         # Données initiales / de test
└── start/
    ├── routes.ts        # Toutes les routes de l'API
    ├── kernel.ts        # Middlewares globaux
    └── env.ts           # Validation des variables d'environnement
```

---

## Endpoints principaux

### Livres (publics)
| Méthode | URL                         | Description                     |
|---------|-----------------------------|---------------------------------|
| GET     | `/books/home`               | 5 derniers livres ajoutés       |
| GET     | `/books/search?q=…`         | Recherche par titre             |
| GET     | `/books`                    | Tous les livres                 |
| GET     | `/books/:id`                | Détail d'un livre               |
| GET     | `/books/:id/epub`           | Contenu EPUB en base64          |
| GET     | `/books/:id/reviews`        | Avis fusionnés (note+commentaire)|
| GET     | `/books/:id/AvgRating`      | Note moyenne                    |
| GET     | `/books/:id/comments`       | Commentaires d'un livre         |
| GET     | `/books/:id/evaluates`      | Notes d'un livre                |
| GET     | `/categories/:id/books`     | Livres par catégorie            |

### Livres (authentifié)
| Méthode | URL              | Description            |
|---------|------------------|------------------------|
| POST    | `/books`         | Créer un livre         |
| PUT     | `/books/:id`     | Modifier un livre      |
| DELETE  | `/books/:id`     | Supprimer un livre     |

### Commentaires & Notes (authentifié)
| Méthode | URL                  | Description                |
|---------|----------------------|----------------------------|
| POST    | `/comments`          | Poster un commentaire      |
| PUT     | `/comments/:id`      | Modifier un commentaire    |
| DELETE  | `/comments/:id`      | Supprimer un commentaire   |
| POST    | `/evaluates`         | Poster une note            |
| PUT     | `/evaluates/:id`     | Modifier une note          |
| DELETE  | `/evaluates/:id`     | Supprimer une note         |

### Tags (authentifié)
| Méthode | URL                        | Description                     |
|---------|----------------------------|---------------------------------|
| GET     | `/tags`                    | Mes tags                        |
| POST    | `/tags`                    | Créer un tag                    |
| PUT     | `/tags/:id`                | Modifier un tag                 |
| DELETE  | `/tags/:id`                | Supprimer un tag                |
| POST    | `/tags/:id/books/:bookId`  | Attacher un livre à un tag      |
| DELETE  | `/tags/:id/books/:bookId`  | Détacher un livre d'un tag      |

### Authentification
| Méthode | URL               | Description         |
|---------|-------------------|---------------------|
| POST    | `/user/register`  | Créer un compte     |
| POST    | `/user/login`     | Se connecter        |
| POST    | `/user/logout`    | Se déconnecter      |

---

## Base de données

**Tables :**
- `users` – Utilisateurs (login, password hashé, isAdmin)
- `categories` – Catégories de livres
- `writers` – Auteurs
- `books` – Livres (titre, résumé, epub en BLOB, image, etc.)
- `comments` – Commentaires liés à un livre et un utilisateur
- `evaluates` – Notes (1-5) liées à un livre et un utilisateur
- `auth_access_tokens` – Tokens de connexion OAT
- `tags` – Tags personnels de l'utilisateur
- `book_tag` – Pivot many-to-many livres ↔ tags

---

## CORS

Le CORS est configuré dans `config/cors.ts` avec `origin: true` et `credentials: true`, acceptant toute origine (adapté au développement local avec le frontend sur `localhost:5173`).
