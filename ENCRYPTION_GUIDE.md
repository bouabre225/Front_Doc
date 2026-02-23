
# 🔐 Guide Complet : Chiffrement des Données Frontend ↔️ Backend

## 📊 Niveaux de Sécurité (du plus important au moins)

| Niveau | Solution | Priorité | Difficulté | Sécurité |
|--------|----------|----------|------------|----------|
| **1** | **HTTPS/TLS** | 🔴 Critique | Facile | ⭐⭐⭐⭐⭐ |
| **2** | **Chiffrement End-to-End** | 🟠 Haute | Moyenne | ⭐⭐⭐⭐ |
| **3** | **Obfuscation Payload** | 🟡 Moyenne | Facile | ⭐⭐ |
| **4** | **Headers Security** | 🟢 Basse | Facile | ⭐⭐⭐ |

---

## 🚀 SOLUTION COMPLÈTE : 4 Couches de Sécurité

---

## ✅ **NIVEAU 1 : HTTPS (OBLIGATOIRE EN PRODUCTION)**

### Pourquoi ?
- Chiffre **TOUT le trafic** automatiquement
- Protège contre les attaques Man-in-the-Middle
- Standard industrie

### Configuration

#### En développement (HTTP suffit)
```bash
# Frontend
http://localhost:5173

# Backend
http://localhost:8000
```

#### En production (HTTPS obligatoire)
```bash
# Frontend
https://docspace.com

# Backend API
https://api.docspace.com
```

**Certificat SSL gratuit avec Let's Encrypt :**
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir certificat
sudo certbot --nginx -d api.docspace.com
```

**Vérification :**
- ✅ Cadenas vert dans le navigateur
- ✅ URL commence par `https://`
- ✅ Certificat valide

---

## ✅ **NIVEAU 2 : CHIFFREMENT END-TO-END (Données sensibles)**

### Quand l'utiliser ?
- Mots de passe
- Données bancaires
- Documents KYC
- Informations médicales

### Solution A : Chiffrement AES-256 Symétrique ⭐ RECOMMANDÉ

#### Backend : Service de Chiffrement Laravel

**Fichier:** `Back-end/back/app/Services/EncryptionService.php`

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Contracts\Encryption\DecryptException;

class EncryptionService
{
    /**
     * Chiffrer des données sensibles
     */
    public function encrypt($data): string
    {
        return Crypt::encryptString(json_encode($data));
    }

    /**
     * Déchiffrer des données
     */
    public function decrypt(string $encrypted)
    {
        try {
            $decrypted = Crypt::decryptString($encrypted);
            return json_decode($decrypted, true);
        } catch (DecryptException $e) {
            throw new \Exception('Données corrompues ou clé invalide');
        }
    }

    /**
     * Chiffrer un payload complet (pour API)
     */
    public function encryptPayload(array $data): array
    {
        return [
            'encrypted' => true,
            'payload' => $this->encrypt($data),
            'timestamp' => now()->timestamp
        ];
    }

    /**
     * Déchiffrer un payload
     */
    public function decryptPayload(array $encrypted)
    {
        if (!isset($encrypted['encrypted']) || !$encrypted['encrypted']) {
            return $encrypted; // Pas chiffré
        }

        return $this->decrypt($encrypted['payload']);
    }
}
```

#### Frontend : Service de Chiffrement JavaScript

**Installer crypto-js :**
```bash
cd Front-end
npm install crypto-js
```

**Fichier:** `Front-end/src/services/encryptionService.js`

```javascript
import CryptoJS from 'crypto-js';

// Clé partagée (à stocker de manière sécurisée)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-secret-key-here';

class EncryptionService {
  /**
   * Chiffrer des données
   */
  encrypt(data) {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
    return encrypted;
  }

  /**
   * Déchiffrer des données
   */
  decrypt(encrypted) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Échec du déchiffrement');
    }
  }

  /**
   * Chiffrer un payload complet
   */
  encryptPayload(data) {
    return {
      encrypted: true,
      payload: this.encrypt(data),
      timestamp: Date.now()
    };
  }

  /**
   * Déchiffrer un payload
   */
  decryptPayload(encrypted) {
    if (!encrypted.encrypted) {
      return encrypted; // Pas chiffré
    }
    return this.decrypt(encrypted.payload);
  }
}

export default new EncryptionService();
```

#### Configuration `.env`

**Backend:** `Back-end/back/.env`
```env
APP_KEY=base64:VotreCleLaravel...  # Généré par php artisan key:generate
```

**Frontend:** `Front-end/.env`
```env
VITE_ENCRYPTION_KEY=your-shared-secret-key-minimum-32-chars
VITE_API_URL=http://localhost:8000/api
```

⚠️ **Important :** La clé doit être la même côté frontend et backend !

---

### Utilisation : Chiffrer des données sensibles

#### Exemple 1 : Login avec mot de passe chiffré

**Frontend :**
```javascript
import encryptionService from '../services/encryptionService';
import { authService } from '../services/authService';

const handleLogin = async (email, password) => {
  // Chiffrer le mot de passe avant envoi
  const encryptedPassword = encryptionService.encrypt(password);

  const response = await authService.login(email, encryptedPassword);
  
  // Déchiffrer la réponse si nécessaire
  if (response.encrypted) {
    return encryptionService.decryptPayload(response);
  }
  
  return response;
};
```

**Backend :**
```php
// app/Http/Controllers/AuthController.php

use App\Services\EncryptionService;

public function login(Request $request, EncryptionService $encryption)
{
    $validated = $request->validate([
        'email' => 'required|email',
        'mot_de_passe' => 'required|string',
    ]);

    // Déchiffrer le mot de passe
    $plainPassword = $encryption->decrypt($validated['mot_de_passe']);

    // Vérifier credentials
    if (!Auth::attempt(['email' => $validated['email'], 'password' => $plainPassword])) {
        return response()->json(['message' => 'Identifiants invalides'], 401);
    }

    $user = Auth::user();
    $token = $user->createToken('auth_token')->plainTextToken;

    // Chiffrer la réponse
    return response()->json($encryption->encryptPayload([
        'token' => $token,
        'user' => $user
    ]));
}
```

---

#### Exemple 2 : Upload de document KYC chiffré

**Frontend :**
```javascript
import encryptionService from '../services/encryptionService';

const uploadKYC = async (file) => {
  // Lire le fichier en base64
  const base64File = await fileToBase64(file);
  
  // Chiffrer le contenu
  const encryptedContent = encryptionService.encrypt({
    filename: file.name,
    content: base64File,
    type: file.type
  });

  // Envoyer au backend
  await api.post('/kyc/submit', {
    type_document: 'cni',
    fichier: encryptedContent
  });
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

**Backend :**
```php
// app/Http/Controllers/KycController.php

public function submit(Request $request, EncryptionService $encryption)
{
    $validated = $request->validate([
        'type_document' => 'required|in:cni,passeport',
        'fichier' => 'required|string',
    ]);

    // Déchiffrer le fichier
    $decrypted = $encryption->decrypt($validated['fichier']);
    
    // Sauvegarder le fichier
    $filename = uniqid() . '_' . $decrypted['filename'];
    $content = base64_decode(explode(',', $decrypted['content'])[1]);
    
    Storage::put('kyc/' . $filename, $content);

    // Créer le document KYC
    $document = KycDocument::create([
        'user_id' => $request->user()->id,
        'type_document' => $validated['type_document'],
        'fichier' => 'kyc/' . $filename,
        'statut' => 'en_attente',
    ]);

    return response()->json($document, 201);
}
```

---

## ✅ **NIVEAU 3 : OBFUSCATION PAYLOAD (Masquage léger)**

### Pour quoi ?
- Rendre le payload **illisible** dans les DevTools
- **NE PAS utiliser pour données sensibles** (sécurité faible)
- Utile pour **décourager** les curieux

### Solution : Base64 + Compression

**Frontend :**
```javascript
// Front-end/src/services/obfuscationService.js

class ObfuscationService {
  /**
   * Obfusquer (encoder)
   */
  obfuscate(data) {
    const jsonString = JSON.stringify(data);
    const base64 = btoa(unescape(encodeURIComponent(jsonString)));
    return base64;
  }

  /**
   * Désobfusquer (décoder)
   */
  deobfuscate(obfuscated) {
    try {
      const jsonString = decodeURIComponent(escape(atob(obfuscated)));
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Données corrompues');
    }
  }

  /**
   * Obfusquer un payload API
   */
  obfuscatePayload(data) {
    return {
      _o: true, // Indicateur "obfuscated"
      d: this.obfuscate(data)
    };
  }

  /**
   * Désobfusquer un payload
   */
  deobfuscatePayload(response) {
    if (response._o) {
      return this.deobfuscate(response.d);
    }
    return response;
  }
}

export default new ObfuscationService();
```

**Backend :**
```php
// app/Services/ObfuscationService.php

class ObfuscationService
{
    public function obfuscate($data): string
    {
        return base64_encode(json_encode($data));
    }

    public function deobfuscate(string $obfuscated)
    {
        return json_decode(base64_decode($obfuscated), true);
    }

    public function obfuscatePayload($data): array
    {
        return [
            '_o' => true,
            'd' => $this->obfuscate($data)
        ];
    }

    public function deobfuscatePayload(array $payload)
    {
        if (isset($payload['_o']) && $payload['_o']) {
            return $this->deobfuscate($payload['d']);
        }
        return $payload;
    }
}
```

**Utilisation :**
```javascript
// Frontend
import obfuscationService from './services/obfuscationService';

const response = await api.post('/annonces', 
  obfuscationService.obfuscatePayload({
    titre: 'Mon annonce',
    prix: 5000
  })
);

const data = obfuscationService.deobfuscatePayload(response.data);
```

⚠️ **Attention :** Base64 n'est PAS du chiffrement ! Facile à décoder.

---

## ✅ **NIVEAU 4 : HEADERS SECURITY**

### Protéger contre les attaques XSS, CSRF, etc.

**Backend Laravel :** `Back-end/back/app/Http/Middleware/SecurityHeaders.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Protection XSS
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        
        // CSP (Content Security Policy)
        $response->headers->set('Content-Security-Policy', "default-src 'self'");
        
        // HSTS (Force HTTPS)
        if ($request->secure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
```

**Enregistrer le middleware :**
```php
// bootstrap/app.php ou app/Http/Kernel.php (selon version Laravel)

->withMiddleware(function (Middleware $middleware) {
    $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
})
```

---

## 🎯 **RECOMMANDATION FINALE : Stratégie par Type de Données**

| Type de donnée | Solution | Raison |
|----------------|----------|--------|
| **Mot de passe** | HTTPS + Hashing (bcrypt) | ✅ Laravel le fait déjà |
| **Token JWT** | HTTPS uniquement | ✅ Chiffré en transit |
| **Email, nom** | HTTPS uniquement | Données non sensibles |
| **Documents KYC** | HTTPS + Chiffrement E2E | ⭐ Ultra sensible |
| **Données bancaires** | HTTPS + Chiffrement E2E | ⭐ Ultra sensible |
| **Prix, catégorie** | HTTPS uniquement | Données publiques |
| **Messages privés** | HTTPS + Chiffrement E2E | ⭐ Vie privée |

---

## 📋 CHECKLIST D'IMPLÉMENTATION

### Niveau 1 : HTTPS (Production)
- [ ] Obtenir certificat SSL (Let's Encrypt)
- [ ] Configurer nginx/Apache avec SSL
- [ ] Forcer HTTPS dans `.env` : `APP_URL=https://...`
- [ ] Vérifier cadenas vert dans navigateur

### Niveau 2 : Chiffrement E2E
- [ ] Installer `crypto-js` : `npm install crypto-js`
- [ ] Créer `EncryptionService.php` backend
- [ ] Créer `encryptionService.js` frontend
- [ ] Générer clé partagée : `openssl rand -base64 32`
- [ ] Ajouter `VITE_ENCRYPTION_KEY` dans `.env`
- [ ] Tester chiffrement/déchiffrement

### Niveau 3 : Obfuscation (Optionnel)
- [ ] Créer `ObfuscationService.php`
- [ ] Créer `obfuscationService.js`
- [ ] Appliquer sur routes non-sensibles

### Niveau 4 : Security Headers
- [ ] Créer middleware `SecurityHeaders`
- [ ] Enregistrer dans kernel
- [ ] Tester avec `curl -I https://api.docspace.com`

---

## 🧪 TESTS DE SÉCURITÉ

### Test 1 : Vérifier HTTPS
```bash
curl -I https://api.docspace.com
# Doit retourner : HTTP/2 200
```

### Test 2 : Tester chiffrement
```javascript
// Frontend console
import encryptionService from './services/encryptionService';

const original = { password: 'secret123' };
const encrypted = encryptionService.encrypt(original);
console.log('Encrypted:', encrypted); 
// → "U2FsdGVkX1+..."

const decrypted = encryptionService.decrypt(encrypted);
console.log('Decrypted:', decrypted); 
// → { password: 'secret123' }
```

### Test 3 : Inspecter Network (Chrome DevTools)
- Ouvrir DevTools → Network
- Faire une requête API
- Vérifier que les données sensibles sont chiffrées
- ✅ Payload doit être illisible

---

## 🚨 ERREURS À ÉVITER

❌ **NE PAS faire :**
1. Stocker la clé de chiffrement dans le code source
2. Utiliser Base64 pour des données sensibles (pas du chiffrement !)
3. Oublier HTTPS en production
4. Chiffrer le token JWT (inutile avec HTTPS)
5. Créer votre propre algorithme de chiffrement

✅ **À faire :**
1. HTTPS obligatoire en production
2. Chiffrement E2E uniquement pour données ultra-sensibles
3. Utiliser les libs éprouvées (crypto-js, Laravel Crypt)
4. Séparer les clés dev/prod
5. Logger les tentatives de déchiffrement échouées

---

## 🔑 GESTION DES CLÉS DE CHIFFREMENT

### Développement
```env
# .env.local (jamais commité)
VITE_ENCRYPTION_KEY=dev-key-not-for-production
```

### Production
```bash
# Générer une clé forte
openssl rand -base64 32

# Stocker dans secrets manager (AWS, Azure, etc.)
# OU dans .env serveur (protégé)
VITE_ENCRYPTION_KEY=gQr7x9Kp2vN8mL4wZ1eT5yU3oI6aS0dF...
```

### Rotation des clés (tous les 6 mois)
```php
// Garder l'ancienne clé pour déchiffrer les anciennes données
config(['app.old_keys' => [
    'key1' => 'base64:...',
    'key2' => 'base64:...',
]]);
```

---

## 📞 AIDE RAPIDE

**Besoin de :**
- ✅ **Sécurité standard** → HTTPS uniquement
- ✅ **Haute sécurité** → HTTPS + Chiffrement E2E
- ✅ **Masquer payload** → Obfuscation Base64
- ✅ **Protection XSS/CSRF** → Security Headers

**Temps d'implémentation :**
- HTTPS : 1h (Let's Encrypt)
- Chiffrement E2E : 4h
- Obfuscation : 2h
- Security Headers : 30min

**Total MVP sécurisé :** ~8h
