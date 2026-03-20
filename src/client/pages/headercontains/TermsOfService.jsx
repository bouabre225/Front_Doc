import React from 'react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto my-10 p-8 bg-white shadow-lg rounded-xl border border-gray-100 text-gray-800 leading-relaxed">
      <header className="border-b pb-6 mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-gray-500 mt-2">Version 1.0 — En vigueur au 18 mars 2026</p>
      </header>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2 font-mono uppercase tracking-wide">1. Présentation de docSpace</h2>
          <p>
            <strong>docSpace</strong> est une plateforme intermédiaire mettant en relation des professionnels de santé, 
            des structures de soins et des particuliers pour la transaction d'équipements médicaux neufs ou d'occasion. 
            docSpace n'est en aucun cas le vendeur des produits proposés sur la plateforme.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2 font-mono uppercase tracking-wide">2. Éligibilité</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>L'utilisateur doit être âgé d'au moins 18 ans.</li>
            <li>Les professionnels doivent justifier de leur droit d'exercice (SIRET, numéro d'Ordre) lors de la procédure de vérification KYC.</li>
            <li>L'utilisation de faux documents entraîne une suspension immédiate du compte.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2 font-mono uppercase tracking-wide">3. Obligations du Vendeur (docSeller)</h2>
          <p>Le vendeur s'engage à :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Garantir la conformité réglementaire (Marquage CE, normes ISO) du matériel.</li>
            <li>Fournir des photos réelles et une description honnête de l'état (neuf, très bon état, usagé).</li>
            <li>Assurer la décontamination et la désinfection du matériel d'occasion avant expédition.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2 font-mono uppercase tracking-wide">4. Transactions et Paiements</h2>
          <p>
            Les paiements sont sécurisés via nos partenaires (MTN, Moov, Celtis, CB). 
            Les fonds sont séquestrés par docSpace et ne sont libérés au vendeur qu'après :
          </p>
          <ol className="list-decimal pl-6 space-y-2 mt-2">
            <li>Confirmation de la réception par l'acheteur.</li>
            <li>Expiration d'un délai de contestation de 48 heures.</li>
          </ol>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 italic">
          <strong>Note importante :</strong> docSpace décline toute responsabilité quant à l'usage clinique des dispositifs médicaux achetés. 
          Il incombe à l'acheteur de vérifier la sécurité du matériel avant toute utilisation sur un patient.
        </div>

        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2 font-mono uppercase tracking-wide">5. Droit Applicable</h2>
          <p>
            Les présentes CGU sont régies par le droit français. En cas de litige, et après tentative de résolution à l'amiable, 
            compétence exclusive est attribuée aux tribunaux compétents.
          </p>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t text-center text-gray-400 text-sm">
        Contact support : support@docspace.bj
      </footer>
    </div>
  );
};

export default TermsOfService;