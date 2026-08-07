import React, { useEffect, useState } from 'react';
import {
  Store,
  Users,
  DollarSign,
  Receipt,
  Database,
  Upload,
  Download,
  Plus,
  Power,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  UserCheck,
  Shield,
  Loader2,
  Lock,
  Unlock,
} from 'lucide-react';
import { configService, type BusinessConfig } from '../services/configService';
import { userService, type UserResponse } from '../services/userService';
import { cashShiftService, type CashShift } from '../services/cashShiftService';
import { expenseService, type Expense } from '../services/expenseService';
import { backupService } from '../services/backupService';
import { formatExpenseCategory, formatRole, formatShiftStatus, formatCurrency } from '../utils/formatters';

export const SettingsDashboard: React.FC = () => {
  const userRole = (localStorage.getItem('role') || '').toUpperCase();
  const isCashier = userRole.includes('CASHIER');

  const [activeTab, setActiveTab] = useState<'business' | 'users' | 'shifts' | 'expenses' | 'backup'>(
    isCashier ? 'shifts' : 'business'
  );
  
  // States: Business Config
  const [config, setConfig] = useState<BusinessConfig>({
    name: '',
    nit: '',
    address: '',
    phone: '',
    email: '',
    taxPercentage: 19,
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // States: Users
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userFullName, setUserFullName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRoleId, setUserRoleId] = useState<number>(2); // 2: CASHIER, 1: ADMIN
  const [savingUser, setSavingUser] = useState(false);

  // States: Cash Shift
  const [activeShift, setActiveShift] = useState<CashShift | null>(null);
  const [shiftsHistory, setShiftsHistory] = useState<CashShift[]>([]);
  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [closeShiftModal, setCloseShiftModal] = useState(false);
  const [initialBaseInput, setInitialBaseInput] = useState<number>(50000);
  const [actualFinalAmountInput, setActualFinalAmountInput] = useState<number>(0);
  const [shiftNotesInput, setShiftNotesInput] = useState('');
  const [shiftLoading, setShiftLoading] = useState(false);

  // States: Expenses
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseCategory, setExpenseCategory] = useState<'PAYROLL' | 'RAW_MATERIAL' | 'OTHER'>('PAYROLL');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [savingExpense, setSavingExpense] = useState(false);

  // States: Backup
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importingBackup, setImportingBackup] = useState(false);

  // Initial Data Load
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [confData, usersData, currentShift, historyShifts, currentExpenses] = await Promise.all([
        configService.getConfig(),
        userService.getAll().catch(() => []),
        cashShiftService.getActiveShift().catch(() => null),
        cashShiftService.getAllShifts().catch(() => []),
        expenseService.getCurrentExpenses().catch(() => []),
      ]);

      if (confData) {
        setConfig(confData);
        if (confData.logoUrl) setLogoPreview(confData.logoUrl);
      }
      setUsers(usersData);
      setActiveShift(currentShift);
      setShiftsHistory(historyShifts);
      setExpenses(currentExpenses);
    } catch (error) {
      console.error('Error al cargar datos de configuración:', error);
    }
  };

  // Handler: Save Business Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const updated = await configService.updateConfig(config);
      setConfig(updated);
      alert('Configuración del negocio guardada exitosamente.');
    } catch (err) {
      alert('Error al guardar la configuración del negocio.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Handler: Upload Logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const logoUrl = await configService.uploadLogo(file);
      setLogoPreview(logoUrl);
      setConfig((prev) => ({ ...prev, logoUrl }));
    } catch (err) {
      alert('Error al subir la imagen del logo.');
    }
  };

  // Handler: Create User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      await userService.create({
        fullName: userFullName,
        username: userUsername,
        password: userPassword,
        roleId: userRoleId,
      });
      setUserModalOpen(false);
      setUserFullName('');
      setUserUsername('');
      setUserPassword('');
      const updatedUsers = await userService.getAll();
      setUsers(updatedUsers);
    } catch (err) {
      alert('Error al crear usuario.');
    } finally {
      setSavingUser(false);
    }
  };

  // Handler: Toggle User Status
  const handleToggleUserStatus = async (id: number) => {
    try {
      await userService.toggleStatus(id);
      const updatedUsers = await userService.getAll();
      setUsers(updatedUsers);
    } catch (err) {
      alert('Error al cambiar estado del usuario.');
    }
  };

  // Handler: Open Shift
  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    setShiftLoading(true);
    try {
      const shift = await cashShiftService.openShift(initialBaseInput);
      setActiveShift(shift);
      setOpenShiftModal(false);
      const history = await cashShiftService.getAllShifts();
      setShiftsHistory(history);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al abrir el turno de caja.');
    } finally {
      setShiftLoading(false);
    }
  };

  // Handler: Close Shift
  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    setShiftLoading(true);
    try {
      await cashShiftService.closeShift(activeShift.id, actualFinalAmountInput, shiftNotesInput);
      setActiveShift(null);
      setCloseShiftModal(false);
      const history = await cashShiftService.getAllShifts();
      setShiftsHistory(history);
      alert('Turno de caja cerrado exitosamente.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al cerrar turno de caja.');
    } finally {
      setShiftLoading(false);
    }
  };

  // Handler: Register Expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseAmount || expenseAmount <= 0 || !expenseDescription) return;
    setSavingExpense(true);
    try {
      await expenseService.createExpense({
        category: expenseCategory,
        amount: Number(expenseAmount),
        description: expenseDescription,
      });
      setExpenseAmount('');
      setExpenseDescription('');
      const updatedExpenses = await expenseService.getCurrentExpenses();
      setExpenses(updatedExpenses);
      const currentShift = await cashShiftService.getActiveShift();
      setActiveShift(currentShift);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al registrar el egreso.');
    } finally {
      setSavingExpense(false);
    }
  };

  // Handler: Export Backup
  const handleExportBackup = async () => {
    try {
      await backupService.exportBackup();
    } catch (err) {
      alert('Error al exportar la copia de seguridad.');
    }
  };

  // Handler: Import Backup JSON File
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingBackup(true);
    setBackupMessage(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await backupService.importBackup(json);
        setBackupMessage({ type: 'success', text: res.message || 'Restauración completada correctamente.' });
        loadAllData();
      } catch (err: any) {
        setBackupMessage({ type: 'error', text: 'El archivo JSON de restauración no tiene un formato válido.' });
      } finally {
        setImportingBackup(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-8 max-w-7xl mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Store className="w-7 h-7 text-indigo-400" />
            <span>Configuración y Control Operativo</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Gestión de marca, usuarios, arqueo de caja, egresos de nómina e insumos y copias de seguridad
          </p>
        </div>

        {/* Badge Estado de Caja */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 px-4 rounded-xl shrink-0">
          <div className={`w-3 h-3 rounded-full ${activeShift ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          <span className="text-xs font-semibold text-slate-300">
            {activeShift ? `Caja Abierta (Base: $${activeShift.initialBase.toLocaleString('es-CO')})` : 'Caja Cerrada'}
          </span>
        </div>
      </div>

      {/* Navegación por Pestañas (Tabs) */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'business', label: 'Negocio e Impuestos', icon: Store, adminOnly: true },
          { id: 'users', label: 'Usuarios y Cajeros', icon: Users, adminOnly: true },
          { id: 'shifts', label: 'Turnos de Caja', icon: DollarSign, adminOnly: false },
          { id: 'expenses', label: 'Nómina y Egresos', icon: Receipt, adminOnly: false },
          { id: 'backup', label: 'Copias de Seguridad', icon: Database, adminOnly: true },
        ]
          .filter((tab) => !isCashier || !tab.adminOnly)
          .map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
      </div>

      {/* PESTAÑA 1: Negocio e Impuestos */}
      {activeTab === 'business' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Datos de la Empresa y Tributación</h2>
            <p className="text-xs text-slate-400">Información visible en facturas y recibos generados por el sistema</p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-6 max-w-3xl">
            {/* Carga del Logo */}
            <div className="flex items-center gap-6 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex items-center justify-center relative group">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-8 h-8 text-slate-600" />
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Logo Comercial</label>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl text-xs font-semibold cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>Subir Nuevo Logo</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="Ej: Tienda Pro"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">NIT / RUT / RUC</label>
                <input
                  type="text"
                  value={config.nit}
                  onChange={(e) => setConfig({ ...config, nit: e.target.value })}
                  placeholder="Ej: 900.123.456-7"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Dirección Física</label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  placeholder="Ej: Av. Principal 123"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={config.phone}
                  onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                  placeholder="Ej: 300 123 4567"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={config.email}
                  onChange={(e) => setConfig({ ...config, email: e.target.value })}
                  placeholder="contacto@empresa.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Porcentaje de IVA / Impuesto (%)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={config.taxPercentage}
                  onChange={(e) => setConfig({ ...config, taxPercentage: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios de Configuración'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PESTAÑA 2: Usuarios y Roles */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Gestión de Usuarios y Personal</h2>
              <p className="text-xs text-slate-400">Control de acceso y creación de cuentas de cajeros y administradores</p>
            </div>
            <button
              onClick={() => setUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Usuario</th>
                  <th className="py-3.5 px-6">Nombre Completo</th>
                  <th className="py-3.5 px-6">Rol</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className={`hover:bg-slate-800/40 transition-colors ${u.isActive === false ? 'opacity-50' : ''}`}>
                    <td className="py-4 px-6 font-semibold text-white font-mono">{u.username}</td>
                    <td className="py-4 px-6">{u.fullName}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        u.role?.toUpperCase().includes('ADMIN')
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {formatRole(u.role)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        u.isActive !== false ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {u.isActive !== false ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id)}
                        className="p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-amber-500/10 transition-all cursor-pointer"
                        title={u.isActive !== false ? 'Desactivar Usuario' : 'Activar Usuario'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: Turnos de Caja (Cash Shifts) */}
      {activeTab === 'shifts' && (
        <div className="space-y-6">
          {/* Panel de Arqueo Activo */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>Estado Actual de Caja</span>
                </h2>
                <p className="text-xs text-slate-400">Control de aperturas, ventas en efectivo, egresos y cierre de turno</p>
              </div>

              {activeShift ? (
                <button
                  onClick={() => setCloseShiftModal(true)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Cerrar Turno y Realizar Arqueo</span>
                </button>
              ) : (
                <button
                  onClick={() => setOpenShiftModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Abrir Turno de Caja</span>
                </button>
              )}
            </div>

            {activeShift ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Base Inicial</span>
                  <p className="text-2xl font-bold text-white mt-1 font-mono">${activeShift.initialBase.toLocaleString('es-CO')}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Ventas Efectivo</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">${activeShift.cashSalesTotal.toLocaleString('es-CO')}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Egresos Totales</span>
                  <p className="text-2xl font-bold text-rose-400 mt-1 font-mono">${activeShift.totalExpenses.toLocaleString('es-CO')}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Efectivo Esperado</span>
                  <p className="text-2xl font-bold text-indigo-400 mt-1 font-mono">${activeShift.expectedFinalAmount.toLocaleString('es-CO')}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">No hay ningún turno de caja abierto actualmente.</p>
                <p className="text-xs text-slate-400">Abre caja ingresando la base inicial para habilitar las ventas en el punto de venta.</p>
              </div>
            )}
          </div>

          {/* Historial de Turnos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 font-bold text-white text-sm">Historial de Turnos y Arqueos</div>
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-6">Cajero</th>
                  <th className="py-3 px-6">Apertura</th>
                  <th className="py-3 px-6">Cierre</th>
                  <th className="py-3 px-6">Base</th>
                  <th className="py-3 px-6">Esperado</th>
                  <th className="py-3 px-6">Reportado</th>
                  <th className="py-3 px-6">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {shiftsHistory.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40">
                    <td className="py-3.5 px-6 font-mono text-indigo-400">#{s.id}</td>
                    <td className="py-3.5 px-6">{s.userFullName || s.username}</td>
                    <td className="py-3.5 px-6 text-xs text-slate-400">{new Date(s.openedAt).toLocaleString('es-CO')}</td>
                    <td className="py-3.5 px-6 text-xs text-slate-400">{s.closedAt ? new Date(s.closedAt).toLocaleString('es-CO') : 'OPEN'}</td>
                    <td className="py-3.5 px-6 font-mono">${s.initialBase.toLocaleString('es-CO')}</td>
                    <td className="py-3.5 px-6 font-mono text-indigo-300">${s.expectedFinalAmount?.toLocaleString('es-CO')}</td>
                    <td className="py-3.5 px-6 font-mono text-emerald-400">${s.actualFinalAmount ? s.actualFinalAmount.toLocaleString('es-CO') : '-'}</td>
                    <td className={`py-3.5 px-6 font-mono font-bold ${s.difference < 0 ? 'text-rose-400' : s.difference > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      ${s.difference ? s.difference.toLocaleString('es-CO') : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: Nómina y Egresos */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario para registrar egreso */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-rose-400" />
              <span>Registrar Egreso de Caja</span>
            </h2>
            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Categoría del Gasto</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PAYROLL">Nómina / Adelanto de Empleado</option>
                  <option value="RAW_MATERIAL">Compra de Materia Prima / Insumos</option>
                  <option value="OTHER">Otro Gasto Operativo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Monto ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="50000"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Descripción / Justificación</label>
                <textarea
                  required
                  rows={3}
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="Ej: Pago de turno a Juan / Compra de 10kg café..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingExpense || !activeShift}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {savingExpense ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Registrar Egreso'}
              </button>
            </form>
          </div>

          {/* Historial de Egresos del Turno */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 font-bold text-white text-sm">
              Egresos Registrados en el Turno Activo
            </div>
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-6">Categoría</th>
                  <th className="py-3 px-6">Descripción</th>
                  <th className="py-3 px-6">Registrado Por</th>
                  <th className="py-3 px-6 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-500 text-xs">No se han registrado egresos en este turno.</td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-xs font-semibold">
                          {formatExpenseCategory(exp.category)}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">{exp.description}</td>
                      <td className="py-3.5 px-6 text-xs text-slate-400">{exp.registeredBy}</td>
                      <td className="py-3.5 px-6 text-right font-mono text-rose-400 font-bold">${exp.amount.toLocaleString('es-CO')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 5: Copias de Seguridad */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Respaldo y Restauración de Base de Datos</span>
            </h2>
            <p className="text-xs text-slate-400">Exporta la información a un archivo de formato JSON o restaura la base de datos de manera segura</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exportar */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
              <Download className="w-8 h-8 text-indigo-400" />
              <div>
                <h3 className="font-bold text-white text-sm">Exportar Copia de Seguridad</h3>
                <p className="text-xs text-slate-400 mt-1">Descarga copias de seguridad en formato JSON (sistema) o CSV (abrible en Excel / Sheets).</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleExportBackup}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Backup JSON</span>
                </button>
                <button
                  onClick={async () => {
                    try {
                      await backupService.exportCsvBackup();
                    } catch (e) {
                      alert('Error al descargar reporte CSV.');
                    }
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Descargar Reporte CSV (Excel)</span>
                </button>
              </div>
            </div>

            {/* Importar */}
            <div className="p-5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-4">
              <Upload className="w-8 h-8 text-emerald-400" />
              <div>
                <h3 className="font-bold text-white text-sm">Restaurar Copia de Seguridad</h3>
                <p className="text-xs text-slate-400 mt-1">Selecciona un archivo JSON generado previamente para importar la información.</p>
              </div>
              <label className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2">
                {importingBackup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Cargar Archivo JSON</span>
                <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
              </label>
            </div>
          </div>

          {backupMessage && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
              backupMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{backupMessage.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Modal: Crear Usuario */}
      {userModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Crear Nuevo Usuario / Cajero</h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={userFullName}
                  onChange={(e) => setUserFullName(e.target.value)}
                  placeholder="Ej: Carlos Mendoza"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nombre de Usuario (Login)</label>
                <input
                  type="text"
                  required
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  placeholder="ej: carlos.cajero"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Rol</label>
                <select
                  value={userRoleId}
                  onChange={(e) => setUserRoleId(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={2}>CAJERO (ROLE_CASHIER)</option>
                  <option value={1}>ADMINISTRADOR (ROLE_ADMIN)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {savingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Abrir Turno */}
      {openShiftModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-400" />
              <span>Apertura de Caja</span>
            </h3>
            <form onSubmit={handleOpenShift} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Monto Base Inicial ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={initialBaseInput}
                  onChange={(e) => setInitialBaseInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenShiftModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={shiftLoading}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {shiftLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Abrir Caja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cerrar Turno / Arqueo */}
      {closeShiftModal && activeShift && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              <span>Arqueo y Cierre de Caja</span>
            </h3>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs text-slate-300">
              <div className="flex justify-between"><span>Base Inicial:</span><span className="font-mono">${activeShift.initialBase.toLocaleString('es-CO')}</span></div>
              <div className="flex justify-between"><span>+ Ventas Efectivo:</span><span className="font-mono text-emerald-400">+${activeShift.cashSalesTotal.toLocaleString('es-CO')}</span></div>
              <div className="flex justify-between"><span>- Egresos Registrados:</span><span className="font-mono text-rose-400">-${activeShift.totalExpenses.toLocaleString('es-CO')}</span></div>
              <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-sm text-indigo-300">
                <span>Efectivo Esperado:</span>
                <span className="font-mono">${activeShift.expectedFinalAmount.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <form onSubmit={handleCloseShift} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Conteo Real en Caja ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={actualFinalAmountInput}
                  onChange={(e) => setActualFinalAmountInput(Number(e.target.value))}
                  placeholder="Ingrese monto exacto contado"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Notas / Observaciones</label>
                <textarea
                  rows={2}
                  value={shiftNotesInput}
                  onChange={(e) => setShiftNotesInput(e.target.value)}
                  placeholder="Observaciones sobre sobrantes o faltantes..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCloseShiftModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 text-sm font-medium rounded-xl hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={shiftLoading}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {shiftLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Cierre de Caja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
