// App.jsx
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import LostPetForm from './pages/LostPetForm';
import MessagesPage from './pages/MessagesPage';
import WalletPage from './pages/WalletPage';
import ConnectionTest from './pages/ConnectionTest';
import { BackendProvider } from './context/BackendContext'; // Import the provider

function App() {
  return (
    <BackendProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/petform" element={<LostPetForm />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/test" element={<ConnectionTest />} />
        </Routes>
      </BrowserRouter>
    </BackendProvider>
  );
}

export default App;