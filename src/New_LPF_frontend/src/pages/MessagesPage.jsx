import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MessagesPage.css';
import Logo from '../assets/paw-logo.png';
import { idlFactory } from '../../../declarations/New_LPF_backend/index.js';
import { Actor, HttpAgent } from "@dfinity/agent";

const MessagesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialConvoId = queryParams.get('convoId') ? parseInt(queryParams.get('convoId')) : null;

    const [searchTerm, setSearchTerm] = useState('');
    const [userId, setUserId] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedConvoId, setSelectedConvoId] = useState(initialConvoId);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    
    // Create a function to get the actor
    const getActor = async () => {
        const agent = new HttpAgent({ host: "http://localhost:4943" });
        await agent.fetchRootKey();
        
        return Actor.createActor(idlFactory, {
            agent,
            canisterId: "bkyz2-fmaaa-aaaaa-qaaaq-cai",
        });
    };

    const startConversation = async (userId) => {
        try {
            const actor = await getActor();
            const result = await actor.startConversation(userId);
            return result;
        } catch (error) {
            console.error("Error starting conversation:", error);
        }
    };

    // Check if user is logged in
    useEffect(() => {
        const loggedInUserId = localStorage.getItem('userId');
        if (!loggedInUserId) {
            navigate('/auth', { state: { redirectTo: '/messages' } });
            return;
        }
        setUserId(parseInt(loggedInUserId));
    }, [navigate]);

    // Load user's conversations
    useEffect(() => {
        const fetchConversations = async () => {
            if (!userId) return;

            try {
                setIsLoading(true);
                const actor = await getActor();

                // Get user's conversation IDs
                const convoIds = await actor.getConversationsForUser(userId);

                if (!convoIds || convoIds.length === 0) {
                    setIsLoading(false);
                    return;
                }

                const convoPromises = convoIds.map(async (convoId) => {
                    try {
                        // Get conversation details
                        const convo = await actor.getConversation(convoId);

                        if (!convo) return null;

                        // Get the other user in the conversation
                        const otherUserId = convo.users.find(id => id !== userId);
                        if (!otherUserId) return null;

                        // Get the other user's details
                        const otherUserOpt = await actor.getUser(otherUserId);
                        if (!otherUserOpt) return null;
                        const otherUser = otherUserOpt[0];

                        // Get messages for this conversation
                        const convoMessages = await actor.getMessagesForConversation(convoId);

                        // Get the last message
                        const lastMessage = convoMessages && convoMessages.length > 0
                            ? convoMessages[convoMessages.length - 1]
                            : null;

                        return {
                            id: convoId,
                            name: otherUser.username,
                            avatar: 'https://randomuser.me/api/portraits/people/' + (otherUserId % 100) + '.jpg',
                            lastMessage: lastMessage ? lastMessage.content : "No messages yet",
                            timestamp: lastMessage ? formatTimestamp(lastMessage.timestamp) : "No date",
                            unread: 0
                        };
                    } catch (error) {
                        console.error(`Error fetching conversation ${convoId}:`, error);
                        return null;
                    }
                });

                const fetchedConvos = await Promise.all(convoPromises);
                const validConvos = fetchedConvos.filter(c => c !== null);
                setConversations(validConvos);

                if (initialConvoId) {
                    setSelectedConvoId(initialConvoId);
                } else if (validConvos.length > 0) {
                    setSelectedConvoId(validConvos[0].id);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [userId, initialConvoId]);

    // Load messages for selected conversation
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedConvoId) return;

            try {
                setIsLoading(true);
                const actor = await getActor();

                // Get all messages for the conversation
                const convoMessages = await actor.getMessagesForConversation(selectedConvoId);

                if (!convoMessages || convoMessages.length === 0) {
                    setMessages([]);
                    setIsLoading(false);
                    return;
                }

                // Format messages for display
                const formattedMessages = convoMessages.map(msg => ({
                    id: msg.id,
                    sender: msg.senderId === userId ? 'me' : 'them',
                    text: msg.content,
                    timestamp: new Date(Number(msg.timestamp) / 1000000).toISOString()
                }));

                setMessages(formattedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [selectedConvoId, userId]);

    // Add this useEffect for polling new messages
    useEffect(() => {
        if (!selectedConvoId || !userId) return;

        // Poll for new messages every 5 seconds
        const intervalId = setInterval(async () => {
            try {
                const actor = await getActor();
                
                // Get latest messages
                const convoMessages = await actor.getMessagesForConversation(selectedConvoId);

                if (!convoMessages || convoMessages.length === 0) return;

                // Only update if we have more or different messages
                if (convoMessages.length > messages.length) {
                    const formattedMessages = convoMessages.map(msg => ({
                        id: msg.id,
                        sender: msg.senderId === userId ? 'me' : 'them',
                        text: msg.content,
                        timestamp: new Date(Number(msg.timestamp) / 1000000).toISOString()
                    }));

                    setMessages(formattedMessages);

                    // Also update the conversation list if needed
                    const lastMessage = convoMessages[convoMessages.length - 1];
                    setConversations(prevConvos =>
                        prevConvos.map(convo =>
                            convo.id === selectedConvoId
                                ? {
                                    ...convo,
                                    lastMessage: lastMessage.content,
                                    timestamp: formatTimestamp(lastMessage.timestamp)
                                }
                                : convo
                        )
                    );
                }
            } catch (error) {
                console.error("Error polling messages:", error);
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, [selectedConvoId, userId, messages.length]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending a new message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !selectedConvoId || !userId) return;

        try {
            const actor = await getActor();
            
            // Send message to backend
            const messageId = await actor.sendMessage(
                selectedConvoId,
                userId,
                newMessage
            );

            // Add message to UI
            const newMsg = {
                id: messageId,
                sender: 'me',
                text: newMessage,
                timestamp: new Date().toISOString()
            };

            setMessages([...messages, newMsg]);
            setNewMessage('');

            // Update conversation list with new last message
            setConversations(conversations.map(convo =>
                convo.id === selectedConvoId
                    ? { ...convo, lastMessage: newMessage, timestamp: 'Just now' }
                    : convo
            ));
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message. Please try again.");
        }
    };
    
    // Helper function to format timestamp
    const formatTimestamp = (timestamp) => {
        const date = new Date(Number(timestamp) / 1000000);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'long' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    // Format message time for display
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Replace these variables
    const filteredContacts = conversations.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // // For development/testing - use sample data if no real data is available
    // const useRealData = conversations.length > 0;

    // // If we have no real conversations, use sample data for UI development
    // const displayContacts = useRealData ? filteredContacts : sampleContacts.filter(contact =>
    //     contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    // const displaySelectedContact = useRealData
    //     ? selectedConvoId
    //     : selectedConvoId || (displayContacts.length > 0 ? displayContacts[0].id : null);

    // const displayMessages = useRealData
    //     ? messages
    //     : (displaySelectedContact ? sampleMessages[displaySelectedContact] || [] : []);

    return (
        <div className="messages-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <img src={Logo} alt="PetReunite Logo" />
                    <span>PetReunite</span>
                </div>
                <div className="nav-buttons">
                    <button className="back-button" onClick={() => navigate('/')}>
                        Back to Dashboard
                    </button>
                </div>
            </nav>

            <div className="messages-container">
                {/* Contacts Sidebar */}
                <div className="contacts-sidebar">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="contacts-list">
                        {isLoading && conversations.length === 0 ? (
                            <div className="loading-contacts">Loading conversations...</div>
                        ) : conversations.length === 0 ? (
                            <div className="no-contacts">
                                <p>No conversations yet</p>
                                <p>Start a conversation by contacting a pet owner</p>
                            </div>
                        ) : (
                            filteredContacts.map(contact => (
                                <div
                                    key={contact.id}
                                    className={`contact-item ${selectedConvoId === contact.id ? 'active' : ''}`}
                                    onClick={() => setSelectedConvoId(contact.id)}
                                >
                                    <div className="contact-avatar">
                                        <img src={contact.avatar} alt={contact.name} />
                                        {contact.unread > 0 && (
                                            <span className="unread-badge">{contact.unread}</span>
                                        )}
                                    </div>
                                    <div className="contact-info">
                                        <div className="contact-header">
                                            <h3>{contact.name}</h3>
                                            <span className="timestamp">{contact.timestamp}</span>
                                        </div>
                                        <p className="last-message">{contact.lastMessage}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="chat-area">
                    {selectedConvoId ? (
                        <>
                            {/* Chat Header */}
                            <div className="chat-header">
                                <div className="chat-contact-info">
                                    <img
                                        src={conversations.find(c => c.id === selectedConvoId)?.avatar}
                                        alt={conversations.find(c => c.id === selectedConvoId)?.name}
                                    />
                                    <h2>{conversations.find(c => c.id === selectedConvoId)?.name}</h2>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="messages-list">
                                {isLoading && messages.length === 0 ? (
                                    <div className="loading-messages">Loading messages...</div>
                                ) : messages.length === 0 ? (
                                    <div className="no-messages">
                                        <p>No messages in this conversation</p>
                                        <p>Start the conversation by sending a message</p>
                                    </div>
                                ) : (
                                    messages.map(message => (
                                        <div
                                            key={message.id}
                                            className={`message ${message.sender === 'me' ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-content">
                                                <p>{message.text}</p>
                                                <span className="message-time">
                                                    {formatMessageTime(message.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form className="message-input" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="send-button"
                                    disabled={newMessage.trim() === '' || isLoading}
                                >
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default MessagesPage;