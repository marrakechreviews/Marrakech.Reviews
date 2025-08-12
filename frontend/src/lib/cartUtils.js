const CART_STORAGE_KEY = 'cartItems';

export const getCart = () => {
  try {
    const serializedCartItems = localStorage.getItem(CART_STORAGE_KEY);
    if (serializedCartItems === null) {
      return [];
    }
    return JSON.parse(serializedCartItems);
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    return [];
  }
};

export const saveCart = (cartItems) => {
  try {
    const serializedCartItems = JSON.stringify(cartItems);
    localStorage.setItem(CART_STORAGE_KEY, serializedCartItems);
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

export const getCartTotal = () => {
  const cartItems = getCart();
  return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
};

export const getCartItemsCount = () => {
  const cartItems = getCart();
  return cartItems.reduce((count, item) => count + item.quantity, 0);
};

export const addToCart = (product, quantity = 1) => {
  let cartItems = getCart();
  const existingItemIndex = cartItems.findIndex(item => item.product._id === product._id);

  if (existingItemIndex > -1) {
    // Update quantity if item already exists
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cartItems.push({ product, quantity });
  }
  saveCart(cartItems);
  return cartItems;
};

export const removeFromCart = (productId) => {
  let cartItems = getCart();
  cartItems = cartItems.filter(item => item.product._id !== productId);
  saveCart(cartItems);
  return cartItems;
};

export const updateQuantity = (productId, quantity) => {
  let cartItems = getCart();
  const existingItemIndex = cartItems.findIndex(item => item.product._id === productId);

  if (existingItemIndex > -1) {
    if (quantity > 0) {
      cartItems[existingItemIndex].quantity = quantity;
    } else {
      // Remove item if quantity is 0 or less
      cartItems.splice(existingItemIndex, 1);
    }
  }
  saveCart(cartItems);
  return cartItems;
};

export const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
};


