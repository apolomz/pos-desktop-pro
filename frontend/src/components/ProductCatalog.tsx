import React, { useState } from 'react';
import type { Product } from '../types/Product';

interface Props {
  products: Product[];
  categories: string[];
  onSelectProduct: (product: Product) => void;
}

export const ProductCatalog: React.FC<Props> = ({ products, categories, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = selectedCategory === 'ALL' || p.category?.name === selectedCategory;
    
    return p.isActive && p.stock > 0 && matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-gray-50 rounded-lg">
      {/* HU-005: Buscador rápido */}
      <input
        type="text"
        placeholder="Buscar por nombre o descripción..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* HU-016: Filtro por categorías */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            selectedCategory === 'ALL' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
              selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* HU-006 & HU-015: Rejilla de productos e imagen */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-220px)]">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="flex flex-col border rounded-xl p-3 bg-white shadow-sm cursor-pointer hover:shadow-md hover:border-blue-400 transition"
          >
            <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">Sin imagen</span>
              )}
            </div>
            <h4 className="font-semibold text-sm line-clamp-1">{product.name}</h4>
            <p className="text-xs text-gray-500">Stock: {product.stock}</p>
            <span className="text-blue-600 font-bold mt-auto pt-2">${product.price.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};