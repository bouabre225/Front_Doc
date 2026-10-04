const API_URL = import.meta.env.VITE_API_URL || 'https://docspace.bj/api';

const getToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch { return null; }
};

export const safeParse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
};

// Normalise les réponses Laravel : paginator, {data:[]}, {conversations:[]}, tableau brut
export const parseList = (res, keys = []) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.data)) return res.data;
  for (const k of keys) {
    if (Array.isArray(res?.[k])) return res[k];
  }
  return [];
};

const authHeaders = (extra = {}) => ({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleResponse = async (res) => {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const e = new Error(res.ok ? 'Réponse serveur invalide' : `Erreur serveur (${res.status})`);
    e.status = res.status;
    throw e;
  }
  if (!res.ok) {
    const message =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(' ') : 'Erreur serveur');
    const err = new Error(message);
    err.status = res.status;
    err.errors = data?.errors;
    throw err;
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

export const loginAdmin = async (email, password) => {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, mot_de_passe: password }),
  });
  return handleResponse(res);
};

export const login2fa = async ({challenge_id, code}) => {
  const res = await fetch(`${API_URL}/login/2fa`, {
    method: 'POST',
    headers: authHeaders(),
     body: JSON.stringify({
      challenge_id: String(challenge_id), // ← forcer string
      code:         String(code),          // ← forcer string
    }),
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

export const getAnnonces = async (page = 1, params = {}) => {
  const queryParams = { page, per_page: Math.min(Number(params.per_page) || 12, 100) };

  // N'ajoute les params que s'ils ont une valeur
  if (params.categorie) queryParams.categorie = params.categorie;
  if (params.etat)      queryParams.etat      = params.etat;
  if (params.sort)      queryParams.sort      = params.sort;
  if (params.search)    queryParams.search    = params.search;
  if (params.statut)    queryParams.statut    = params.statut;

  const query = new URLSearchParams(queryParams).toString();

  const res = await fetch(`${API_URL}/annonces?${query}`, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
};

export const getCountsParCategorie = async () => {
  const res = await fetch(`${API_URL}/annonces/counts-categorie`, {
    headers: { 'Accept': 'application/json' },
  });
  return handleResponse(res);
};

export const getMyAnnonces = async () => {
  const res = await fetch(`${API_URL}/annonces?my=true`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const searchAnnonces = async (q, page = 1, params = {}) => {
  const sp = new URLSearchParams({ q, page });
  if (params.categorie) sp.set('categorie', params.categorie);
  if (params.etat) sp.set('etat', params.etat);
  if (params.sort) sp.set('sort', params.sort);
  const res = await fetch(
    `${API_URL}/annonces/search?${sp.toString()}`,
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
    formData.append('image', file);
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

export const getCommandesRecues = async () => {
  const res = await fetch(`${API_URL}/commandes/recues`, {
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

export const verifyCommande = async (id) => {
  const res = await fetch(`${API_URL}/commandes/${id}/verify`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const renvoyerFacture = async (id) => {
  const res = await fetch(`${API_URL}/commandes/${id}/facture`, {
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

export const deleteAdminAnnonce = async (id, force = false) => {
  const url = `${API_URL}/admin/annonces/${id}${force ? '?force=true' : ''}`;
  const res = await fetch(url, {
    method: 'DELETE',
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

export const getAdminCommandes = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/admin/commandes${query ? '?' + query : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getAdminUsers = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/admin/users${query ? '?' + query : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getAdminStats = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/admin/stats${query ? '?' + query : ''}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const suspendUser = async (id) => {
  const res = await fetch(`${API_URL}/admin/users/${id}/suspend`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const reactivateUser = async (id) => {
  const res = await fetch(`${API_URL}/admin/users/${id}/reactivate`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const deleteAdminUser = async (id) => {
  const res = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getKycDocumentUrl = (id) => {
  return `${API_URL}/admin/kyc/document/${id}`;
};

export const marquerCommandeLivree = async (commandeId) => {
  const res = await fetch(`${API_URL}/commandes/${commandeId}/livrer`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleResponse(res);
};


// ─── Helpers ─────────────────────────────────────────────────────────────────

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const p = String(imagePath);
  if (p.startsWith('http') || p.startsWith('blob:') || p.startsWith('data:')) return p;
  const base = (import.meta.env.VITE_API_URL || 'https://docspace.bj/api').replace(/\/api\/?$/, '');
  return `${base}/storage/${p.replace(/^\/+|^(storage\/)+/, '')}`;
};

export default {
  loginUser, loginAdmin, login2fa,
  registerBuyer, registerSeller,
  logoutUser, getMe, updateFcmToken, updateProfile, forgotPassword, resetPassword,
  enable2fa, verify2fa, disable2fa,
  getAnnonces, searchAnnonces, getAnnonceById, getMyAnnonces,
  createAnnonce, updateAnnonce, deleteAnnonce,
  uploadAnnonceImages, sendContact,
  getCommandes, getCommandeById, createCommande, cancelCommande, payCommande, verifyCommande, renvoyerFacture, getCommandesRecues,
  getConversations, getConversation, sendMessage,
  getNotifications, getNotificationsCount,
  markNotificationRead, markAllNotificationsRead, deleteNotification,
  submitKyc, getKycStatus, getKycDocuments, deleteKycDocument,
  getLitiges, getLitigeById, createLitige,
  getKycPending, decideKyc,
  getAdminLitiges, prendreEnChargeLitige, resoldreLitige,
  getAdminCommandes, getAdminUsers, getAdminStats,
  suspendUser, reactivateUser, deleteAdminUser,
  getImageUrl, getCountsParCategorie,
  getKycDocumentUrl,
  marquerCommandeLivree,
};