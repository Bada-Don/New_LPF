import React, { useState, useEffect, useRef } from 'react';
import './MessagesPage.css';
import Logo from '../assets/paw-logo.png';

// Sample data for demonstration
const sampleContacts = [
    {
        id: 1,
        name: 'Sarah Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        lastMessage: 'I found your dog near the park',
        timestamp: '10:23 AM',
        unread: 2
    },
{
    id: 2,
    name: 'Mike Peterson',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    lastMessage: 'Is the reward still available?',
    timestamp: 'Yesterday',
    unread: 0
},
{
    id: 3,
    name: 'Emily Rodriguez',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    lastMessage: 'I think I saw your cat on Main St',
    timestamp: 'Yesterday',
    unread: 1
},
{
    id: 4,
    name: 'David Kim',
    avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
    lastMessage: 'Thanks for your help finding Rex',
    timestamp: 'Mar 18',
    unread: 0
},
{
    id: 5,
    name: 'Lisa Wong',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    lastMessage: 'Do you have any more photos of the dog?',
    timestamp: 'Mar 17',
    unread: 0
}
];

// Sample messages for each contact
const sampleMessages = {
    1: [
        { id: 1, sender: 'them', text: 'Hi there! I think I found your dog in Central Park.', timestamp: '2025-03-20T10:20:00' },
        { id: 2, sender: 'me', text: 'Oh my goodness! Thank you so much for reaching out. What does the dog look like?', timestamp: '2025-03-20T10:21:00' },
        { id: 3, sender: 'them', text: 'Golden retriever, wearing a blue collar with a star tag?', timestamp: '2025-03-20T10:22:00' },
        { id: 4, sender: 'me', text: 'That\'s Max! Where exactly are you? I can come right away!', timestamp: '2025-03-20T10:22:30' },
        { id: 5, sender: 'them', text: 'I found your dog near the park', timestamp: '2025-03-20T10:23:00' }
    ],
    2: [
        { id: 1, sender: 'them', text: 'Hello, I saw your post about the missing cat.', timestamp: '2025-03-19T14:10:00' },
        { id: 2, sender: 'me', text: 'Yes, have you seen her?', timestamp: '2025-03-19T14:15:00' },
        { id: 3, sender: 'them', text: 'Is the reward still available?', timestamp: '2025-03-19T14:20:00' }
    ],
    3: [
        { id: 1, sender: 'me', text: 'Hi, I saw you found a tabby cat?', timestamp: '2025-03-19T09:05:00' },
        { id: 2, sender: 'them', text: 'Yes, gray tabby with white paws.', timestamp: '2025-03-19T09:10:00' },
        { id: 3, sender: 'me', text: 'That sounds like my Mittens! Do you have a photo?', timestamp: '2025-03-19T09:15:00' },
        { id: 4, sender: 'them', text: 'I think I saw your cat on Main St', timestamp: '2025-03-19T09:20:00' }
    ],
    4: [
        { id: 1, sender: 'them', text: 'I\'m so glad Rex is back home with you.', timestamp: '2025-03-18T16:30:00' },
        { id: 2, sender: 'me', text: 'We are too! He\'s been so happy since coming home.', timestamp: '2025-03-18T16:35:00' },
        { id: 3, sender: 'them', text: 'That\'s wonderful to hear!', timestamp: '2025-03-18T16:40:00' },
        { id: 4, sender: 'me', text: 'We can\'t thank you enough for spotting him.', timestamp: '2025-03-18T16:45:00' },
        { id: 5, sender: 'them', text: 'Thanks for your help finding Rex', timestamp: '2025-03-18T16:50:00' }
    ],
    5: [
        { id: 1, sender: 'them', text: 'I saw your lost dog post. Could you share more photos?', timestamp: '2025-03-17T11:20:00' },
        { id: 2, sender: 'me', text: 'Of course! Here\'s a few more. [Photo attachment]', timestamp: '2025-03-17T11:25:00' },
        { id: 3, sender: 'them', text: 'Do you have any more photos of the dog?', timestamp: '2025-03-17T11:30:00' }
    ]
};

const MessagesPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState(1);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Filter contacts based on search term
    const filteredContacts = sampleContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Load messages for selected contact
    useEffect(() => {
        if (selectedContact) {
            setMessages(sampleMessages[selectedContact] || []);
        }
    }, [selectedContact]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending a new message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const newMsg = {
            id: messages.length + 1,
            sender: 'me',
            text: newMessage,
            timestamp: new Date().toISOString()
        };

        setMessages([...messages, newMsg]);
        setNewMessage('');
    };

    // Format timestamp for display
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="messages-page">
        {/* Navbar */}
        <nav className="navbar">
        <div className="logo">
        <img src={Logo} alt="PetReunite Logo" />
        <span>PetReunite</span>
        </div>
        <div className="nav-buttons">
        <button className="back-button">Back to Dashboard</button>
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
        {filteredContacts.map(contact => (
            <div
            key={contact.id}
            className={`contact-item ${selectedContact === contact.id ? 'active' : ''}`}
            onClick={() => setSelectedContact(contact.id)}
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
        ))}
        </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
        {selectedContact ? (
            <>
            {/* Chat Header */}
            <div className="chat-header">
            <div className="chat-contact-info">
            <img
            src={sampleContacts.find(c => c.id === selectedContact)?.avatar}
            alt={sampleContacts.find(c => c.id === selectedContact)?.name}
            />
            <h2>{sampleContacts.find(c => c.id === selectedContact)?.name}</h2>
            </div>
            </div>

            {/* Messages */}
            <div className="messages-list">
            {messages.map(message => (
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
            ))}
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
            disabled={newMessage.trim() === ''}
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
