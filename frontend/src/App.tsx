import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(null);

  // Al cargar la app, revisamos si ya había una sesión guardada
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Si no hay token, mostramos la pantalla de Login
  if (!token) {
    return <Login onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  // Si hay token, mostramos el sistema protegido
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>POS Desktop Pro — Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </header>
      <hr />
      <p>¡Bienvenido al sistema! Tu backend respondió y estás autenticado con JWT.</p>
    </div>
  );
}

export default App;