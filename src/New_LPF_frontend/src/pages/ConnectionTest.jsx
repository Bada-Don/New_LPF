import React, { useState, useEffect } from 'react';
import { getBackendActor } from '../utils/actor';

const ConnectionTest = () => {
  const [canisterId, setCanisterId] = useState(localStorage.getItem('backendCanisterId') || '');
  const [status, setStatus] = useState('Not connected');
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rootKeyStatus, setRootKeyStatus] = useState('Not fetched');

  const testConnection = async () => {
    if (!canisterId) {
      setError('Please enter a canister ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setStatus('Connecting...');
      setRootKeyStatus('Fetching...');
      
      // Save canister ID to localStorage
      localStorage.setItem('backendCanisterId', canisterId);
      
      // Get fresh actor with the provided canister ID
      const actor = await getBackendActor();
      
      setRootKeyStatus('Fetched successfully');
      
      // Test with a simple query
      console.log("Making getAllPosts call...");
      const result = await actor.getAllPosts();
      console.log("Call result:", result);
      
      setPosts(result);
      setStatus(`Connected! Found ${result.length} posts.`);
    } catch (err) {
      console.error('Connection error:', err);
      
      if (err.message.includes("root key")) {
        setRootKeyStatus('Failed to fetch root key');
        setError(`Root key error: ${err.message}. Make sure your local replica is running with "dfx start".`);
      } else if (err.message.includes("certificate")) {
        setRootKeyStatus('Root key issue');
        setError(`Certificate error: ${err.message}. Try restarting your local replica with "dfx stop" then "dfx start --clean".`);
      } else {
        setError(`Connection failed: ${err.message}`);
      }
      
      setStatus('Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const restartReplica = () => {
    setStatus('Please run these commands in your terminal:');
    setError(`
1. Stop the replica:
   dfx stop

2. Start a clean replica:
   dfx start --clean --background

3. Deploy your canisters:
   dfx deploy New_LPF_backend
   dfx deploy New_LPF_frontend

4. Then try testing the connection again.
    `);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Backend Canister ID:</label>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={canisterId}
            onChange={(e) => setCanisterId(e.target.value)}
            style={{ flex: 1, padding: '8px', marginRight: '10px' }}
            placeholder="Enter your backend canister ID"
          />
          <button
            onClick={testConnection}
            disabled={isLoading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
          Your backend canister ID: <strong>{canisterId || 'Not set'}</strong>
        </p>
      </div>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: rootKeyStatus.includes('Failed') ? '#f8d7da' : 
                         rootKeyStatus.includes('Fetched successfully') ? '#d4edda' : '#fff3cd',
        borderRadius: '5px',
        marginBottom: '15px'
      }}>
        <h3>Root Key Status: {rootKeyStatus}</h3>
        <p>The root key is required for local development with the Internet Computer.</p>
      </div>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: status === 'Failed' ? '#f8d7da' : status.includes('Connected') ? '#d4edda' : '#fff3cd',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h3>Connection Status: {status}</h3>
        {error && (
          <div style={{ 
            whiteSpace: 'pre-wrap', 
            backgroundColor: '#f1f1f1', 
            padding: '10px', 
            borderRadius: '5px',
            marginTop: '10px'
          }}>
            {error}
          </div>
        )}
      </div>
      
      {status === 'Failed' && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={restartReplica}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            How to Restart Replica
          </button>
        </div>
      )}
      
      {posts.length > 0 && (
        <div>
          <h3>Posts from Backend:</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '5px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            <pre>{JSON.stringify(posts, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <h3>Troubleshooting</h3>
        <ol style={{ paddingLeft: '20px' }}>
          <li>Make sure your local replica is running with <code>dfx start</code></li>
          <li>Verify your canister IDs with <code>dfx canister id New_LPF_backend</code></li>
          <li>If you're getting certificate errors, try restarting with <code>dfx stop</code> followed by <code>dfx start --clean</code></li>
          <li>Ensure your backend canister is deployed with <code>dfx deploy New_LPF_backend</code></li>
        </ol>
      </div>
    </div>
  );
};

export default ConnectionTest;