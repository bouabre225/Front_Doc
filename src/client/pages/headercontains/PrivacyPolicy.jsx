import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow-lg rounded-xl border border-gray-100 text-gray-800 leading-relaxed">
      <span onClick={() => navigate(-1)} className="cursor-pointer text-blue-600 underline">Retour</span>
      <header className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold text-green-900">Politique de Confidentialité</h1>
        <p className="text-sm text-gray-500 mt-2">Dernière mise à jour : 18 mars 2026</p>
      </header>

      <section className="space-y-8">
        <div>
          <p className="bg-green-50 p-4 rounded-md text-green-800">
            Chez <strong>docSpace</strong>, nous traitons vos données avec la rigueur imposée par le secteur médical et le respect du RGPD.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b-2 border-green-200 inline-block mb-4">1. Collecte des Données</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold text-green-700">Identité & Contact</h3>
              <p className="text-sm">Nom, email, téléphone, SIRET, pièces d'identité (KYC).</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold text-green-700">Données Techniques</h3>
              <p className="text-sm">Adresse IP, cookies, identifiants de connexion.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b-2 border-green-200 inline-block mb-4">2. Pourquoi utilisons-nous vos données ?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Gestion des services :</strong> Traitement des annonces et suivi des commandes.</li>
            <li><strong>Sécurité & KYC :</strong> Vérification de l'identité pour prévenir la fraude.</li>
            <li><strong>Communication :</strong> Envoi de notifications push et emails transactionnels.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b-2 border-green-200 inline-block mb-4">3. Durée de conservation</h2>
          <table className="w-full text-left border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border p-2">Donnée</th>
                <th className="border p-2">Durée</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">Compte actif</td>
                <td className="border p-2">Durée d'adhésion + 3 ans</td>
              </tr>
              <tr>
                <td className="border p-2">Factures & Transactions</td>
                <td className="border p-2">10 ans (Obligation légale)</td>
              </tr>
              <tr>
                <td className="border p-2">Pièces d'identité (KYC)</td>
                <td className="border p-2">Jusqu'à validation du compte</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-xl font-bold border-b-2 border-green-200 inline-block mb-4">4. Vos droits (RGPD)</h2>
          <p>Vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles.</p>
          <p className="mt-2 font-semibold">
            Contactez notre DPO : <span className="text-blue-600 underline">docspaceafrica@gmail.com</span>
          </p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
          <strong>Sécurité :</strong> docSpace utilise le chiffrement TLS pour tous les transferts de données et des serveurs sécurisés pour garantir l'intégrité de vos informations de santé indirectes.
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;