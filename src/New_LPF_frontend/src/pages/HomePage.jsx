import React, { useState } from 'react';
import './HomePage.css';
import Logo from '../assets/paw-logo.png';


// Sample data for demonstration
const samplePets = [
    {
        id: 1,
        name: 'Max',
        type: 'Dog',
        status: 'Lost',
        photo: 'https://petsworld.in/cdn/shop/articles/golden-retriever_7d05df63-fecf-4246-9c76-abd9da09ede3.jpg?v=1730809408', // Golden Retriever
        location: 'Central Park, NYC',
        date: '2025-03-15',
        incentive: 200,
        description: 'Golden Retriever, friendly, has a blue collar'
    },
    {
        id: 2,
        name: 'Whiskers',
        type: 'Cat',
        status: 'Found',
        photo: 'https://cataas.com/cat/cute', // Gray Tabby Cat
        location: 'Downtown, Seattle',
        date: '2025-03-18',
        incentive: 0,
        description: 'Gray tabby, very affectionate, no collar'
    },
    {
        id: 3,
        name: 'Buddy',
        type: 'Dog',
        status: 'Lost',
        photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf0yG-ebsBp98DCz0tYl4-djzdSg_9b_Wcdw&s', // Labrador
        location: 'Highland Park, Chicago',
        date: '2025-03-10',
        incentive: 300,
        description: 'Labrador mix, brown, has a red collar with tags'
    },
    {
        id: 4,
        name: 'Mittens',
        type: 'Cat',
        status: 'Found',
        photo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkKlsjeyVIPSaONGRIYWT1wTkv-GdopknY0Q&s', // Black and White Cat
        location: 'Mission District, SF',
        date: '2025-03-19',
        incentive: 0,
        description: 'Black and white cat, very shy, has a microchip'
    }
];

const HomePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Filter and sort pets
    const filteredPets = samplePets
    .filter(pet =>
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

    return (
        <div className="home-page">
        {/* Navbar */}
        <nav className="navbar">
        <div className="logo">
        <img src={Logo} alt="PetFinder Logo" />
        <span>PetReunite</span>
        </div>
        <div className="nav-buttons">
        <button className="cta-button">Report Pet</button>
        {isLoggedIn ? (
            <>
            <button className="account-button">My Account</button>
            <button className="inbox-button">Inbox</button>
            </>
        ) : (
            <button className="login-button">Login</button>
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

        {/* Announcement Banner - similar to Angular's */}
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
            <button className="contact-button">Contact</button>
            </div>
            </div>
        ))}
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
        </div>
    );
};

export default HomePage;
