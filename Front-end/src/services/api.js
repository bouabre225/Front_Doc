const API_URL = 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('auth_token');

const authHeaders = (extra = {}) => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    const message =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(' ') : 'Erreur serveur');
    throw new Error(message);
  }
  return data;
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginUser = async (email, mot_de_passe) => {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, mot_de_passe }),
  });
  return handleResponse(res);
};

export const loginAdmin = async (email, mot_de_passe) => {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, mot_de_passe }),
  });
  return handleResponse(res);
};

export const login2fa = async (challenge_id, code) => {
  const res = await fetch(`${API_URL}/login/2fa`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ challenge_id, code }),
  });
  return handleResponse(res);
};

export const registerBuyer = async (payload) => {
  const res = await fetch(`${API_URL}/register/acheteur`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const registerSeller = async (payload) => {
  const res = await fetch(`${API_URL}/register/vendeur`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const logoutUser = async () => {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_URL}/password/forgot`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
};

export const resetPassword = async (payload) => {
  const res = await fetch(`${API_URL}/password/reset`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const getMe = async () => {
  const res = await fetch(`${API_URL}/me`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const updateProfile = async (payload) => {
  const res = await fetch(`${API_URL}/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const updateFcmToken = async (fcm_token) => {
  const res = await fetch(`${API_URL}/me/fcm-token`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ fcm_token }),
  });
  return handleResponse(res);
};

// ─── 2FA ─────────────────────────────────────────────────────────────────────

export const enable2fa = async () => {
  const res = await fetch(`${API_URL}/2fa/enable`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const verify2fa = async (code) => {
  const res = await fetch(`${API_URL}/2fa/verify`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ code }),
  });
  return handleResponse(res);
};

export const disable2fa = async (code) => {
  const res = await fetch(`${API_URL}/2fa/disable`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ code }),
  });
  return handleResponse(res);
};

// ─── Annonces ────────────────────────────────────────────────────────────────

export const getAnnonces = async (page = 1) => {
  const res = await fetch(`${API_URL}/annonces?page=${page}`, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
};

export const searchAnnonces = async (q, page = 1) => {
  const res = await fetch(
    `${API_URL}/annonces/search?q=${encodeURIComponent(q)}&page=${page}`,
    { headers: { 'Accept': 'application/json' } }
  );
  return handleResponse(res);
};

export const getAnnonceById = async (id) => {
  const res = await fetch(`${API_URL}/annonces/${id}`, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
};

export const createAnnonce = async (payload) => {
  const res = await fetch(`${API_URL}/annonces`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const updateAnnonce = async (id, payload) => {
  const res = await fetch(`${API_URL}/annonces/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const deleteAnnonce = async (id) => {
  const res = await fetch(`${API_URL}/annonces/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const uploadAnnonceImages = async (annonceId, files) => {
  const results = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file); // ← 'image' pas 'images[]'
    const res = await fetch(`${API_URL}/annonces/${annonceId}/images`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
      },
      body: formData,
    });
    const data = await handleResponse(res);
    results.push(data);
  }
  return results;
};

// ─── Commandes ───────────────────────────────────────────────────────────────

export const getCommandes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/commandes${query ? '?' + query : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getCommandeById = async (id) => {
  const res = await fetch(`${API_URL}/commandes/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const createCommande = async (payload) => {
  const res = await fetch(`${API_URL}/commandes`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const cancelCommande = async (id) => {
  const res = await fetch(`${API_URL}/commandes/${id}/cancel`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const payCommande = async (id) => {
  const res = await fetch(`${API_URL}/commandes/${id}/pay`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const getConversations = async () => {
  const res = await fetch(`${API_URL}/messages`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getConversation = async (userId) => {
  const res = await fetch(`${API_URL}/messages/${userId}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const sendMessage = async (payload) => {
  // payload: { recepteur_id, annonce_id?, contenu }
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const getNotifications = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/notifications${query ? '?' + query : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getNotificationsCount = async () => {
  const res = await fetch(`${API_URL}/notifications/compteur`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const sendContact = async (payload) => {
  const res = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const markNotificationRead = async (id) => {
  const res = await fetch(`${API_URL}/notifications/${id}/lire`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const markAllNotificationsRead = async () => {
  const res = await fetch(`${API_URL}/notifications/lire-tout`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const deleteNotification = async (id) => {
  const res = await fetch(`${API_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// ─── KYC Vendeur ─────────────────────────────────────────────────────────────

export const submitKyc = async (typeDocument, fichier) => {
  const formData = new FormData();
  formData.append('type_document', typeDocument); // 'cni' ou 'passport'
  formData.append('fichier', fichier);
  const res = await fetch(`${API_URL}/kyc/submit`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
      // pas de Content-Type ici, le browser le set automatiquement avec boundary
    },
    body: formData,
  });
  return handleResponse(res);
};

export const getKycStatus = async () => {
  const res = await fetch(`${API_URL}/kyc/status`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getKycDocuments = async () => {
  const res = await fetch(`${API_URL}/kyc/documents`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const deleteKycDocument = async (id) => {
  const res = await fetch(`${API_URL}/kyc/documents/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

// ─── Litiges ─────────────────────────────────────────────────────────────────

export const getLitiges = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/litiges${query ? '?' + query : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getLitigeById = async (id) => {
  const res = await fetch(`${API_URL}/litiges/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const createLitige = async (payload) => {
  // payload: { commande_id, motif, preuves? }
  const res = await fetch(`${API_URL}/litiges`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getKycPending = async () => {
  const res = await fetch(`${API_URL}/admin/kyc/pending`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const decideKyc = async (id, decision, commentaire = null) => {
  // decision: 'valide' ou 'refuse'
  const res = await fetch(`${API_URL}/admin/kyc/${id}/decide`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ decision, commentaire }),
  });
  return handleResponse(res);
};

export const getAdminLitiges = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/admin/litiges${query ? '?' + query : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const prendreEnChargeLitige = async (id) => {
  const res = await fetch(`${API_URL}/admin/litiges/${id}/prendre-en-charge`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const resoldreLitige = async (id, decision) => {
  // decision: 'rembourse' ou 'rejete'
  const res = await fetch(`${API_URL}/admin/litiges/${id}/resoudre`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ decision }),
  });
  return handleResponse(res);
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

export default {
  loginUser, loginAdmin, login2fa,
  registerBuyer, registerSeller,
  logoutUser, getMe, updateFcmToken, updateProfile, forgotPassword, resetPassword,
  enable2fa, verify2fa, disable2fa,
  getAnnonces, searchAnnonces, getAnnonceById,
  createAnnonce, updateAnnonce, deleteAnnonce,
  uploadAnnonceImages, sendContact,
  getCommandes, getCommandeById, createCommande, cancelCommande, payCommande,
  getConversations, getConversation, sendMessage,
  getNotifications, getNotificationsCount,
  markNotificationRead, markAllNotificationsRead, deleteNotification,
  submitKyc, getKycStatus, getKycDocuments, deleteKycDocument,
  getLitiges, getLitigeById, createLitige,
  getKycPending, decideKyc,
  getAdminLitiges, prendreEnChargeLitige, resoldreLitige,
  getImageUrl,
};