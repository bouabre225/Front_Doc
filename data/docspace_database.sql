
-- =====================================================
-- Base de données DocSpace
-- Marketplace d’équipements médicaux d’occasion
-- Méthode : MERISE -> MLD -> MySQL
-- =====================================================

CREATE DATABASE IF NOT EXISTS docspace;
USE docspace;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(150) UNIQUE,
    avatar VARCHAR(100), 
    role ENUM('acheteur','vendeur','admin') NOT NULL,
    type_compte ENUM('particulier','professionnel') NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    pays VARCHAR(50),
    devise VARCHAR(10),
    adresse TEXT,
    two_factor_secret VARCHAR(100),
    verifie_kyc BOOLEAN DEFAULT FALSE,
    badge_verifie BOOLEAN DEFAULT FALSE,
    note_moyenne DECIMAL(2,1) DEFAULT 0,
    statut ENUM('actif','suspendu','supprime') DEFAULT 'actif',
    two_factor_enable_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kyc_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type_document ENUM('cni','passeport'),
    fichier VARCHAR(255),
    statut ENUM('en_attente','valide','refuse') DEFAULT 'en_attente',
    date_validation DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE annonces (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendeur_id BIGINT NOT NULL,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    categorie VARCHAR(100),
    etat ENUM('neuf','tres_bon','bon','acceptable'),
    prix_vendeur DECIMAL(10,2) NOT NULL,
    frais_protection DECIMAL(10,2) GENERATED ALWAYS AS (prix_vendeur * 0.08) STORED,
    prix_total DECIMAL(10,2) GENERATED ALWAYS AS (prix_vendeur * 1.08) STORED,
    quantite INT DEFAULT 1,
    pays_expedition VARCHAR(50),
    statut ENUM('active','vendue','suspendue') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendeur_id) REFERENCES users(id)
);

CREATE TABLE annonce_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    annonce_id BIGINT NOT NULL,
    image_url VARCHAR(255),
    ordre INT,
    FOREIGN KEY (annonce_id) REFERENCES annonces(id)
);

CREATE TABLE commandes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    acheteur_id BIGINT NOT NULL,
    vendeur_id BIGINT NOT NULL,
    annonce_id BIGINT NOT NULL,
    quantite INT NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    statut ENUM('en_attente','expediee','livree','cloturee') DEFAULT 'en_attente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (acheteur_id) REFERENCES users(id),
    FOREIGN KEY (vendeur_id) REFERENCES users(id),
    FOREIGN KEY (annonce_id) REFERENCES annonces(id)
);

CREATE TABLE paiements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    commande_id BIGINT NOT NULL,
    moyen ENUM('stripe','paypal'),
    montant DECIMAL(10,2),
    statut ENUM('bloque','libere','rembourse'),
    date_paiement DATETIME,
    FOREIGN KEY (commande_id) REFERENCES commandes(id)
);

CREATE TABLE litiges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    commande_id BIGINT NOT NULL,
    acheteur_id BIGINT NOT NULL,
    motif ENUM('non_conforme','defectueux','perdu'),
    preuves TEXT,
    statut ENUM('ouvert','en_cours','resolu') DEFAULT 'ouvert',
    date_signalement DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes(id),
    FOREIGN KEY (acheteur_id) REFERENCES users(id)
);

CREATE TABLE avis (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    commande_id BIGINT NOT NULL,
    vendeur_id BIGINT NOT NULL,
    note_vendeur INT CHECK (note_vendeur BETWEEN 1 AND 5),
    note_conformite INT CHECK (note_conformite BETWEEN 1 AND 5),
    commentaire TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (commande_id) REFERENCES commandes(id),
    FOREIGN KEY (vendeur_id) REFERENCES users(id)
);

CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    expediteur_id BIGINT NOT NULL,
    recepteur_id BIGINT NOT NULL,
    annonce_id BIGINT,
    contenu TEXT,
    lu BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expediteur_id) REFERENCES users(id),
    FOREIGN KEY (recepteur_id) REFERENCES users(id),
    FOREIGN KEY (annonce_id) REFERENCES annonces(id)
);

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM('message','commande','litige','systeme'),
    canal ENUM('push','email','sms'),
    contenu TEXT,
    lu BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
