import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { queryClient } from './lib/queryClient.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <App />
            <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: 'rgba(10,15,26,0.96)',
                color: '#f0f4ff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'Satoshi, sans-serif',
                fontWeight: 600,
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                padding: '10px 16px',
              },
              success: { iconTheme: { primary: '#3dd68c', secondary: '#05080f' } },
              error:   { iconTheme: { primary: '#f7607a', secondary: '#05080f' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);