const API_URL = 'http://localhost:8000/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

export const registerBuyer = async (payload) => {
  // payload: { nom, email, mot_de_passe, telephone?, adresse?, pays? }
  const res = await fetch(`${API_URL}/register/acheteur`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const registerSeller = async (payload) => {
  // payload: { nom, email, mot_de_passe, telephone, adresse?, pays?, type_compte? }
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

export const getMe = async () => {
  const res = await fetch(`${API_URL}/me`, {
    headers: authHeaders(),
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
  // payload: { titre, description, prix_vendeur, categorie, etat, quantite, pays_expedition }
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
  const formData = new FormData();
  files.forEach((file) => formData.append('images[]', file));
  const res = await fetch(`${API_URL}/annonces/${annonceId}/images`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {}),
    },
    body: formData,
  });
  return handleResponse(res);
};

export const getAnnoncesByCategorie = async (categorie, page = 1) => {
  const res = await fetch(
    `${API_URL}/annonces/search?q=${encodeURIComponent(categorie)}&page=${page}`,
    { headers: { 'Accept': 'application/json' } }
  );
  return handleResponse(res);
};

// ─── Commandes ───────────────────────────────────────────────────────────────

export const getCommandes = async () => {
  const res = await fetch(`${API_URL}/commandes`, {
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

// ─── Messages ────────────────────────────────────────────────────────────────

export const getMessages = async () => {
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
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAdminUsers = async () => {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const getKycPending = async () => {
  const res = await fetch(`${API_URL}/admin/kyc/pending`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
};

export const decideKyc = async (id, decision) => {
  // decision: 'approved' | 'rejected'
  const res = await fetch(`${API_URL}/admin/kyc/${id}/decide`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ decision }),
  });
  return handleResponse(res);
};

// ─── Helpers image ───────────────────────────────────────────────────────────

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `http://localhost:8000/storage/${imagePath}`;
};

export default {
  loginUser,
  registerBuyer,
  registerSeller,
  logoutUser,
  getMe,
  getAnnonces,
  searchAnnonces,
  getAnnonceById,
  createAnnonce,
  updateAnnonce,
  deleteAnnonce,
  uploadAnnonceImages,
  getAnnoncesByCategorie,
  getCommandes,
  getCommandeById,
  createCommande,
  cancelCommande,
  getMessages,
  getConversation,
  sendMessage,
  getAdminUsers,
  getKycPending,
  decideKyc,
  getImageUrl,
};
