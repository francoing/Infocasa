import React from 'react';
import AppRouter from './router/AppRouter';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
