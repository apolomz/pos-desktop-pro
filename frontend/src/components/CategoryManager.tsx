import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tags, Loader2 } from 'lucide-react';
import type{ Category, CategoryRequest } from '../types/category';
import { categoryService } from '../services/categoryService';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setDescription(category.description || '');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const req: CategoryRequest = { name, description };

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, req);
      } else {
        await categoryService.create(req);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      alert('Error al guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta categoría?')) {
      try {
        await categoryService.delete(id);
        loadCategories();
      } catch (err) {
        alert('No se puede eliminar la categoría si tiene productos vinculados.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header del módulo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tags className="w-6 h-6 text-indigo-400" />
            <span>Gestión de Categorías</span>
          </h2>
          <p className="text-slate-400 text-xs">Organiza los productos de tu punto de venta</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Tabla de Categorías (HU-020) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No hay categorías registradas. ¡Crea la primera!
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Nombre</th>
                <th className="py-3.5 px-6">Descripción</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 text-slate-500 font-mono text-xs">#{cat.id}</td>
                  <td className="py-4 px-6 font-semibold text-white">{cat.name}</td>
                  <td className="py-4 px-6 text-slate-400 text-xs">{cat.description || 'Sin descripción'}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className="p-2 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-indigo-500/10 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Crear / Editar (HU-017, HU-018) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Bebidas, Snack..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
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
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};