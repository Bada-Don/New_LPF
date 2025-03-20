import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LostPetForm.css';
import { usePosts, useAuth, useWallet } from '../hooks/useBackend';

const LostPetForm = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { createPost, isLoading: postLoading } = usePosts();
    const { balance } = useWallet();
    
    const [formData, setFormData] = useState({
        petName: '',
        petType: '',
        breed: '',
        color: '',
        size: '',
        lastSeenDate: '',
        lastSeenLocation: '',
        description: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        awardAmount: 0,
        category: 'Lost', // Default to Lost
        images: []
    });
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Check if user is authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Limit to 5 images
        if (files.length > 5) {
            setError('You can only upload up to 5 images');
            return;
        }
        
        // Convert images to base64 strings for storage
        const imagePromises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });
        
        Promise.all(imagePromises)
            .then(images => {
                setFormData({
                    ...formData,
                    images
                });
            })
            .catch(err => {
                setError('Error processing images');
                console.error(err);
            });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            // Check if award amount is valid
            if (formData.awardAmount > balance) {
                setError(`Insufficient funds. Your balance is ${balance}`);
                return;
            }
            
            // Prepare data for backend
            const postData = {
                pet_name: formData.petName,
                pet_type: formData.petType,
                breed: formData.breed,
                color: formData.color,
                height: formData.size, // Map size to height in backend
                last_seen_location: formData.lastSeenLocation,
                category: formData.category === 'Lost' ? { '#Lost': null } : { '#Found': null },
                area: formData.lastSeenLocation, // Use location for area
                photos: formData.images.slice(0, 5), // Limit to 5 images
                award_amount: Number(formData.awardAmount)
            };
            
            const result = await createPost(postData);
            
            if (result.success) {
                setSuccess('Pet report created successfully!');
                // Reset form after successful submission
                setFormData({
                    petName: '',
                    petType: '',
                    breed: '',
                    color: '',
                    size: '',
                    lastSeenDate: '',
                    lastSeenLocation: '',
                    description: '',
                    contactName: '',
                    contactPhone: '',
                    contactEmail: '',
                    awardAmount: 0,
                    category: 'Lost',
                    images: []
                });
                
                // Redirect to home after a short delay
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setError(result.error ? `Failed to create report: ${result.error}` : 'Failed to create report');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="lost-pet-container">
            <header className="header">
                <div className="logo-container" onClick={() => navigate('/')}>
                    <img src="/path-to-purple-paw-logo.svg" alt="Purple Paw Logo" className="logo" />
                    <h1>PetFinder</h1>
                </div>
                <div className="announcement-banner">
                    Help reunite pets with their families. Report a lost pet now.
                </div>
            </header>

            <main className="main-content">
                <h2>Report a {formData.category} Pet</h2>
                <p className="form-description">
                    Fill out this form with as much detail as possible to help increase the chances of finding your pet.
                </p>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form className="lost-pet-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Report Type</h3>
                        <div className="form-group">
                            <label>I want to report a:</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="Lost"
                                        checked={formData.category === 'Lost'}
                                        onChange={handleChange}
                                    />
                                    Lost Pet
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="category"
                                        value="Found"
                                        checked={formData.category === 'Found'}
                                        onChange={handleChange}
                                    />
                                    Found Pet
                                </label>
                            </div>
                        </div>
                    </div>
                
                    <div className="form-section">
                        <h3>Pet Information</h3>

                        <div className="form-group">
                            <label htmlFor="petName">Pet's Name</label>
                            <input
                                type="text"
                                id="petName"
                                name="petName"
                                value={formData.petName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="petType">Pet Type</label>
                                <select
                                    id="petType"
                                    name="petType"
                                    value={formData.petType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="dog">Dog</option>
                                    <option value="cat">Cat</option>
                                    <option value="bird">Bird</option>
                                    <option value="rabbit">Rabbit</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="breed">Breed</label>
                                <input
                                    type="text"
                                    id="breed"
                                    name="breed"
                                    value={formData.breed}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="color">Color</label>
                                <input
                                    type="text"
                                    id="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="size">Size</label>
                                <select
                                    id="size"
                                    name="size"
                                    value={formData.size}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>{formData.category === 'Lost' ? 'Lost' : 'Found'} Details</h3>

                        <div className="form-row">
                            <div className="form-group">
                            <label htmlFor="lastSeenDate">
                                    {formData.category === 'Lost' ? 'Last Seen Date' : 'Found Date'}
                                </label>
                                <input
                                    type="date"
                                    id="lastSeenDate"
                                    name="lastSeenDate"
                                    value={formData.lastSeenDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastSeenLocation">
                                    {formData.category === 'Lost' ? 'Last Seen Location' : 'Found Location'}
                                </label>
                                <input
                                    type="text"
                                    id="lastSeenLocation"
                                    name="lastSeenLocation"
                                    value={formData.lastSeenLocation}
                                    onChange={handleChange}
                                    required
                                    placeholder="Address, neighborhood, or landmark"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Any distinctive features, collar details, behavior, etc."
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="images">Upload Images</label>
                            <input
                                type="file"
                                id="images"
                                name="images"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                            />
                            <small className="file-hint">Clear photos help with identification (Max 5 images, 5MB each)</small>
                        </div>
                        
                        {formData.images.length > 0 && (
                            <div className="image-preview">
                                {formData.images.map((image, index) => (
                                    <div key={index} className="preview-thumbnail">
                                        <img src={image} alt={`Preview ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {formData.category === 'Lost' && (
                        <div className="form-section">
                            <h3>Reward</h3>
                            <div className="form-group">
                                <label htmlFor="awardAmount">Reward Amount (optional)</label>
                                <input
                                    type="number"
                                    id="awardAmount"
                                    name="awardAmount"
                                    value={formData.awardAmount}
                                    onChange={handleChange}
                                    min="0"
                                    step="1"
                                />
                                <small className="balance-info">Your current balance: {balance}</small>
                            </div>
                        </div>
                    )}

                    <div className="form-section">
                        <h3>Contact Information</h3>

                        <div className="form-group">
                            <label htmlFor="contactName">Your Name</label>
                            <input
                                type="text"
                                id="contactName"
                                name="contactName"
                                value={formData.contactName || (user ? user.username : '')}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="contactPhone">Phone Number</label>
                                <input
                                    type="tel"
                                    id="contactPhone"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="contactEmail">Email</label>
                                <input
                                    type="email"
                                    id="contactEmail"
                                    name="contactEmail"
                                    value={formData.contactEmail || (user ? user.email : '')}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={postLoading}
                        >
                            {postLoading ? 'Submitting...' : 'Submit Report'}
                        </button>
                        <button 
                            type="button" 
                            className="reset-button"
                            onClick={() => setFormData({
                                petName: '',
                                petType: '',
                                breed: '',
                                color: '',
                                size: '',
                                lastSeenDate: '',
                                lastSeenLocation: '',
                                description: '',
                                contactName: '',
                                contactPhone: '',
                                contactEmail: '',
                                awardAmount: 0,
                                category: 'Lost',
                                images: []
                            })}
                        >
                            Reset Form
                        </button>
                    </div>
                </form>
            </main>

            <footer className="footer">
                <p>© 2025 PetFinder - Reuniting Pets and Families</p>
            </footer>
        </div>
    );
};

export default LostPetForm;