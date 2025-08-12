import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartUtils } from '../lib/api';

const CartContext = createContext();

const initialState = {
  items: [],
  total: 0,
  itemsCount: 0,
  isLoading: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemsCount: action.payload.itemsCount,
      };
    case 'ADD_TO_CART':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemsCount: action.payload.itemsCount,
      };
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemsCount: action.payload.itemsCount,
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        itemsCount: action.payload.itemsCount,
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemsCount: 0,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const items = cartUtils.getCart();
    const total = cartUtils.getCartTotal();
    const itemsCount = cartUtils.getCartItemsCount();
    
    dispatch({
      type: 'LOAD_CART',
      payload: { items, total, itemsCount },
    });
  }, []);

  const addToCart = (product, quantity = 1) => {
    const updatedItems = cartUtils.addToCart(product, quantity);
    const total = cartUtils.getCartTotal();
    const itemsCount = cartUtils.getCartItemsCount();
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: { items: updatedItems, total, itemsCount },
    });
  };

  const removeFromCart = (productId) => {
    const updatedItems = cartUtils.removeFromCart(productId);
    const total = cartUtils.getCartTotal();
    const itemsCount = cartUtils.getCartItemsCount();
    
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: { items: updatedItems, total, itemsCount },
    });
  };

  const updateQuantity = (productId, quantity) => {
    const updatedItems = cartUtils.updateQuantity(productId, quantity);
    const total = cartUtils.getCartTotal();
    const itemsCount = cartUtils.getCartItemsCount();
    
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { items: updatedItems, total, itemsCount },
    });
  };

  const clearCart = () => {
    cartUtils.clearCart();
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

