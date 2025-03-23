import React, { useState } from 'react';
import './WalletPage.css';
import Logo from '../assets/paw-logo.png';

// Sample transaction data for demonstration
const sampleTransactions = [
    {
        id: 1,
        type: 'deposit',
        amount: 50,
        status: 'completed',
        date: '2025-03-19T14:30:00',
        description: 'Reward payment'
    },
    {
        id: 2,
        type: 'withdraw',
        amount: 20,
        status: 'completed',
        date: '2025-03-15T09:45:00',
        description: 'Donation to animal shelter'
    },
    {
        id: 3,
        type: 'deposit',
        amount: 100,
        status: 'completed',
        date: '2025-03-10T16:20:00',
        description: 'Reward payment'
    },
    {
        id: 4,
        type: 'withdraw',
        amount: 35,
        status: 'pending',
        date: '2025-03-20T08:15:00',
        description: 'Veterinary services'
    },
    {
        id: 5,
        type: 'deposit',
        amount: 25,
        status: 'completed',
        date: '2025-03-05T11:30:00',
        description: 'Reward payment'
    }
];

const WalletPage = () => {
    const [balance, setBalance] = useState(120); // Initial balance
    const [transactions, setTransactions] = useState(sampleTransactions);
    const [activeTab, setActiveTab] = useState('history');
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) + ' at ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle deposit submission
    const handleDeposit = (e) => {
        e.preventDefault();
        if (depositAmount <= 0) return;

        const amount = parseFloat(depositAmount);
        const newTransaction = {
            id: transactions.length + 1,
            type: 'deposit',
            amount,
            status: 'completed',
            date: new Date().toISOString(),
            description: 'Deposit'
        };

        setTransactions([newTransaction, ...transactions]);
        setBalance(balance + amount);
        setDepositAmount('');
    };

    // Handle withdraw submission
    const handleWithdraw = (e) => {
        e.preventDefault();
        if (withdrawAmount <= 0 || withdrawAmount > balance) return;

        const amount = parseFloat(withdrawAmount);
        const newTransaction = {
            id: transactions.length + 1,
            type: 'withdraw',
            amount,
            status: 'pending', // Set as pending initially
            date: new Date().toISOString(),
            description: 'Withdrawal'
        };

        setTransactions([newTransaction, ...transactions]);
        setBalance(balance - amount);
        setWithdrawAmount('');
    };

    return (
        <div className="wallet-page">
            {/* Navbar */}
            <nav className="navbar">
                <div className="logo">
                <img src={Logo}  alt="" srcSet="" />
                <span>PetReunite</span>
                </div>
                <div className="nav-buttons">
                    <button className="back-button">Back to Dashboard</button>
                </div>
            </nav>

            <div className="wallet-container">
                {/* Balance Card */}
                <div className="balance-card">
                    <div className="balance-info">
                        <h2>Current Balance</h2>
                        <div className="balance-amount">{balance} Units</div>
                    </div>
                    <div className="balance-actions">
                        <button
                            className={`action-button ${activeTab === 'deposit' ? 'active' : ''}`}
                            onClick={() => setActiveTab('deposit')}
                        >
                            Deposit
                        </button>
                        <button
                            className={`action-button ${activeTab === 'withdraw' ? 'active' : ''}`}
                            onClick={() => setActiveTab('withdraw')}
                        >
                            Withdraw
                        </button>
                        <button
                            className={`action-button ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            History
                        </button>
                    </div>
                </div>

                {/* Transaction Content */}
                <div className="transaction-content">
                    {activeTab === 'history' && (
                        <div className="transaction-history">
                            <h2>Transaction History</h2>
                            <div className="transactions-list">
                                {transactions.map(transaction => (
                                    <div key={transaction.id} className="transaction-item">
                                        <div className="transaction-icon">
                                            <div className={`icon ${transaction.type}`}>
                                                {transaction.type === 'deposit' ? '↓' : '↑'}
                                            </div>
                                        </div>
                                        <div className="transaction-details">
                                            <div className="transaction-header">
                                                <h3>{transaction.description}</h3>
                                                <span className={`transaction-amount ${transaction.type}`}>
                                                    {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} Units
                                                </span>
                                            </div>
                                            <div className="transaction-info">
                                                <span className="transaction-date">{formatDate(transaction.date)}</span>
                                                <span className={`transaction-status ${transaction.status}`}>
                                                    {transaction.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'deposit' && (
                        <div className="transaction-form">
                            <h2>Deposit Units</h2>
                            <form onSubmit={handleDeposit}>
                                <div className="form-group">
                                    <label htmlFor="deposit-amount">Amount to Deposit</label>
                                    <input
                                        id="deposit-amount"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={!depositAmount || depositAmount <= 0}
                                >
                                    Complete Deposit
                                </button>
                            </form>
                            <div className="form-info">
                                <p>Deposits are typically processed immediately.</p>
                                <p>You can use units to create lost pet posts, boost visibility, or offer rewards.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'withdraw' && (
                        <div className="transaction-form">
                            <h2>Withdraw Units</h2>
                            <form onSubmit={handleWithdraw}>
                                <div className="form-group">
                                    <label htmlFor="withdraw-amount">Amount to Withdraw</label>
                                    <input
                                        id="withdraw-amount"
                                        type="number"
                                        min="1"
                                        max={balance}
                                        step="1"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <p className="available-balance">Available balance: {balance} Units</p>
                                </div>
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > balance}
                                >
                                    Request Withdrawal
                                </button>
                            </form>
                            <div className="form-info">
                                <p>Withdrawals may take 1-3 business days to process.</p>
                                <p>You can convert units to rewards for people who help find your pet.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletPage;
