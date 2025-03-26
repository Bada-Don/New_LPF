import React, { useState, useEffect } from 'react';
import './HomePage.css';
import Logo from '../assets/paw-logo.png';
import { idlFactory } from '../../../declarations/New_LPF_backend/index.js';
import { New_LPF_backend } from "../../../declarations/New_LPF_backend";
import { Actor, HttpAgent } from "@dfinity/agent";
import { useNavigate } from 'react-router-dom'; // Add this import


const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [pets, setPets] = useState([]);

    const navigate = useNavigate();

    // Create the agent and actor
    const createActor = async () => {
        const host = "http://localhost:4943";
        const agent = new HttpAgent({ host });

        // When deploying to the IC, remove this line
        if (process.env.NODE_ENV !== "production") {
            await agent.fetchRootKey();
        }

        // Replace with your actual canister ID from dfx deploy
        const canisterId = process.env.CANISTER_ID_NEW_LPF_BACKEND;

        return Actor.createActor(idlFactory, {
            agent,
            canisterId,
        });
    };

    // Filter and sort pets
    const filteredPets = pets.filter(pet =>
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (statusFilter === 'All' || pet.status === statusFilter) &&
        (typeFilter === 'All' || pet.type === typeFilter)
    )
        .sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.date) - new Date(a.date);
            } else if (sortBy === 'incentive') {
                return b.incentive - a.incentive;
            }
            return 0;
        });

    // -------- Login functionality ---------
    // Check if user is logged in on component mount
    useEffect(() => {
        const checkLoginStatus = () => {
            const userId = localStorage.getItem('userId');
            const username = localStorage.getItem('username');

            if (userId && username) {
                setIsLoggedIn(true);
                setCurrentUser({ id: userId, username: username });
            }
        };

        checkLoginStatus();
    }, []);

    // Handle login button click
    const handleLoginClick = () => {
        navigate('/auth');
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        setIsLoggedIn(false);
        setCurrentUser(null);
    };

    const handleContactClick = async (petOwnerId, petId) => {
        // Check if user is logged in
        const userId = localStorage.getItem('userId');
    
        if (!userId) {
            // Redirect to login if not logged in
            navigate('/auth', { state: { redirectTo: '/' } });
            return;
        }
    
        // Don't allow contacting your own post
        if (parseInt(userId) === petOwnerId) {
            alert("This is your own pet post.");
            return;
        }
    
        try {
            // Start or retrieve a conversation between current user and pet owner
            const result = await New_LPF_backend.startConversation(
                parseInt(userId),
                petOwnerId
            );
            
            if ('ok' in result) {
                const convoId = result.ok;
                console.log(`Conversation created/found with ID: ${convoId}`);
                
                // Check if this is a new conversation by getting its messages
                const messages = await New_LPF_backend.getMessagesForConversation(convoId);
                
                // Only send the initial message if there are no messages yet
                if (messages.length === 0) {
                    console.log("New conversation - sending initial message");
                    // Send an initial message about the pet FROM THE CURRENT USER (userId)
                    await New_LPF_backend.sendMessage(
                        convoId,
                        parseInt(userId), // Ensure the current user is the sender
                        `Hello, I'm contacting you about your pet post (ID: ${petId}). I may have information that could help.`
                    );
                } else {
                    console.log("Existing conversation - not sending duplicate message");
                }
    
                // Redirect to messages page with conversation ID
                navigate(`/messages?convoId=${convoId}`);
            } else {
                console.error("Error from backend:", result.err);
                alert(`Failed to start conversation: ${result.err}`);
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
            alert('Failed to start conversation. Please try again.');
        }
    };
    // Handle report pet button click
    const handleReportPetClick = () => {
        if (isLoggedIn) {
            navigate('/petform');
        } else {
            navigate('/auth', { state: { redirectTo: '/petform' } });
        }
    };

    // Handle my account button click
    const handleMyAccountClick = () => {
        navigate('/account');
    };

    // Handle inbox button click
    const handleInboxClick = () => {
        navigate('/inbox');
    };
    // ------------------------------------------

    useEffect(() => {
        const fetchPets = async () => {
            try {
                console.log("Fetching pets...");
                // Create an agent for local development
                const agent = new HttpAgent({ host: "http://localhost:4943" });

                // IMPORTANT: This line is crucial for local development
                await agent.fetchRootKey();

                const actor = Actor.createActor(idlFactory, {
                    agent,
                    canisterId: process.env.CANISTER_ID_NEW_LPF_BACKEND,
                });

                console.log("Calling backend...");
                const petPosts = await actor.getAllPetPosts();
                console.log("Backend Response:", petPosts);

                // Map data to fit frontend structure
                const formattedPets = petPosts.map(pet => ({
                    id: Number(pet.id),
                    userId: Number(pet.userId), // Make sure this is included
                    name: pet.petName || 'Unknown',
                    type: pet.pet_type || 'Unknown',
                    // Properly handle variant types from Motoko
                    status: 'Active' in pet.status ? 'Lost' : 'Found',
                    photo: pet.photos && pet.photos.length > 0 ? pet.photos[0] : 'https://via.placeholder.com/150',
                    location: pet.last_seen_location || 'Unknown',
                    date: new Date(Number(pet.timestamp) / 1000000).toISOString().split('T')[0],
                    incentive: Number(pet.award_amount),
                    description: pet.description || 'No description available'
                }));

                console.log("Formatted pets:", formattedPets);
                setPets(formattedPets);
            } catch (error) {
                console.error("Error fetching pets:", error);
            }
        };

        fetchPets();
    }, []);


    return (
        <div className="home-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">
                    <img src={Logo} alt="PetFinder Logo" />
                    <span>PetReunite</span>
                </div>
                <div className="nav-buttons">
                    <button className="cta-button" onClick={handleReportPetClick}>Report Pet</button>
                    {isLoggedIn ? (
                        <>
                            <button className="account-button" onClick={handleMyAccountClick}>My Account</button>
                            <button className="inbox-button" onClick={handleInboxClick}>Inbox</button>
                            <button className="logout-button" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <button className="login-button" onClick={handleLoginClick}>Login</button>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Help reunite pets with their families</h1>
                    <p>
                        PetReunite connects people who've lost pets with those who've found them.
                        Join our community to help bring furry family members back home.
                    </p>
                    <button className="cta-button">Get Started</button>
                </div>
                <div className="hero-image">
                    <img src="https://media.istockphoto.com/id/1367150296/photo/happy-young-african-american-man-petting-his-dog-outdoors-in-nature.jpg?s=612x612&w=0&k=20&c=HZT5V05AdmWbcUjeoYcJypF_20VYII8vv6iXxb2gJCg=" alt="Happy pet reunion" />
                </div>
            </section>

            {/* Pet Listings Section */}
            <section className="pet-listings">
                <h2>Recent Pets</h2>

                {/* Filters */}
                <div className="filters">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search by pet name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-options">
                        <div className="filter-group">
                            <label>Status:</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                <option value="All">All</option>
                                <option value="Lost">Lost</option>
                                <option value="Found">Found</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Pet Type:</label>
                            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                                <option value="All">All</option>
                                <option value="Dog">Dogs</option>
                                <option value="Cat">Cats</option>
                                <option value="Bird">Birds</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Sort By:</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="date">Most Recent</option>
                                <option value="incentive">Highest Reward</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Pet Cards */}
                <div className="pet-cards">
                    {filteredPets.map(pet => (
                        <div key={pet.id} className={`pet-card ${pet.status.toLowerCase()}`}>
                            <div className="status-badge">{pet.status}</div>
                            <div className="pet-image">
                                <img src={pet.photo} alt={pet.name} />
                            </div>
                            <div className="pet-details">
                                <h3>{pet.name}</h3>
                                <p className="pet-type">{pet.type}</p>
                                <p className="pet-location">{pet.location}</p>
                                <p className="pet-description">{pet.description}</p>
                                <div className="pet-meta">
                                    <span className="pet-date">
                                        {new Date(pet.date).toLocaleDateString()}
                                    </span>
                                    {pet.status === 'Lost' && pet.incentive > 0 && (
                                        <span className="pet-incentive">${pet.incentive} Reward</span>
                                    )}
                                </div>
                                <button
                                    className="contact-button"
                                    onClick={() => handleContactClick(pet.userId, pet.id)}
                                >
                                    Contact
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src={Logo} className='logo' alt="PetReunite Logo" />
                        <span>PetReunite</span>
                    </div>
                    <div className="footer-links">
                        <div className="link-group">
                            <h4>About</h4>
                            <a href="#">Our Mission</a>
                            <a href="#">How It Works</a>
                            <a href="#">Success Stories</a>
                        </div>
                        <div className="link-group">
                            <h4>Resources</h4>
                            <a href="#">Pet Safety Tips</a>
                            <a href="#">Lost Pet Guide</a>
                            <a href="#">Found Pet Guide</a>
                        </div>
                        <div className="link-group">
                            <h4>Legal</h4>
                            <a href="#">Terms of Service</a>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Cookie Policy</a>
                        </div>
                    </div>
                </div>
                <div className="copyright">
                    <p>© 2025 PetReunite. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

