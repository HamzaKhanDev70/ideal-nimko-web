import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart, getCurrentStock } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some delicious snacks to get started!</p>
            <Link 
              to="/products"
              className="bg-yellow-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-600 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {items.map((item) => {
            const currentStock = getCurrentStock(item.id, item.stock || 0);
            const isLowStock = currentStock < 5;
            const isOutOfStock = currentStock <= 0;
            const canIncrease = item.quantity < currentStock;
            
            return (
              <div 
                key={item.id} 
                className={`flex items-center p-6 border-b border-gray-200 ${
                  isLowStock ? 'bg-red-50 border-red-200' : ''
                } ${isOutOfStock ? 'bg-gray-50 opacity-75' : ''}`}
              >
                <img 
                  src={item.imageURL} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1 ml-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    {isLowStock && !isOutOfStock && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Low Stock
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-1">PKR {item.price}</p>
                  <div className={`text-sm font-medium ${
                    isOutOfStock 
                      ? 'text-red-600' 
                      : isLowStock 
                        ? 'text-red-500' 
                        : 'text-gray-500'
                  }`}>
                    Available Stock: {currentStock} units
                    {isLowStock && !isOutOfStock && (
                      <span className="ml-2 text-red-600">⚠️</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        item.quantity <= 1 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={!canIncrease}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        !canIncrease 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      title={!canIncrease ? 'Cannot exceed available stock' : 'Increase quantity'}
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      PKR {item.price * item.quantity}
                    </p>
                    {!canIncrease && currentStock > 0 && (
                      <p className="text-xs text-red-500 mt-1">
                        Max: {currentStock}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stock Warnings */}
        {items.some(item => {
          const currentStock = getCurrentStock(item.id, item.stock || 0);
          return currentStock < 5;
        }) && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Low Stock Alert
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Some items in your cart have limited stock. Consider completing your purchase soon to avoid disappointment.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900">
              Total Items: {getTotalItems()}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              PKR {getTotalPrice()}
            </span>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={clearCart}
              className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Cart
            </button>
            <Link
              to="/checkout"
              className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-lg text-center hover:bg-yellow-600 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
