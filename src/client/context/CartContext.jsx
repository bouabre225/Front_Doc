import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('docspace_cart') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('docspace_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart_updated'));
  }, [cart]);

  const addToCart = (annonce, quantite = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === annonce.id);
      if (exists) {
        return prev.map(i =>
          i.id === annonce.id
            ? { ...i, quantite: Math.min(i.quantite + quantite, annonce.quantite) }
            : i
        );
      }
      return [...prev, {
        id:           annonce.id,
        titre:        annonce.titre,
        prix_vendeur: annonce.prix_vendeur,
        image_url:    annonce.images?.[0]?.image_url || null,
        vendeur:      annonce.vendeur?.nom || 'Vendeur',
        vendeur_id:   annonce.vendeur_id,
        stock:        annonce.quantite,
        quantite,
      }];
    });
  };

  const removeFromCart   = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantite   = (id, q) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantite: Math.max(1, Math.min(q, i.stock)) } : i));
  const clearCart        = () => setCart([]);
  const isInCart         = (id) => cart.some(i => i.id === id);
  const totalItems       = cart.reduce((s, i) => s + i.quantite, 0);
  const totalPrice       = cart.reduce((s, i) => s + Number(i.prix_vendeur) * i.quantite, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantite, clearCart, isInCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);