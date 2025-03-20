import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WalletPage.css';
import Logo from '../assets/paw-logo.png';
import { useAuth, useWallet, usePosts } from '../hooks/useBackend';

const WalletPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { balance, depositFunds, withdrawFunds, isLoading: walletLoading } = useWallet();
    const { posts: userPosts, getUserPosts, isLoading: postsLoading } = usePosts();
    
    const [amount, setAmount] = useState('');
    const [action, setAction] = useState('deposit');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Check if user is authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        } else {
            // Load user's posts
            getUserPosts();
        }
    }, [isAuthenticated, navigate, getUserPosts]);
    
    const handleAmountChange = (e) => {
        const value = e.target.value;
        // Only allow positive numbers
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }
        
        try {
            const numAmount = parseInt(amount);
            let result;
            
            if (action === 'deposit') {
                result = await depositFunds(numAmount);
            } else {
                result = await withdrawFunds(numAmount);
            }
            
            if (result.success) {
                setSuccess(`Successfully ${action === 'deposit' ? 'deposited' : 'withdrew'} ${amount} tokens`);
                setAmount('');
            } else {
                setError(result.error || `Failed to ${action} funds`);
            }
        } catch (err) {
            console.error(`Error ${action}ing funds:`, err);
            setError(`An error occurred while ${action}ing funds`);
        }
    };
    
    return (
        <div className="wallet-page">
            <div className="wallet-sidebar">
                <div className="wallet-logo" onClick={() => navigate('/')}>
                    <img src={Logo} alt="PetFinder Logo" className="logo" />
                    <h1>PetFinder</h1>
                </div>
                <div className="sidebar-menu">
                    <div className="menu-item" onClick={() => navigate('/')}>
                        <i className="fas fa-home"></i>
                        <span>Home</span>
                    </div>
                    <div className="menu-item" onClick={() => navigate('/petform')}>
                        <i className="fas fa-paw"></i>
                        <span>Report Pet</span>
                    </div>
                    <div className="menu-item" onClick={() => navigate('/messages')}>
                        <i className="fas fa-envelope"></i>
                        <span>Messages</span>
                    </div>
                    <div className="menu-item active">
                        <i className="fas fa-wallet"></i>
                        <span>Wallet</span>
                    </div>
                    <div className="menu-item">
                        <i className="fas fa-user"></i>
                        <span>Profile</span>
                    </div>
                </div>
            </div>
            
            <div className="wallet-content">
                <header className="wallet-header">
                    <h2>My Wallet</h2>
                    <div className="user-info">
                        <span>{user?.username || 'User'}</span>
                    </div>
                </header>
                
                <div className="wallet-sections">
                    <section className="balance-section">
                        <div className="balance-card">
                            <h3>Current Balance</h3>
                            <div className="balance-amount">{balance} <span>Tokens</span></div>
                            <p className="balance-info">
                                Use tokens to offer rewards for lost pets or withdraw to your account.
                            </p>
                        </div>
                        
                        <div className="transaction-form">
                            <h3>{action === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}</h3>
                            
                            {error && <div className="error-message">{error}</div>}
                            {success && <div className="success-message">{success}</div>}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="form-tabs">
                                    <button 
                                        type="button"
                                        className={`tab ${action === 'deposit' ? 'active' : ''}`}
                                        onClick={() => setAction('deposit')}
                                    >
                                        Deposit
                                    </button>
                                    <button 
                                        type="button"
                                        className={`tab ${action === 'withdraw' ? 'active' : ''}`}
                                        onClick={() => setAction('withdraw')}
                                    >
                                        Withdraw
                                    </button>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="amount">Amount</label>
                                    <div className="amount-input">
                                        <input
                                            type="text"
                                            id="amount"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            placeholder="Enter amount"
                                            required
                                        />
                                        <span className="currency">Tokens</span>
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    className="transaction-button"
                                    disabled={walletLoading}
                                >
                                    {walletLoading ? 'Processing...' : action === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
                                </button>
                            </form>
                        </div>
                    </section>
                    
                    <section className="rewards-section">
                        <h3>My Pet Rewards</h3>
                        
                        {postsLoading ? (
                            <div className="loading">Loading your pets...</div>
                        ) : userPosts && userPosts.length > 0 ? (
                            <div className="rewards-list">
                                {userPosts
                                    .filter(post => post.category && '#Lost' in post.category)
                                    .map(post => (
                                        <div key={post.id} className="reward-item">
                                            <div className="pet-info">
                                                <h4>{post.pet_name}</h4>
                                                <p>{post.pet_type} • {post.breed}</p>
                                                <p className="location">{post.last_seen_location}</p>
                                            </div>
                                            <div className="reward-status">
                                                <div className={`status-badge ${post.status === '#Active' ? 'active' : 'resolved'}`}>
                                                    {post.status === '#Active' ? 'Active' : 'Resolved'}
                                                </div>
                                                <div className="reward-amount">
                                                    {post.award_amount} Tokens
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="no-rewards">
                                <p>You haven't posted any rewards yet.</p>
                                <button 
                                    className="create-post-button"
                                    onClick={() => navigate('/petform')}
                                >
                                    Report a Lost Pet
                                </button>
                            </div>
                        )}
                    </section>
                    
                    <section className="transaction-history">
                        <h3>Transaction History</h3>
                        
                        {/* This would show actual transaction history in a real implementation */}
                        <div className="no-transactions">
                            <p>No transaction history available yet.</p>
                        </div>
                        
                        {/* Example of how transaction history would look:
                        <div className="transaction-list">
                            <div className="transaction-item">
                                <div className="transaction-info">
                                    <span className="transaction-type deposit">Deposit</span>
                                    <span className="transaction-date">Mar 20, 2025</span>
                                </div>
                                <div className="transaction-amount">+100 Tokens</div>
                            </div>
                            <div className="transaction-item">
                                <div className="transaction-info">
                                    <span className="transaction-type reward">Reward Payment</span>
                                    <span className="transaction-date">Mar 15, 2025</span>
                                </div>
                                <div className="transaction-amount">-50 Tokens</div>
                            </div>
                        </div>
                        */}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default WalletPage;