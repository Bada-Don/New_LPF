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

    // Check if user is already logged in
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            // User is already logged in, redirect to home
            navigate('/');
        }
    }, [navigate]);

    // Add this somewhere in your component for testing
    useEffect(() => {
        const debugUsers = async () => {
            try {
                const result = await New_LPF_backend.debugUsers();
                console.log("Debug users result:", result);
            } catch (error) {
                console.error("Error debugging users:", error);
            }
        };

        debugUsers();
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setIsLoading(true);

        try {
            if (isLogin) {
                console.log("Attempting login with:", email);

                // Login logic using the authenticateUser function
                const userIdOpt = await New_LPF_backend.authenticateUser(email, password);
                console.log("Authentication response:", userIdOpt);

                // Check if userIdOpt is null (no user found)
                if (userIdOpt === null || userIdOpt === undefined) {
                    console.log("No user found with provided credentials");
                    setErrorMessage('Invalid email or password');
                    setIsLoading(false);
                    return;
                }

                // Extract the actual userId from the option type
                // In Motoko, ?Nat returns an optional value which needs to be unwrapped
                const userId = userIdOpt[0]; // This is how you access the value inside an option
                console.log("User ID from login:", userId);

                // Get user details
                const userDetailsOpt = await New_LPF_backend.getUser(userId);
                console.log("User details response:", userDetailsOpt);

                if (userDetailsOpt === null || userDetailsOpt === undefined) {
                    console.log("User details not found");
                    setErrorMessage('User account not found');
                    setIsLoading(false);
                    return;
                }

                const userDetails = userDetailsOpt[0]; // Extract the user details from the option

                // Store user info in localStorage
                localStorage.setItem('userId', userId.toString());
                localStorage.setItem('username', userDetails.username);

                console.log('Logged in successfully');
                navigate(location.state?.redirectTo || '/');
            } else {
                console.log("Attempting registration with:", email);

                // Check if email is already registered
                const existingUserOpt = await New_LPF_backend.getUserByEmail(email);
                console.log("Existing user check response:", existingUserOpt);

                // In JavaScript, an optional value from Motoko will be:
                // - [] or null if the option is empty (no user found)
                // - [user] if a user was found (the user object is at index 0)
                if (Array.isArray(existingUserOpt) && existingUserOpt.length > 0) {
                    console.log("Email already registered");
                    setErrorMessage('Email is already registered. Please use a different email or login.');
                    setIsLoading(false);
                    return;
                }

                // Registration logic
                const userId = await New_LPF_backend.registerUser(name, email, password);
                console.log("Registration successful, user ID:", userId);

                // Store user info in localStorage
                localStorage.setItem('userId', userId.toString());
                localStorage.setItem('username', name);

                console.log('Registered successfully with ID:', userId);
                navigate(location.state?.redirectTo || '/');
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
                <div className="logo-container" onClick={navigateToHome} style={{ cursor: 'pointer' }}>
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