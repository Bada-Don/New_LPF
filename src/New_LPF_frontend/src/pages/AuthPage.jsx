import React, { useState } from 'react';
import './AuthPage.css';
import Logo from '../assets/paw-logo.png';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Authentication logic would go here
        console.log(isLogin ? 'Logging in' : 'Signing up', { email, password, name });
    };

    return (
        <div className="auth-container">
        <div className="auth-sidebar">
        <div className="logo-container">
        <img src={Logo} alt="PawFinder Logo" className="logo" />
        <h1>PawFinder</h1>
        </div>
        <div className="sidebar-menu">
        <div className="menu-item">
        <i className="fas fa-search"></i>
        <span>Find Pets</span>
        </div>
        <div className="menu-item">
        <i className="fas fa-paw"></i>
        <span>Report Found</span>
        </div>
        <div className="menu-item">
        <i className="fas fa-book"></i>
        <span>Resources</span>
        </div>
        <div className="menu-item">
        <i className="fas fa-map-marker-alt"></i>
        <span>Map</span>
        </div>
        </div>
        </div>

        <div className="auth-content">
        <div className="notification-banner">
        <p>PawFinder v2.0 is here! Read about our newest features.</p>
        </div>

        <div className="auth-form-container">
        <div className="auth-form-header">
        <h2>{isLogin ? 'Welcome Back' : 'Join PawFinder'}</h2>
        <p>{isLogin ? 'Sign in to continue your search' : 'Create an account to help find lost pets'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
        {!isLogin && (
            <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            />
            </div>
        )}

        <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
        type="email"
        id="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        />
        </div>

        <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
        required
        />
        </div>

        {isLogin && (
            <div className="forgot-password">
            <a href="#forgot">Forgot password?</a>
            </div>
        )}

        <button type="submit" className="auth-button">
        {isLogin ? 'Sign In' : 'Create Account'}
        </button>
        </form>

        <div className="auth-switch">
        <p>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
        className="switch-button"
        onClick={() => setIsLogin(!isLogin)}
        >
        {isLogin ? 'Sign Up' : 'Sign In'}
        </button>
        </p>
        </div>

        <div className="auth-divider">
        <span>or continue with</span>
        </div>

        <div className="social-auth">
        <button className="social-button google">
        <i className="fab fa-google"></i>
        Google
        </button>
        <button className="social-button facebook">
        <i className="fab fa-facebook"></i>
        Facebook
        </button>
        </div>
        </div>
        </div>
        </div>
    );
};

export default AuthPage;
