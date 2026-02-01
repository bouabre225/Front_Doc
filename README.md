📦 Medical Equipment Marketplace

Plateforme de vente d’équipements médicaux permettant la mise en relation entre vendeurs certifiés et acheteurs.

🧱 Architecture

Frontend : React (SPA)

Backend : Laravel (API REST)

Base de données : PostgreSQL

Auth : JWT

Paiement : Mobile Money / Carte bancaire

📁 Structure du projet
frontend/   → application React
backend/    → API Laravel
docs/       → documentation technique

⚙️ Installation
Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

Frontend
cd frontend
npm install
npm run dev

🔐 Fonctionnalités

Authentification utilisateurs

Gestion KYC des vendeurs

Publication d’annonces

Commandes et paiements

Avis et messagerie

Notifications

🧪 Tests
php artisan test

📄 Licence

Projet privé – client professionnel.
