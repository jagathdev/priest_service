import React from 'react';

const products = [
  { id: 1, name: 'Traditional Pooja Items', price: '?499', description: 'Authentic items for daily prayers.' },
  { id: 2, name: 'Aiswaryam TMT Steel Products', price: 'Contact for price', description: 'Premium construction materials.' },
  { id: 3, name: 'Spiritual Books', price: '?199', description: 'Readings for peace and wisdom.' }
];

const StorePage = () => {
  return (
    <div className="min-h-screen bg-violet-50 flex flex-col">
      {/* Header / Navbar */}
      <nav className="bg-white shadow-sm p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-violet-600">Sri Mandir Store</div>
        <a href="/dashboard" className="text-gray-700 hover:text-violet-600 font-semibold">
          Back to Home
        </a>
      </nav>

      {/* Hero Section */}
      <header className="bg-violet-700 text-white py-16 text-center">
        <h1 className="text-4xl font-bold">Welcome to Our Store</h1>
        <p className="mt-2 text-violet-100 text-lg">Authentic spiritual items and materials for your everyday needs.</p>
      </header>

      {/* Product Section */}
      <main className="flex-grow container mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold text-violet-900 mb-8">Our Products</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-violet-100 rounded-xl mb-6 flex items-center justify-center text-gray-500 font-medium">
                {product.name} Image Placeholder
              </div>
              <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
              <p className="text-gray-500 text-sm mt-2">{product.description}</p>
              <p className="text-violet-600 font-bold mt-4 text-lg">{product.price}</p>
              
              <button className="mt-6 w-full py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-[#5657e8] transition-all">
                View Details
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Sri Mandir. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default StorePage;
