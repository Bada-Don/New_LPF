import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MessagesPage.css';
import Logo from '../assets/paw-logo.png';
import { idlFactory } from '../../../declarations/New_LPF_backend/index.js';
import { Actor, HttpAgent } from "@dfinity/agent";
import { New_LPF_backend } from "../../../declarations/New_LPF_backend"; // Direct import

const MessagesPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialConvoId = queryParams.get('convoId') ? parseInt(queryParams.get('convoId')) : null;
    
    console.log("Initial conversation ID from URL:", initialConvoId);

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
            canisterId: "bkyz2-fmaaa-aaaaa-qaaaq-cai", // Use hardcoded ID
        });
    };

    // Check if user is logged in
    useEffect(() => {
        const loggedInUserId = localStorage.getItem('userId');
        console.log("Logged in user ID from localStorage:", loggedInUserId);
        
        if (loggedInUserId === null || loggedInUserId === undefined || loggedInUserId === '') {
            console.log("No user ID found, redirecting to auth page");
            navigate('/auth', { state: { redirectTo: '/messages' } });
            return;
        }
        setUserId(parseInt(loggedInUserId));
    }, [navigate]);

    // Load user's conversations
    useEffect(() => {
        const fetchConversations = async () => {
            if (userId === null || userId === undefined) {
                console.log("No user ID, skipping conversation fetch");
                return;
            }

            try {
                setIsLoading(true);
                console.log("Fetching conversations for user:", userId);
                
                // Try using the direct import first
                try {
                    console.log("Getting user conversations using direct import");
                    const convoIds = await New_LPF_backend.getConversationsForUser(userId);
                    console.log("Conversation IDs received:", convoIds);
                    
                    if (!convoIds || convoIds.length === 0) {
                        console.log("No conversations found for user");
                        setIsLoading(false);
                        setConversations([]);
                        return;
                    }
                    
                    processConversations(convoIds);
                } catch (directError) {
                    console.error("Error with direct import, trying actor pattern:", directError);
                    
                    // Fallback to actor pattern
                    const actor = await getActor();
                    const convoIds = await actor.getConversationsForUser(userId);
                    console.log("Conversation IDs received using actor:", convoIds);
                    
                    if (!convoIds || convoIds.length === 0) {
                        console.log("No conversations found for user");
                        setIsLoading(false);
                        setConversations([]);
                        return;
                    }
                    
                    processConversations(convoIds);
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
                setIsLoading(false);
                setConversations([]);
            }
        };
        
        const processConversations = async (convoIds) => {
            try {
                const actor = await getActor();
                
                const convoPromises = convoIds.map(async (convoId) => {
                    try {
                        console.log(`Fetching details for conversation ${convoId}`);
                        // Get conversation details
                        const convoResult = await actor.getConversation(convoId);
                        console.log(`Conversation ${convoId} details:`, convoResult);

                        if (!convoResult) {
                            console.log(`No conversation found with ID ${convoId}`);
                            return null;
                        }

                        // Check if the result is an array and get the first element
                        const convoData = Array.isArray(convoResult) ? convoResult[0] : convoResult;

                        if (!convoData || !convoData.users) {
                            console.log(`Invalid conversation structure for ID ${convoId}:`, convoData);
                            return null;
                        }

                        // Get the other user in the conversation
                        const userIdNum = Number(userId);
                        const otherUserId = convoData.users.find(id => Number(id) !== userIdNum);
                        console.log(`Current user ID: ${userIdNum}, Other user ID in conversation:`, otherUserId);

                        if (otherUserId === undefined) {
                            console.log(`Could not find other user in conversation ${convoId}`);
                            return null;
                        }

                        // Get the other user's details
                        console.log(`Fetching details for user ${otherUserId}`);
                        let username = "Unknown User";
                        
                        try {
                            const otherUserOpt = await actor.getUser(otherUserId);
                            console.log(`User ${otherUserId} details:`, otherUserOpt);
                            
                            // Handle different possible formats of the response
                            if (otherUserOpt) {
                                if (typeof otherUserOpt === 'object') {
                                    if (otherUserOpt.username) {
                                        username = otherUserOpt.username;
                                    } else if (Array.isArray(otherUserOpt) && otherUserOpt.length > 0 && otherUserOpt[0].username) {
                                        username = otherUserOpt[0].username;
                                    }
                                }
                            }
                        } catch (userError) {
                            console.error(`Error getting user ${otherUserId}:`, userError);
                            // Continue with default username
                        }

                        // Get messages for this conversation
                        console.log(`Fetching messages for conversation ${convoId}`);
                        const convoMessages = await actor.getMessagesForConversation(convoId);
                        console.log(`Messages for conversation ${convoId}:`, convoMessages ? convoMessages.length : 0);

                        // Get the last message
                        const lastMessage = convoMessages && convoMessages.length > 0
                            ? convoMessages[convoMessages.length - 1]
                            : null;

                        const result = {
                            id: convoId,
                            name: username,
                            avatar: 'https://randomuser.me/api/portraits/people/' + (Number(otherUserId) % 100) + '.jpg',
                            lastMessage: lastMessage ? lastMessage.content : "No messages yet",
                            timestamp: lastMessage ? formatTimestamp(lastMessage.timestamp) : "No date",
                            unread: 0
                        };
                        
                        console.log(`Successfully prepared conversation ${convoId}:`, result);
                        return result;
                    } catch (error) {
                        console.error(`Error fetching conversation ${convoId}:`, error);
                        return null;
                    }
                });

                const fetchedConvos = await Promise.all(convoPromises);
                console.log("All conversation promises resolved:", fetchedConvos);
                
                const validConvos = fetchedConvos.filter(c => c !== null);
                console.log("Valid conversations after filtering:", validConvos);
                
                setConversations(validConvos);

                if (initialConvoId !== null && initialConvoId !== undefined) {
                    console.log(`Setting selected conversation to initial ID: ${initialConvoId}`);
                    setSelectedConvoId(initialConvoId);
                } else if (validConvos.length > 0) {
                    console.log(`Setting selected conversation to first available: ${validConvos[0].id}`);
                    setSelectedConvoId(validConvos[0].id);
                }
            } catch (error) {
                console.error("Error processing conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [userId, initialConvoId]);

    // Load messages for selected conversation
    useEffect(() => {
        const fetchMessages = async () => {
            if (selectedConvoId === null || selectedConvoId === undefined) {
                console.log("No conversation selected, skipping message fetch");
                return;
            }

            try {
                setIsLoading(true);
                console.log(`Fetching messages for conversation ${selectedConvoId}`);
                
                const actor = await getActor();

                // Get all messages for the conversation
                const convoMessages = await actor.getMessagesForConversation(selectedConvoId);
                console.log(`Retrieved ${convoMessages ? convoMessages.length : 0} messages`);

                if (!convoMessages || convoMessages.length === 0) {
                    console.log("No messages found for this conversation");
                    setMessages([]);
                    setIsLoading(false);
                    return;
                }

                // Format messages for display
                const userIdNum = Number(userId);
                const formattedMessages = convoMessages.map(msg => {
                    // Log sender details to debug message ownership
                    const msgSenderId = Number(msg.senderId);
                    console.log(`Message ${msg.id} | SenderId: ${msgSenderId} | CurrentUserId: ${userIdNum} | IsSentByMe: ${msgSenderId === userIdNum}`);
                    
                    return {
                        id: msg.id,
                        sender: msgSenderId === userIdNum ? 'me' : 'them',
                        text: msg.content,
                        timestamp: new Date(Number(msg.timestamp) / 1000000).toISOString()
                    };
                });

                console.log("Formatted messages:", formattedMessages);
                setMessages(formattedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [selectedConvoId, userId]);

    // Poll for new messages
    useEffect(() => {
        if (selectedConvoId === null || selectedConvoId === undefined || userId === null || userId === undefined) {
            return;
        }

        // Poll for new messages every 5 seconds
        const intervalId = setInterval(async () => {
            try {
                const actor = await getActor();
                
                // Get latest messages
                const convoMessages = await actor.getMessagesForConversation(selectedConvoId);

                if (!convoMessages || convoMessages.length === 0) return;

                // Only update if we have more or different messages
                if (convoMessages.length > messages.length) {
                    const userIdNum = Number(userId);
                    const formattedMessages = convoMessages.map(msg => {
                        const msgSenderId = Number(msg.senderId);
                        return {
                            id: msg.id,
                            sender: msgSenderId === userIdNum ? 'me' : 'them',
                            text: msg.content,
                            timestamp: new Date(Number(msg.timestamp) / 1000000).toISOString()
                        };
                    });

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
        if (newMessage.trim() === '' || selectedConvoId === null || userId === null) return;

        try {
            const actor = await getActor();
            console.log(`Sending message to conversation ${selectedConvoId} as user ${userId}`);
            
            // Send message to backend
            const messageId = await actor.sendMessage(
                selectedConvoId,
                userId,
                newMessage
            );

            if (messageId === 0) {
                throw new Error("Failed to send message - backend returned ID 0");
            }

            console.log(`Message sent successfully with ID ${messageId}`);

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

    // Filter contacts based on search term
    const filteredContacts = conversations.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    {selectedConvoId !== null && selectedConvoId !== undefined ? (
                        <>
                            {/* Chat Header */}
                            <div className="chat-header">
                                <div className="chat-contact-info">
                                    <img
                                        src={conversations.find(c => c.id === selectedConvoId)?.avatar || 'https://via.placeholder.com/40'}
                                        alt={conversations.find(c => c.id === selectedConvoId)?.name || 'Contact'}
                                    />
                                    <h2>{conversations.find(c => c.id === selectedConvoId)?.name || 'Unknown Contact'}</h2>
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