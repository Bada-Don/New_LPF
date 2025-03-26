import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import LostPetForm from './pages/LostPetForm';
import MessagesPage from './pages/MessagesPage';
import WalletPage from './pages/WalletPage';
import { New_LPF_backend } from "../../declarations/New_LPF_backend"; // Import backend


function App() {

  useEffect(() => {
    const testBackend = async () => {
      try {
        const response = await New_LPF_backend.getAllPetPosts();
        console.log("✅ Backend Response:", response);
      } catch (error) {
        console.error("❌ Backend Error:", error);
      }
    };

    testBackend();
  }, []);


  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true // Add this line
      }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/petform" element={<LostPetForm />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/wallet" element={<WalletPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


