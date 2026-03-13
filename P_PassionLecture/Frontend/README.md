# Passion Lecture – Frontend (Vue 3 + Vite)

## Description

Interface web de l'application **Passion Lecture**, permettant aux utilisateurs de :

- Parcourir un catalogue de livres (page d'accueil, page par catégorie)
- Rechercher des livres par titre
- Voir les détails d'un livre (résumé, note globale, commentaires)
- Lire un livre en format e-book (liseuse)
- S'authentifier (inscription / connexion / déconnexion)
- Gérer son catalogue personnel (ajouter, modifier, supprimer des livres)
- Créer et gérer des tags personnalisés pour filtrer ses livres
- Laisser une note (1-5 étoiles) et un commentaire sur un livre

---

## Technologies

| Outil       | Version |
|-------------|---------|
| Vue 3       | ^3.5    |
| TypeScript  | ~5.9    |
| Vite        | ^7.2    |
| Vue Router  | ^4.6    |
| Pinia       | ^3.0    |
| Axios       | ^1.13   |

---

## Prérequis

- **Node.js** v20.19+ ou v22.12+
- Le backend AdonisJS doit être démarré sur `http://localhost:3333`

---

## Installation

```bash
cd Frontend
npm install
```

## Démarrage (développement)

```bash
npm run dev
```

L'application sera disponible sur **http://localhost:5173**

---

## Structure du projet

```
src/
├── api/              # Appels API vers le backend (books, categories, writers)
├── assets/           # Fichiers statiques (images, CSS global)
├── components/
│   ├── bookcard/     # Carte livre réutilisable (BookCard.vue)
│   ├── formulaire/   # Formulaires login / register
│   └── partials/     # Header et Footer globaux
├── models/           # Interfaces TypeScript (Book, Category, Writer)
├── router/           # Routes Vue Router
├── stores/           # Stores Pinia (auth)
└── views/            # Pages de l'application
    ├── home.vue             # Page d'accueil (5 derniers livres)
    ├── BookView.vue         # Détail d'un livre + avis + tags
    ├── ReaderView.vue       # Liseuse (e-book)
    ├── BooksView.vue        # Recherche de livres
    ├── categoriesView.vue   # Livres par catégorie
    ├── catalogueView.vue    # Catalogue personnel + filtre par tag
    ├── AddBookView.vue      # Formulaire d'ajout d'un livre
    ├── EditBook.vue         # Formulaire de modification d'un livre
    ├── LoginView.vue        # Connexion
    └── RegisterView.vue     # Inscription
```

---

## Routes

| URL                  | Nom        | Description               | Auth ? |
|----------------------|------------|---------------------------|--------|
| `/`                  | home       | Accueil (5 livres récents)|        |
| `/categories`        | categories | Livres par catégorie      |        |
| `/books/search?q=…`  | search     | Recherche de livres       |        |
| `/books/:id`         | book       | Détail d'un livre         |        |
| `/books/:id/read`    | reader     | Liseuse                   |        |
| `/catalogue`         | catalogue  | Catalogue personnel + tags| ✅     |
| `/addbook`           | addbook    | Ajouter un livre          | ✅     |
| `/books/edit/:id`    | edit       | Modifier un livre         | ✅     |
| `/login`             | login      | Connexion                 |        |
| `/register`          | register   | Inscription               |        |

---

## Authentification

L'authentification JWT (token Bearer) est stockée dans `localStorage` :
- `authToken` : token OAT retourné par le backend
- `currentUser` : données utilisateur `{ id, username }`

Le store Pinia `auth` expose `isLoggedIn`, `user`, `login()`, `logout()`.

---

## Lancer les tests

```bash
npm run test:unit
```
