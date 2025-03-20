import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBackendActor } from '../utils/actor';

// Create context
const BackendContext = createContext();

// Provider component
export const BackendProvider = ({ children }) => {
  const [actor, setActor] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // Initialize actor
  useEffect(() => {
    const initActor = async () => {
      try {
        console.log("Initializing backend actor...");
        const backendActor = await getBackendActor();
        setActor(backendActor);
        setConnectionStatus('connected');
        setIsLoading(false);
        console.log("Backend actor initialized successfully");
      } catch (err) {
        console.error("Failed to initialize actor:", err);
        setError("Failed to connect to the backend service. Please check your connection or try again later.");
        setConnectionStatus('failed');
        setIsLoading(false);
      }
    };

    initActor();
  }, []);

  // Try to get user data when actor is ready
  useEffect(() => {
    const fetchUser = async () => {
      if (!actor) return;
      
      try {
        console.log("Fetching user data...");
        const result = await actor.getUser();
        console.log("User result:", result);
        if (result && 'ok' in result) {
          setUser(result.ok);
          console.log("User data fetched successfully");
        } else {
          console.log("No user found or not logged in");
          setUser(null);
        }
      } catch (err) {
        console.error("Failed to get user:", err);
        setUser(null);
      }
    };

    if (actor && connectionStatus === 'connected') {
      fetchUser();
    }
  }, [actor, connectionStatus]);

  // Context value
  const contextValue = {
    actor,
    user,
    isLoading,
    error,
    connectionStatus,
    isAuthenticated: !!user,
    refreshUser: async () => {
      if (!actor) return;
      
      try {
        const result = await actor.getUser();
        if (result && 'ok' in result) {
          setUser(result.ok);
        }
      } catch (err) {
        console.error("Failed to refresh user:", err);
      }
    }
  };

  // Loading component
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '20px' }}>Connecting to backend...</div>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 2s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error component
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          padding: '20px',
          borderRadius: '5px',
          marginBottom: '20px',
          maxWidth: '500px'
        }}>
          <h3 style={{ marginTop: 0 }}>Connection Error</h3>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <BackendContext.Provider value={contextValue}>
      {children}
    </BackendContext.Provider>
  );
};

// Custom hook to use the backend context
export const useBackend = () => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
};