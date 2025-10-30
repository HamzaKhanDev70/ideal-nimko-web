import React, { createContext, useContext, useReducer } from 'react';
const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      const product = action.payload;
      
      // Check if there's enough stock
      if (product.stock <= 0) {
        return state; // Don't add if out of stock
      }
      
      if (existingItem) {
        // Check if adding one more would exceed stock
        if (existingItem.quantity >= product.stock) {
          return state; // Don't add if would exceed stock
        }
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'UPDATE_STOCK':
      return {
        ...state,
        productStock: {
          ...state.productStock,
          [action.payload.productId]: action.payload.newStock
        }
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    productStock: {} // Track stock for each product
  });

  const getCurrentStock = (productId, originalStock) => {
    const stock = state.productStock[productId] !== undefined 
      ? state.productStock[productId] 
      : originalStock;
    
    // Ensure we return a valid number
    const numericStock = Number(stock);
    return isNaN(numericStock) ? 0 : numericStock;
  };

  const addToCart = (product) => {
    // Ensure we have valid product data
    if (!product || !product._id && !product.id) {
      console.error('Invalid product data:', product);
      return;
    }
    
    // Ensure stock is a valid number
    const originalStock = Number(product.stock);
    if (isNaN(originalStock)) {
      console.error('Invalid stock value:', product.stock);
      return;
    }
    
    // Check current stock before adding
    const currentStock = getCurrentStock(product._id || product.id, originalStock);
    if (currentStock <= 0) {
      return; // Don't add if out of stock
    }
    
    // Update stock tracking
    dispatch({ type: 'UPDATE_STOCK', payload: { productId: product._id || product.id, newStock: currentStock - 1 } });
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    // Find the item to get its quantity
    const item = state.items.find(item => item.id === productId);
    if (item) {
      // Restore stock when removing from cart
      const currentStock = getCurrentStock(productId, 0);
      dispatch({ type: 'UPDATE_STOCK', payload: { productId, newStock: currentStock + item.quantity } });
    }
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    const item = state.items.find(item => item.id === productId);
    if (!item) return;
    
    // Ensure quantity is valid
    if (quantity < 0) quantity = 0;
    
    // Get the original stock for this product
    const originalStock = item.stock || 0;
    const currentStock = getCurrentStock(productId, originalStock);
    
    // Calculate how much stock is currently reserved by this item
    const currentlyReserved = item.quantity;
    
    // Calculate how much stock would be needed for the new quantity
    const newReservation = quantity;
    
    // Calculate the difference
    const reservationDifference = newReservation - currentlyReserved;
    
    // Check if we have enough stock for the new quantity
    const availableStock = currentStock + currentlyReserved; // Available stock + what's currently reserved
    
    if (newReservation > availableStock) {
      // Don't allow quantity that exceeds available stock
      console.warn(`Cannot set quantity to ${quantity}, only ${availableStock} units available`);
      return;
    }
    
    // Update stock tracking
    const newStock = availableStock - newReservation;
    dispatch({ type: 'UPDATE_STOCK', payload: { productId, newStock } });
    
    // Update quantity
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
      getCurrentStock
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
