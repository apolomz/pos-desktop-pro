import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  TrendingUp,
  AlertTriangle,
  Users,
  DollarSign,
  Key,
  RefreshCw,
  Trophy,
  Lightbulb,
  Crown,
} from 'lucide-react';
import { aiService, type AnalyticsSummary, type ChatResponse } from '../services/aiService';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  offlineMode?: boolean;
  timestamp: string;
}

export const AiAssistant: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: '¡Hola! Soy tu Asistente de Negocio inteligente. Puedo ayudarte a analizar tus ventas, revisar alertas de inventario o darte consejos de estrategia comercial.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadAnalytics = async () => {
    try {
      setLoadingMetrics(true);
      const data = await aiService.getAnalytics();
      setMetrics(data);
    } catch (error) {
      console.error('Error al cargar analítica de IA:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || sending) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setSending(true);

    try {
      const res: ChatResponse = await aiService.sendChatMessage(textToSend);
      const botMsg: Message = {
        sender: 'bot',
        text: res.reply,
        offlineMode: res.offlineMode,
        timestamp: new Date(res.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '⚠️ Ocurrió un error al conectar con el servicio. Verifica tu conexión o intenta nuevamente.',
          offlineMode: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setShowApiKeyModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header & API Key Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Asistente Virtual & Analítica IA</h1>
            <p className="text-sm text-slate-400">
              Diagnóstico comercial en tiempo real y consultas inteligentes.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowApiKeyModal(true)}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 transition"
        >
          <Key className="w-4 h-4 text-amber-400" />
          {apiKey ? 'API Key Configurada' : 'Configurar Gemini API Key'}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Ingresos Totales</p>
            <p className="text-lg font-bold">
              {loadingMetrics ? '...' : `$${metrics?.totalRevenue ?? 0}`}
            </p>
          </div>
        </div>

        {/* Transacciones */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Transacciones</p>
            <p className="text-lg font-bold">
              {loadingMetrics ? '...' : metrics?.totalSalesCount ?? 0}
            </p>
          </div>
        </div>

        {/* Stock Bajo */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Stock Bajo (≤ 5)</p>
            <p className="text-lg font-bold text-rose-400">
              {loadingMetrics ? '...' : metrics?.lowStockCount ?? 0} items
            </p>
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Clientes Registrados</p>
            <p className="text-lg font-bold">
              {loadingMetrics ? '...' : metrics?.totalCustomers ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Chat & Insights Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Container */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[560px] overflow-hidden shadow-xl">
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                  <div
                    className={`mt-2 flex items-center justify-between gap-2 text-[10px] ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.offlineMode && (
                      <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                        Modo Local
                      </span>
                    )}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" />
                  Analizando métricas del negocio...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 flex-shrink-0 font-medium">Sugerencias:</span>
            <button
              onClick={() => handleSend('¿Cómo van las ventas del negocio?')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1 rounded-full whitespace-nowrap transition"
            >
              📊 ¿Cómo van las ventas?
            </button>
            <button
              onClick={() => handleSend('¿Qué productos tienen bajo stock?')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1 rounded-full whitespace-nowrap transition"
            >
              ⚠️ Productos con bajo stock
            </button>
            <button
              onClick={() => handleSend('¿Cuáles son los productos más vendidos?')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1 rounded-full whitespace-nowrap transition"
            >
              🏆 Productos más vendidos
            </button>
            <button
              onClick={() => handleSend('¿Quiénes son mis clientes frecuentes?')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1 rounded-full whitespace-nowrap transition"
            >
              👥 Clientes frecuentes
            </button>
            <button
              onClick={() => handleSend('¿Qué recomendaciones tienes para mi negocio?')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1 rounded-full whitespace-nowrap transition"
            >
              💡 Recomendaciones
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Escribe tu consulta o pide un diagnóstico..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-xl transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Panel de Insights de IA */}
        <div className="lg:col-span-1 space-y-6 max-h-[560px] overflow-y-auto scrollbar-none pr-1">
          {/* Tarjeta de Recomendaciones */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Lightbulb className="w-5 h-5 animate-pulse" />
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-200">Recomendaciones IA</h2>
            </div>
            <div className="space-y-3">
              {loadingMetrics ? (
                <div className="space-y-2">
                  <div className="h-10 bg-slate-800/50 rounded-xl animate-pulse" />
                  <div className="h-10 bg-slate-800/50 rounded-xl animate-pulse" />
                </div>
              ) : metrics?.recommendations && metrics.recommendations.length > 0 ? (
                metrics.recommendations.map((rec, i) => (
                  <div key={i} className="bg-slate-950/60 border border-slate-800/50 p-3.5 rounded-xl text-xs leading-relaxed text-slate-300 hover:border-indigo-500/30 transition duration-300">
                    {rec}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No hay sugerencias disponibles en este momento.</p>
              )}
            </div>
          </div>

          {/* Tarjeta de Productos Más Vendidos */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Trophy className="w-5 h-5" />
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-200">Productos Más Vendidos</h2>
            </div>
            <div className="space-y-2.5">
              {loadingMetrics ? (
                <div className="space-y-2">
                  <div className="h-8 bg-slate-800/50 rounded-xl animate-pulse" />
                  <div className="h-8 bg-slate-800/50 rounded-xl animate-pulse" />
                </div>
              ) : metrics?.topProducts && metrics.topProducts.length > 0 ? (
                metrics.topProducts.map((prod, i) => (
                  <div key={prod.id} className="flex items-center justify-between p-2.5 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 rounded-xl transition duration-300">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-200 truncate">{prod.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{prod.category}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-300">{prod.quantitySold} u.</p>
                      <p className="text-[10px] text-emerald-400 font-medium">${prod.revenue}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No hay registros de ventas suficientes.</p>
              )}
            </div>
          </div>

          {/* Tarjeta de Clientes Frecuentes */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Crown className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-200">Clientes Frecuentes</h2>
            </div>
            <div className="space-y-2.5">
              {loadingMetrics ? (
                <div className="space-y-2">
                  <div className="h-8 bg-slate-800/50 rounded-xl animate-pulse" />
                  <div className="h-8 bg-slate-800/50 rounded-xl animate-pulse" />
                </div>
              ) : metrics?.frequentCustomers && metrics.frequentCustomers.length > 0 ? (
                metrics.frequentCustomers.map((cust, i) => (
                  <div key={cust.id} className="flex items-center justify-between p-2.5 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-800/60 rounded-xl transition duration-300">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-200 truncate">{cust.name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-300">{cust.salesCount} compras</p>
                      <p className="text-[10px] text-indigo-400 font-medium">Total: ${cust.totalSpent}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No hay clientes con compras registradas.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal API Key */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold">Google Gemini API Key</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Configura tu propia clave de Google Gemini para habilitar el motor de lenguaje natural. Si no la ingresas, el asistente funcionará en Modo Local con las métricas internas de la app.
            </p>

            <div>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs text-indigo-400 hover:underline"
              >
                Obtener API Key gratis en Google AI Studio ↗
              </a>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={saveApiKey}
                className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white"
              >
                Guardar Clave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;