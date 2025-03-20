import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MessagesPage.css';
import Logo from '../assets/paw-logo.png';
import { useConversations, useAuth } from '../hooks/useBackend';

const MessagesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();
    const { 
        conversations, 
        currentConversation, 
        isLoading, 
        getUserConversations, 
        getConversation, 
        createConversation, 
        sendMessage 
    } = useConversations();
    
    const [selectedContact, setSelectedContact] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messageEndRef = useRef(null);
    const [error, setError] = useState('');
    
    // Check if user is authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, navigate]);
    
    // Handle URL parameters for starting a new conversation
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const postId = params.get('post');
        const ownerId = params.get('owner');
        
        if (postId && ownerId && user && ownerId !== user.id.toString()) {
            // Start a new conversation with the post owner
            const startConversation = async () => {
                try {
                    const result = await createConversation(ownerId);
                    if (result.success) {
                        // Select the newly created conversation
                        await getUserConversations();
                        await getConversation(result.id);
                        setSelectedContact(result.id);
                    } else {
                        setError('Failed to start conversation');
                    }
                } catch (err) {
                    console.error('Error starting conversation:', err);
                    setError('An error occurred');
                }
            };
            
            startConversation();
        }
    }, [location, user, createConversation, getUserConversations, getConversation]);
    
    // Scroll to bottom of messages when conversation changes
    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentConversation]);
    
    const handleContactSelect = async (conversationId) => {
        setSelectedContact(conversationId);
        await getConversation(conversationId);
    };
    
    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedContact) return;
        
        try {
            const result = await sendMessage(selectedContact, messageText);
            if (result.success) {
                setMessageText('');
            } else {
                setError('Failed to send message');
            }
        } catch (err) {
            console.error('Error sending message:', err);
            setError('An error occurred');
        }
    };
    
    // Filter conversations based on search query
    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        
        // Find the other user in the conversation
        const otherUser = conv.users.find(userId => userId.toString() !== user?.id.toString());
        // This is simplified - in a real app you'd need to lookup the username from the userId
        return otherUser && otherUser.toString().includes(searchQuery);
    });
    
    // Format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(Number(timestamp) / 1000000);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    // Get the last message from a conversation
    const getLastMessage = (conversation) => {
        if (conversation.messages && conversation.messages.length > 0) {
            return conversation.messages[conversation.messages.length - 1];
        }
        return null;
    };

    return (
        <div className="messages-container">
            {/* Sidebar */}
            <div className="messages-sidebar">
                <div className="messages-logo" onClick={() => navigate('/')}>
                    <img src={Logo} alt="PetFinder Logo" />
                    <h2>PetFinder</h2>
                </div>
                
                <div className="search-box">
                    <input 
                        type="text" 
                        placeholder="Search conversations..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="contacts-list">
                    {isLoading ? (
                        <div className="loading">Loading conversations...</div>
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map(conversation => {
                            const lastMessage = getLastMessage(conversation);
                            // Find the other user in the conversation
                            const otherUserId = conversation.users.find(
                                userId => userId.toString() !== user?.id.toString()
                            );
                            // This is simplified - in a real app you'd need to lookup the username and avatar
                            
                            return (
                                <div 
                                    key={conversation.id} 
                                    className={`contact-item ${selectedContact === conversation.id ? 'selected' : ''}`}
                                    onClick={() => handleContactSelect(conversation.id)}
                                >
                                    <div className="contact-avatar">
                                        {/* Placeholder avatar - in a real app you'd use the user's avatar */}
                                        <div className="avatar-placeholder">
                                            {otherUserId.toString().charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="contact-info">
                                        <div className="contact-name">
                                            {/* Simplified - in a real app you'd show the actual username */}
                                            User {otherUserId.toString().substring(0, 8)}...
                                        </div>
                                        <div className="contact-last-message">
                                            {lastMessage ? lastMessage.body : 'No messages yet'}
                                        </div>
                                    </div>
                                    <div className="contact-meta">
                                        <div className="contact-time">
                                            {lastMessage ? formatTimestamp(lastMessage.timestamp) : ''}
                                        </div>
                                        {/* Unread count would be implemented in a real app */}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-conversations">
                            <p>No conversations yet</p>
                        </div>
                    )}
                </div>
                
                <div className="sidebar-footer">
                    <button className="new-message-button" onClick={() => navigate('/')}>
                        Find Pets
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-area">
                {selectedContact ? (
                    <>
                        <div className="chat-header">
                            {currentConversation && (
                                <>
                                    <div className="chat-contact-info">
                                        {/* Find the other user in the conversation */}
                                        {currentConversation.users
                                            .find(userId => userId.toString() !== user?.id.toString())
                                            ?.toString().substring(0, 8)}...
                                    </div>
                                    <div className="chat-actions">
                                        <button className="view-profile-button">View Profile</button>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="messages-container">
                            {error && <div className="error-message">{error}</div>}
                            
                            {currentConversation ? (
                                <div className="message-list">
                                    {currentConversation.messages.length > 0 ? (
                                        currentConversation.messages.map((message, index) => (
                                            <div 
                                                key={index} 
                                                className={`message ${message.sender.toString() === user?.id.toString() ? 'outgoing' : 'incoming'}`}
                                            >
                                                <div className="message-content">
                                                    <p>{message.body}</p>
                                                    <span className="message-time">
                                                        {formatTimestamp(message.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-messages">
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    )}
                                    <div ref={messageEndRef} />
                                </div>
                            ) : (
                                <div className="loading">Loading conversation...</div>
                            )}
                        </div>
                        
                        <div className="message-input-container">
                            <textarea 
                                className="message-input" 
                                placeholder="Type a message..." 
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            ></textarea>
                            <button 
                                className="send-button"
                                onClick={handleSendMessage}
                                disabled={!messageText.trim()}
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="empty-state">
                            <img src={Logo} alt="PetFinder Logo" className="empty-logo" />
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation from the list or start a new one</p>
                        </div>
                    </div>
                )}
            </div>
            {/* Pet Information Panel - would show in a real app when discussing a specific pet */}
            <div className="pet-info-panel">
                <div className="panel-header">
                    <h3>Pet Information</h3>
                    <button className="close-panel">×</button>
                </div>
                
                {currentConversation && currentConversation.reward_transaction ? (
                    <div className="reward-status">
                        <div className="status-badge resolved">Resolved</div>
                        <p>Reward of <span className="reward-amount">${currentConversation.reward_transaction}</span> has been processed</p>
                    </div>
                ) : (
                    <div className="pet-details-section">
                        <p className="no-pet-selected">
                            No pet information available for this conversation.
                        </p>
                        
                        {/* This would show actual pet details in a real implementation */}
                        {/* <div className="pet-image">
                            <img src="pet-image-url" alt="Pet" />
                        </div>
                        <div className="pet-details">
                            <h4>Max</h4>
                            <p>Golden Retriever • Lost</p>
                            <p>Last seen: Central Park, NYC</p>
                            <p>Reward: $200</p>
                        </div> */}
                    </div>
                )}
                
                <div className="proof-section">
                    <h4>Proof of Finding</h4>
                    {currentConversation && currentConversation.proofs && currentConversation.proofs.length > 0 ? (
                        <div className="proof-images">
                            {currentConversation.proofs.map((proofUrl, index) => (
                                <div key={index} className="proof-image">
                                    <img src={proofUrl} alt={`Proof ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No proof images uploaded yet.</p>
                    )}
                    
                    {/* Upload proof button - would be functional in a real app */}
                    <button className="upload-proof-button">
                        Upload Proof Image
                    </button>
                </div>
                
                {/* Reward actions - would be functional in a real app */}
                <div className="reward-actions">
                    <button className="process-reward-button">
                        Process Reward
                    </button>
                    <button className="report-button">
                        Report Issue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;