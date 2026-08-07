import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Petición: adjuntar Token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuesta: Limpieza y traducción amigable de errores HTTP
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'Ocurrió un error inesperado al procesar la solicitud.';

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      if (data && typeof data === 'object' && data.message) {
        friendlyMessage = data.message;
      } else {
        switch (status) {
          case 400:
            friendlyMessage = 'Los datos ingresados son incorrectos o la operación no está permitida.';
            break;
          case 401:
            friendlyMessage = 'Tu sesión ha expirado o las credenciales no son válidas.';
            break;
          case 403:
            friendlyMessage = 'No tienes permisos suficientes para realizar esta acción.';
            break;
          case 404:
            friendlyMessage = 'El recurso solicitado no fue encontrado.';
            break;
          case 409:
            friendlyMessage = 'Conflicto con los datos existentes en el sistema.';
            break;
          case 500:
            friendlyMessage = 'Ocurrió un error en el servidor. Por favor intenta de nuevo más tarde.';
            break;
          default:
            friendlyMessage = `Error de servidor (${status}). Por favor intenta nuevamente.`;
        }
      }
    } else if (error.request) {
      friendlyMessage = 'No se pudo establecer conexión con el servidor. Verifica tu red.';
    }

    error.friendlyMessage = friendlyMessage;
    return Promise.reject(error);
  }
);

export default api;