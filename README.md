# Quincaillerie App - Application de gestion de quincaillerie

Application complète de gestion de point de vente (POS) pour quincaillerie, développée avec Laravel 12, Inertia.js et React 18.

## 🛠 Technologies utilisées

- **Backend**: Laravel 12 (PHP 8.2)
- **Frontend**: React 18 avec Inertia.js v2
- **UI Framework**: Material UI v6 (MUI)
- **Base de données**: MySQL
- **CSS**: Tailwind CSS 3
- **PDF**: barryvdh/laravel-dompdf
- **Build**: Vite

## ✨ Fonctionnalités

### Modules principaux
- **Produits**: CRUD complet, gestion du stock, images, codes-barres, SKU
- **Factures (Bills)**: Création de factures, recherche de produits, génération PDF (FR/AR)
- **Employés (Workers)**: Gestion des employés avec rôles
- **Catégories**: Organisation des produits par catégorie
- **Fournisseurs**: Gestion des fournisseurs
- **Paramètres**: Configuration du magasin et informations fiscales

### Caractéristiques
- 🌍 **Bilingue**: Français (par défaut) et Arabe avec support RTL
- 🌙 **Thème sombre/clair** avec persistance localStorage
- 📊 **Tableau de bord** avec statistiques en temps réel
- 📱 **Responsive** (adapté mobile/tablette)
- 🔍 **Recherche avancée** avec filtres multiples
- 📄 **Factures PDF** générées en français ou arabe
- 📦 **Suivi des mouvements de stock**

## 📋 Prérequis

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL >= 5.7
- Laragon (ou autre environnement LAMP/WAMP)

## 🚀 Installation

### 1. Cloner et installer les dépendances

```bash
cd c:\laragon\www
git clone <repository> quincaillerie-app
cd quincaillerie-app

# Installer les dépendances PHP
composer install

# Installer les dépendances JavaScript
npm install
```

### 2. Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

### 3. Base de données

Créer une base de données MySQL nommée `quincaillerie` puis:

```bash
# Exécuter les migrations
php artisan migrate

# Peupler avec les données de test (optionnel)
php artisan db:seed
```

### 4. Storage link

```bash
php artisan storage:link
```

### 5. Compiler les assets

```bash
# Développement
npm run dev

# Production
npm run build
```

### 6. Lancer l'application

Avec Laragon, accédez à: `http://quincaillerie-app.test`

Ou lancez le serveur de développement:
```bash
php artisan serve
```

## 👥 Utilisateurs par défaut

Après le seeding, les utilisateurs suivants sont disponibles:

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| admin@quincaillerie.dz | password | Admin |
| caissier@quincaillerie.dz | password | Caissier |
| viewer@quincaillerie.dz | password | Viewer |

## 📁 Structure du projet

```
quincaillerie-app/
├── app/
│   ├── Domains/Products/Queries/    # DDD queries
│   ├── Http/Controllers/            # Controllers
│   ├── Models/                      # Eloquent models
│   └── Policies/                    # Authorization policies
├── database/
│   ├── migrations/                  # Database migrations
│   └── seeders/                     # Data seeders
├── resources/
│   ├── js/
│   │   ├── Components/              # React components
│   │   ├── Layouts/                 # Layout components
│   │   └── Pages/                   # Inertia pages
│   └── views/
│       └── bills/invoice.blade.php  # PDF template
├── lang/
│   ├── fr.json                      # French translations
│   └── ar.json                      # Arabic translations
└── routes/
    └── web.php                      # Application routes
```

## 🔧 Commandes utiles

```bash
# Cache des configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Effacer le cache
php artisan cache:clear
php artisan config:clear

# Réinitialiser la base de données
php artisan migrate:fresh --seed

# Générer un nouveau produit (factory)
php artisan tinker
> Product::factory()->count(10)->create()
```

## 📝 API Routes

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /dashboard | Tableau de bord |
| GET/POST | /products | Liste/Créer produits |
| GET/PUT/DELETE | /products/{id} | Voir/Modifier/Supprimer produit |
| GET/POST | /bills | Liste/Créer factures |
| GET | /bills/{id}/pdf | Télécharger facture PDF |
| GET/POST | /workers | Liste/Créer employés |
| GET/POST | /categories | Liste/Créer catégories |
| GET/POST | /suppliers | Liste/Créer fournisseurs |
| GET/POST | /settings | Paramètres du magasin |

## 🌐 Changement de langue

L'application supporte le français (LTR) et l'arabe (RTL). Le changement de langue se fait via le bouton dans la barre de navigation. La préférence est sauvegardée dans localStorage.

## 🎨 Thème

Le thème sombre/clair peut être basculé via le bouton dans la barre de navigation. La préférence est également sauvegardée dans localStorage.

## 📄 Génération PDF

Les factures peuvent être générées en PDF en français ou en arabe:

- **Français**: `GET /bills/{id}/pdf?lang=fr`
- **Arabe (RTL)**: `GET /bills/{id}/pdf?lang=ar`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📜 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Développé pour

Application de gestion de quincaillerie en Algérie, avec support complet français/arabe.
