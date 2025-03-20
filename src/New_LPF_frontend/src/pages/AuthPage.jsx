import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';
import Logo from '../assets/paw-logo.png';
import { useAuth } from '../hooks/useBackend';

const AuthPage = () => {
    const navigate = useNavigate();
    const { createUser, user, isLoading, error: authError } = useAuth();
    
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (isLogin) {
            // Login is not yet implemented in the backend
            setError('Login functionality is not available yet.');
            console.log('Logging in', { email, password });
        } else {
            // Registration
            try {
                if (!name || !email || !password) {
                    setError('All fields are required');
                    return;
                }
                
                const result = await createUser(name, email, password);
                if (result.success) {
                    setSuccess('Account created successfully!');
                    // Redirect to home page after a short delay
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                } else {
                    setError(result.error ? `Registration failed: ${result.error}` : 'Registration failed');
                }
            } catch (err) {
                setError('Registration failed. Please try again.');
                console.error(err);
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-sidebar">
                <div className="logo-container" onClick={() => navigate('/')}>
                    <img src={Logo} alt="PawFinder Logo" className="logo" />
                    <h1>PawFinder</h1>
                </div>
                <div className="sidebar-menu">
                    <div className="menu-item" onClick={() => navigate('/')}>
                        <i className="fas fa-search"></i>
                        <span>Find Pets</span>
                    </div>
                    <div className="menu-item" onClick={() => navigate('/petform')}>
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

                    {error && <div className="error-message">{error}</div>}
                    {authError && <div className="error-message">An error occurred. Please try again.</div>}
                    {success && <div className="success-message">{success}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="name">Username</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your username"
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

                        <button 
                            type="submit" 
                            className="auth-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
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