import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AuthPage.css';
import Logo from '../assets/paw-logo.png';
import { New_LPF_backend } from "../../../declarations/New_LPF_backend";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);
        
        try {
            if (isLogin) {
                // Login logic
                // Since your backend doesn't have a direct login function,
                // we'd need to implement one or simulate it for now
                
                // Simulated login for demonstration
                // In a real implementation, you would verify credentials against your backend
                localStorage.setItem('userId', '1'); // Placeholder user ID
                localStorage.setItem('username', email.split('@')[0]); // Using email prefix as username
                
                console.log('Logged in successfully');
                navigate('/'); // Redirect to homepage
            } else {
                // Registration logic using your backend
                const userId = await New_LPF_backend.registerUser(name, email, password);
                
                // Store user info in localStorage
                localStorage.setItem('userId', userId.toString());
                localStorage.setItem('username', name);
                
                console.log('Registered successfully with ID:', userId);
                navigate('/'); // Redirect to homepage
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setErrorMessage(isLogin ? 'Login failed. Please check your credentials.' : 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate to home when clicking logo
    const navigateToHome = () => {
        navigate('/');
    };

    return (
        <div className="auth-container">
            <div className="auth-sidebar">
                <div className="logo-container" onClick={navigateToHome} style={{cursor: 'pointer'}}>
                    <img src={Logo} alt="PetReunite Logo" className="logo" />
                    <h1>PetReunite</h1>
                </div>
                <div className="sidebar-menu">
                    <div className="menu-item" onClick={navigateToHome}>
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
                    <p>PetReunite v2.0 is here! Read about our newest features.</p>
                </div>

                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2>{isLogin ? 'Welcome Back' : 'Join PetReunite'}</h2>
                        <p>{isLogin ? 'Sign in to continue your search' : 'Create an account to help find lost pets'}</p>
                    </div>

                    {errorMessage && <div className="error-message">{errorMessage}</div>}

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

                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
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