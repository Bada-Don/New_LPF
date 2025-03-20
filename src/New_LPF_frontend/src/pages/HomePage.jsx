import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import Logo from '../assets/paw-logo.png';
import { usePosts, useAuth } from '../hooks/useBackend';
import DebugPanel from '../components/DebugPanel'; // Import the debug panel


const HomePage = () => {
    const navigate = useNavigate();
    const { posts, isLoading, error, searchPosts, getPostsByCategory, getAllPosts } = usePosts();
    const { user, isAuthenticated } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date');

    // Handle search input
    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length >= 3) {
            // Search backend when term is at least 3 characters
            searchPosts(term);
        } else if (term.length === 0) {
            // Reset to all posts when search is cleared
            getAllPosts();
        }
    };

    // Handle status filter change
    const handleStatusChange = (e) => {
        const status = e.target.value;
        setStatusFilter(status);

        if (status === 'All') {
            getAllPosts();
        } else {
            // Convert UI status to backend category format
            const category = status === 'Lost' ? { '#Lost': null } : { '#Found': null };
            getPostsByCategory(category);
        }
    };

    // Handle navigation
    const handleReportPet = () => {
        if (isAuthenticated) {
            navigate('/petform');
        } else {
            navigate('/auth');
        }
    };

    const handleLogin = () => {
        navigate('/auth');
    };

    const handleMyAccount = () => {
        navigate('/wallet');
    };

    const handleInbox = () => {
        navigate('/messages');
    };

    const handleContact = (postId, ownerId) => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        // Navigate to messages with context to start a conversation
        navigate(`/messages?post=${postId}&owner=${ownerId}`);
    };

    // Sort posts based on user selection
    const sortedPosts = [...posts].sort((a, b) => {
        if (sortBy === 'date') {
            return b.date - a.date;
        } else if (sortBy === 'incentive') {
            return b.award_amount - a.award_amount;
        }
        return 0;
    });

    // Further filter posts by type if needed (since backend doesn't have this filter)
    const filteredPosts = typeFilter === 'All'
        ? sortedPosts
        : sortedPosts.filter(post => post.pet_type.toLowerCase() === typeFilter.toLowerCase());

    return (
        <div className="home-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">
                    <img src={Logo} alt="PetFinder Logo" />
                    <span>PetReunite</span>
                </div>
                <div className="nav-buttons">
                    <button className="cta-button" onClick={handleReportPet}>Report Pet</button>
                    {isAuthenticated ? (
                        <>
                            <button className="account-button" onClick={handleMyAccount}>My Account</button>
                            <button className="inbox-button" onClick={handleInbox}>Inbox</button>
                        </>
                    ) : (
                        <button className="login-button" onClick={handleLogin}>Login</button>
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
                    <button className="cta-button" onClick={handleReportPet}>Get Started</button>
                </div>
                <div className="hero-image">
                    <img src="https://media.istockphoto.com/id/1367150296/photo/happy-young-african-american-man-petting-his-dog-outdoors-in-nature.jpg?s=612x612&w=0&k=20&c=HZT5V05AdmWbcUjeoYcJypF_20VYII8vv6iXxb2gJCg=" alt="Happy pet reunion" />
                </div>
            </section>

            {/* Announcement Banner */}
            <div className="announcement-banner">
                <p>New feature: Pet facial recognition now available! <span>Learn more about our technology.</span></p>
            </div>

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
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="filter-options">
                        <div className="filter-group">
                            <label>Status:</label>
                            <select value={statusFilter} onChange={handleStatusChange}>
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

                {/* Loading State */}
                {isLoading && (
                    <div className="loading-state">
                        <p>Loading pets...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="error-state">
                        <p>Error loading pets. Please try again later.</p>
                    </div>
                )}

                {/* Pet Cards */}
                <div className="pet-cards">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map(post => {
                            // Determine status display value
                            const status = 'category' in post && '#Lost' in post.category ? 'Lost' : 'Found';

                            // Get the first photo URL or use a placeholder
                            const photoUrl = post.photos && post.photos.length > 0
                                ? post.photos[0]
                                : 'https://place-hold.it/300x300&text=No%20Image';

                            return (
                                <div key={post.id} className={`pet-card ${status.toLowerCase()}`}>
                                    <div className="status-badge">{status}</div>
                                    <div className="pet-image">
                                        <img src={photoUrl} alt={post.pet_name} />
                                    </div>
                                    <div className="pet-details">
                                        <h3>{post.pet_name}</h3>
                                        <p className="pet-type">{post.pet_type}</p>
                                        <p className="pet-location">{post.last_seen_location}</p>
                                        <p className="pet-description">
                                            {post.breed}, {post.color}, {post.height}
                                        </p>
                                        <div className="pet-meta">
                                            <span className="pet-date">
                                                {new Date(Number(post.date) / 1000000).toLocaleDateString()}
                                            </span>
                                            {status === 'Lost' && post.award_amount > 0 && (
                                                <span className="pet-incentive">${post.award_amount} Reward</span>
                                            )}
                                        </div>
                                        <button
                                            className="contact-button"
                                            onClick={() => handleContact(post.id, post.owner)}
                                        >
                                            Contact
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        !isLoading && (
                            <div className="no-posts-message">
                                <p>No pets found matching your criteria.</p>
                            </div>
                        )
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer>
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src={Logo} alt="PetReunite Logo" />
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
            <DebugPanel />
        </div>
    );
};

export default HomePage;