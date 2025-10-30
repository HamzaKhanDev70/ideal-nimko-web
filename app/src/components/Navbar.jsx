import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
export default function Navbar() {
  const { getTotalItems } = useCart();

  return (
    <nav className="bg-yellow-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              Ideal Nimko
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-white hover:text-yellow-200 transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-white hover:text-yellow-200 transition-colors"
            >
              About
            </Link>
            <Link 
              to="/products" 
              className="text-white hover:text-yellow-200 transition-colors"
            >
              Products
            </Link>
            <Link 
              to="/cart" 
              className="relative text-white hover:text-yellow-200 transition-colors"
            >
              Cart
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            <Link 
              to="/contact" 
              className="text-white hover:text-yellow-200 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
