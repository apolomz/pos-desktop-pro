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
    <div className="flex flex-col h-full gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar producto por nombre o descripción..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Categorías */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
            selectedCategory === 'ALL' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rejilla de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[calc(100vh-230px)] pr-1">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className="flex flex-col border border-slate-800 rounded-xl p-3 bg-slate-800/80 hover:bg-slate-800 hover:border-indigo-500/60 transition cursor-pointer group shadow-md"
          >
            <div className="w-full h-28 bg-slate-950 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-slate-800">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition" />
              ) : (
                <span className="text-slate-500 text-xs">Sin imagen</span>
              )}
            </div>
            <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">{product.name}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Stock: {product.stock}</p>
            <span className="text-indigo-400 font-extrabold text-base mt-2">${product.price.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};