import React, { useState } from 'react';
import { useBackend } from '../context/BackendContext';

const DebugPanel = () => {
  const { actor, user, connectionStatus, isAuthenticated } = useBackend();
  const [showDetails, setShowDetails] = useState(false);
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    if (!actor) return;
    
    setIsLoading(true);
    try {
      const posts = await actor.getAllPosts();
      setTestResponse({
        success: true,
        data: `Got ${posts.length} posts`
      });
    } catch (err) {
      setTestResponse({
        success: false,
        error: err.message || 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #ddd',
      borderRadius: '5px',
      padding: '10px',
      zIndex: 1000,
      maxWidth: '300px',
      fontSize: '14px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h4 style={{ margin: 0 }}>Debug Panel</h4>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>
      
      <div style={{ 
        padding: '5px', 
        backgroundColor: connectionStatus === 'connected' ? '#d4edda' : '#f8d7da',
        borderRadius: '3px',
        marginBottom: '10px'
      }}>
        Connection: {connectionStatus}
      </div>
      
      <div style={{ 
        padding: '5px', 
        backgroundColor: isAuthenticated ? '#d4edda' : '#fff3cd',
        borderRadius: '3px',
        marginBottom: '10px'
      }}>
        Authentication: {isAuthenticated ? 'Logged In' : 'Not Logged In'}
      </div>
      
      <button 
        onClick={testConnection}
        disabled={isLoading || !actor}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {testResponse && (
        <div style={{ 
          marginTop: '10px',
          padding: '5px',
          backgroundColor: testResponse.success ? '#d4edda' : '#f8d7da',
          borderRadius: '3px'
        }}>
          {testResponse.success ? testResponse.data : `Error: ${testResponse.error}`}
        </div>
      )}
      
      {showDetails && (
        <div style={{ marginTop: '15px' }}>
          <h5 style={{ margin: '0 0 5px 0' }}>Actor Status:</h5>
          <pre style={{ 
            fontSize: '12px', 
            whiteSpace: 'pre-wrap', 
            backgroundColor: '#f1f1f1', 
            padding: '5px',
            borderRadius: '3px',
            maxHeight: '150px',
            overflow: 'auto'
          }}>
            {actor ? 'Actor initialized' : 'Actor not initialized'}
          </pre>
          
          {user && (
            <>
              <h5 style={{ margin: '10px 0 5px 0' }}>User Info:</h5>
              <pre style={{ 
                fontSize: '12px', 
                whiteSpace: 'pre-wrap', 
                backgroundColor: '#f1f1f1', 
                padding: '5px',
                borderRadius: '3px',
                maxHeight: '150px',
                overflow: 'auto'
              }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;