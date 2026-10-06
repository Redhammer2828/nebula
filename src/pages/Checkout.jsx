import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

// Placeholder: original file was missing from the Base44 export.
export default function Checkout() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl glass flex items-center justify-center">
        <ShoppingBag className="w-6 h-6 text-primary" />
      </div>
      <h1 className="text-3xl font-bold font-heading mb-3">Checkout</h1>
      <p className="text-sm text-muted-foreground mb-8">Checkout is not available in this local build.</p>
      <Link to="/cart" className="btn-cosmic inline-flex px-6 py-3 rounded-xl font-semibold text-sm">
        Back to cart
      </Link>
    </div>
  );
}
