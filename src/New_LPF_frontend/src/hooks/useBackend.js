import { useState, useCallback } from 'react';
import { useBackend } from '../context/BackendContext';

// User-related hooks
export const useAuth = () => {
  const { actor, user, isLoading, isAuthenticated, refreshUser } = useBackend();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  const createUser = useCallback(async (username, email, password) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setAuthLoading(true);
      const result = await actor.createUser(username, email, password);
      if ('ok' in result) {
        await refreshUser(); // Refresh user data after creation
        return { success: true, id: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setAuthLoading(false);
    }
  }, [actor, refreshUser]);

  const updateUser = useCallback(async (updates) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setAuthLoading(true);
      const result = await actor.updateUser(
        updates.username || null, 
        updates.email || null, 
        updates.password || null
      );
      if ('ok' in result) {
        await refreshUser(); // Refresh user data after update
        return { success: true };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to update user:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setAuthLoading(false);
    }
  }, [actor, refreshUser]);

  return { 
    user, 
    isLoading: isLoading || authLoading, 
    error, 
    createUser, 
    updateUser,
    refreshUser,
    isAuthenticated
  };
};

// Post-related hooks
export const usePosts = () => {
  const { actor, isLoading: contextLoading } = useBackend();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAllPosts = useCallback(async () => {
    if (!actor) return;
    
    try {
      setIsLoading(true);
      const result = await actor.getAllPosts();
      setPosts(result);
    } catch (err) {
      console.error("Failed to get posts:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  const getPostsByCategory = useCallback(async (category) => {
    if (!actor) return;
    
    try {
      setIsLoading(true);
      const result = await actor.getPostsByCategory(category);
      setPosts(result);
    } catch (err) {
      console.error("Failed to get posts by category:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  const searchPosts = useCallback(async (query) => {
    if (!actor) return;
    
    try {
      setIsLoading(true);
      const result = await actor.searchPosts(query);
      setPosts(result);
    } catch (err) {
      console.error("Failed to search posts:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  const getUserPosts = useCallback(async () => {
    if (!actor) return;
    
    try {
      setIsLoading(true);
      const result = await actor.getUserPosts();
      if ('ok' in result) {
        setPosts(result.ok);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Failed to get user posts:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  const createPost = useCallback(async (postData) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setIsLoading(true);
      const result = await actor.createPost(
        postData.pet_name,
        postData.pet_type,
        postData.breed,
        postData.color,
        postData.height,
        postData.last_seen_location,
        postData.category, // #Lost or #Found
        postData.area,
        postData.photos,
        postData.award_amount
      );
      
      if ('ok' in result) {
        await getAllPosts(); // Refresh posts after creation
        return { success: true, id: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [actor, getAllPosts]);

  const updatePostStatus = useCallback(async (postId, status) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setIsLoading(true);
      const result = await actor.updatePostStatus(postId, status);
      if ('ok' in result) {
        // Refresh posts after update
        await getAllPosts();
        return { success: true };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to update post status:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [actor, getAllPosts]);

  return { 
    posts, 
    isLoading: isLoading || contextLoading, 
    error, 
    getAllPosts, 
    getPostsByCategory,
    getUserPosts,
    searchPosts,
    createPost,
    updatePostStatus
  };
};

// Wallet-related hooks
export const useWallet = () => {
  const { actor, user, refreshUser, isLoading: contextLoading } = useBackend();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const depositFunds = useCallback(async (amount) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setIsLoading(true);
      const result = await actor.depositFunds(amount);
      if ('ok' in result) {
        await refreshUser(); // Refresh user data to get updated balance
        return { success: true, balance: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to deposit funds:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [actor, refreshUser]);

  const withdrawFunds = useCallback(async (amount) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setIsLoading(true);
      const result = await actor.withdrawFunds(amount);
      if ('ok' in result) {
        await refreshUser(); // Refresh user data to get updated balance
        return { success: true, balance: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to withdraw funds:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [actor, refreshUser]);

  return {
    balance: user?.wallet_balance || 0,
    isLoading: isLoading || contextLoading,
    error,
    depositFunds,
    withdrawFunds
  };
};

// Messages and conversations hooks
export const useConversations = () => {
  const { actor, isLoading: contextLoading } = useBackend();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserConversations = useCallback(async () => {
    if (!actor) return;
    
    try {
      setIsLoading(true);
      const result = await actor.getUserConversations();
      if ('ok' in result) {
        setConversations(result.ok);
      } else {
        setConversations([]);
      }
    } catch (err) {
      console.error("Failed to get conversations:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  const getConversation = useCallback(async (conversationId) => {
    if (!actor) return null;
    
    try {
      setIsLoading(true);
      const result = await actor.getConversation(conversationId);
      if ('ok' in result) {
        setCurrentConversation(result.ok);
        return result.ok;
      } else {
        setCurrentConversation(null);
        return null;
      }
    } catch (err) {
      console.error("Failed to get conversation:", err);
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [actor]);

  const createConversation = useCallback(async (otherUserId) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setIsLoading(true);
      const result = await actor.createConversation(otherUserId);
      if ('ok' in result) {
        await getUserConversations(); // Refresh conversations after creation
        return { success: true, id: result.ok };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to create conversation:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [actor, getUserConversations]);

  const sendMessage = useCallback(async (conversationId, body) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setIsLoading(true);
      const result = await actor.sendMessage(conversationId, body);
      if ('ok' in result) {
        // Refresh the current conversation to show the new message
        if (currentConversation && currentConversation.id === conversationId) {
          await getConversation(conversationId);
        }
        return { success: true };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [actor, currentConversation, getConversation]);

  const addProof = useCallback(async (conversationId, proofUrl) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setIsLoading(true);
      const result = await actor.addProof(conversationId, proofUrl);
      if ('ok' in result) {
        // Refresh the current conversation to show the new proof
        if (currentConversation && currentConversation.id === conversationId) {
          await getConversation(conversationId);
        }
        return { success: true };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to add proof:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [actor, currentConversation, getConversation]);

  const processReward = useCallback(async (conversationId, postId, recipientId) => {
    if (!actor) return { success: false, error: 'Backend not initialized' };
    
    try {
      setIsLoading(true);
      const result = await actor.processReward(conversationId, postId, recipientId);
      if ('ok' in result) {
        // Refresh the current conversation after processing reward
        if (currentConversation && currentConversation.id === conversationId) {
          await getConversation(conversationId);
        }
        return { success: true };
      } else {
        return { success: false, error: result.err };
      }
    } catch (err) {
      console.error("Failed to process reward:", err);
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [actor, currentConversation, getConversation]);

  return {
    conversations,
    currentConversation,
    isLoading: isLoading || contextLoading,
    error,
    getUserConversations,
    getConversation,
    createConversation,
    sendMessage,
    addProof,
    processReward
  };
};