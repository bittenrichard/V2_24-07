import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './features/auth/context/AuthContext'; // <-- Importamos nosso provedor

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* --- Envelopamos o App com o AuthProvider --- */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);