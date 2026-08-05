import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Package, Power, AlertTriangle, Loader2 } from 'lucide-react';
import type { Product, ProductRequest } from '../types/Product';
import type { Category } from '../types/category';
import { productService } from '../api/productService';
import { categoryService } from '../api/categoryService';

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>(5);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        productService.getProducts(search),
        categoryService.getAll()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 300); // Debounce para búsqueda
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price);
      setStock(product.stock);
      setMinStock(product.minStock);
      setCategoryId(product.category.id);
      setImageUrl(product.imageUrl || '');
    } else {
      setEditingProduct(null);
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setMinStock(5);
      setCategoryId(categories[0]?.id || '');
      setImageUrl('');
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || price === '' || stock === '' || minStock === '') return;

    setSaving(true);
    const req: ProductRequest = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      minStock: Number(minStock),
      categoryId: Number(categoryId),
      imageUrl
    };

    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, req);
      } else {
        await productService.create(req);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error al guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await productService.toggleStatus(id);
      fetchData();
    } catch (err) {
      alert('Error al cambiar el estado del producto.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      try {
        await productService.delete(id);
        fetchData();
      } catch (err) {
        alert('Error al eliminar producto.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            <span>Catálogo de Productos</span>
          </h2>
          <p className="text-slate-400 text-xs">Administra tu inventario y precios de venta</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Buscador (HU-028) */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto por nombre..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Tabla de Productos */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No se encontraron productos.
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Producto</th>
                <th className="py-3.5 px-6">Categoría</th>
                <th className="py-3.5 px-6">Precio</th>
                <th className="py-3.5 px-6">Stock</th>
                <th className="py-3.5 px-6">Estado</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((prod) => {
                const isLowStock = prod.stock <= prod.minStock;
                return (
                  <tr key={prod.id} className={`hover:bg-slate-800/30 transition-colors ${!prod.isActive ? 'opacity-50' : ''}`}>
                    <td className="py-4 px-6 font-semibold text-white">
                      <div>{prod.name}</div>
                      {prod.description && <span className="text-xs text-slate-500 font-normal">{prod.description}</span>}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700/60 text-slate-300 rounded-lg text-xs font-medium">
                        {prod.category?.name || 'Sin Categoría'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-indigo-300 font-bold">
                      ${Number(prod.price).toLocaleString('es-CO')}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono font-semibold ${isLowStock ? 'text-amber-400' : 'text-slate-300'}`}>
                          {prod.stock}
                        </span>
                        {isLowStock && (
                          <span title="Stock bajo el mínimo">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                        </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        prod.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {prod.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1">
                      <button
                        onClick={() => handleToggleStatus(prod.id)}
                        title={prod.isActive ? "Desactivar" : "Activar"}
                        className="p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-amber-500/10 transition-all"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(prod)}
                        className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear/Editar (HU-025, HU-026) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Empanada de Carne, Gaseosa..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Precio ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="3500"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Categoría</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="" disabled>Selecciona...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="50"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="5"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};