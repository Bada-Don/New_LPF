import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LostPetForm.css';
import Logo from '../assets/paw-logo.png';
import { New_LPF_backend } from "../../../declarations/New_LPF_backend";

const LostPetForm = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [description, setDescription] = useState('');
    const [formData, setFormData] = useState({
        pet_name: '',
        pet_type: '',
        breed: '',
        color: '',
        height: '',
        last_seen_location: '',
        category: 'Lost',
        date: '',
        area: '',
        photos: [],
        award_amount: '0'
    });

    // Check if user is logged in
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            // Redirect to login if not logged in
            navigate('/auth', { state: { redirectTo: '/petform' } });
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            alert("You can only upload up to 5 images.");
            return;
        }

        // In a real app, you would upload these to a storage service
        // For now, we'll use placeholders for demo
        const photoPlaceholders = files.map((_, index) => 
            `https://via.placeholder.com/150?text=Pet+Photo+${index+1}`
        );

        setFormData({
            ...formData,
            photos: photoPlaceholders
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Get user ID from localStorage
            const userId = localStorage.getItem('userId');
            
            if (!userId) {
                // Redirect to login if not logged in
                navigate('/auth', { state: { redirectTo: '/petform' } });
                return;
            }
            
            // Prepare description combining multiple fields for more context
            const fullDescription = `${description || 'No description provided'}. 
                Last seen on ${formData.date} in the ${formData.area} area.`;
            
            // Prepare photos array - use at least one placeholder if none provided
            const photoUrls = formData.photos.length > 0 
                ? formData.photos 
                : ["https://via.placeholder.com/150?text=No+Photo"];
            
            // Convert award amount to number
            const awardAmount = parseInt(formData.award_amount) || 0;
            
            // Create the appropriate category variant for Motoko
            const petCategory = formData.category === 'Lost' 
                ? { 'Lost': null } 
                : { 'Found': null };
            
            // Call backend to report pet
            const postId = await New_LPF_backend.reportPet(
                parseInt(userId),
                formData.pet_name,
                formData.pet_type,
                formData.breed,
                formData.color,
                formData.height,
                formData.last_seen_location,
                fullDescription,
                photoUrls,
                awardAmount,
                petCategory
            );
            
            console.log('Pet reported successfully with ID:', postId);
            alert('Pet reported successfully!');
            navigate('/'); // Redirect to homepage
            
        } catch (error) {
            console.error('Error reporting pet:', error);
            alert('Failed to report pet. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="lost-pet-container">
            <header className="header">
                <div className="logo-container" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                    <img src={Logo} className='logo' alt="PetFinder Logo" />
                    <h1>PetFinder</h1>
                </div>
                <div className="announcement-banner">
                    Help reunite pets with their families. Report a lost pet now.
                </div>
            </header>

            <main className="main-content">
                <h2>Report a Lost/Found Pet</h2>
                <p className="form-description">
                    Fill out this form with as much detail as possible to help increase the chances of finding your pet.
                </p>

                <form className="lost-pet-form" onSubmit={handleSubmit}>
                    <div className="form-section">
                        <h3>Pet Information</h3>

                        <div className="form-group">
                            <label htmlFor="pet_name">Pet's Name</label>
                            <input
                                type="text"
                                id="pet_name"
                                name="pet_name"
                                value={formData.pet_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="pet_type">Pet Type</label>
                                <input
                                    type="text"
                                    id="pet_type"
                                    name="pet_type"
                                    value={formData.pet_type}
                                    onChange={handleChange}
                                    required
                                />
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
                                <label htmlFor="height">Height</label>
                                <select
                                    id="height"
                                    name="height"
                                    value={formData.height}
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
                        <h3>Lost/Found Details</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="last_seen_location">Last Seen/Found Location</label>
                                <input
                                    type="text"
                                    id="last_seen_location"
                                    name="last_seen_location"
                                    value={formData.last_seen_location}
                                    onChange={handleChange}
                                    required
                                    placeholder="Address, neighborhood, or landmark"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Lost">Lost</option>
                                    <option value="Found">Found</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="date">Date</label>
                                <input
                                    type="datetime-local"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="area">Area</label>
                            <input
                                type="text"
                                id="area"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                rows="4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Provide any additional details that might help identify the pet (collar, tags, behavior, etc.)"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="photos">Upload Images</label>
                            <input
                                type="file"
                                id="photos"
                                name="photos"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                            />
                            <small className="file-hint">Up to 5 clear photos (Max 5MB each)</small>
                            
                            {formData.photos.length > 0 && (
                                <div className="photo-preview">
                                    {formData.photos.map((url, index) => (
                                        <img key={index} src={url} alt={`Pet preview ${index + 1}`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="award_amount">Award Amount (Optional)</label>
                            <input
                                type="number"
                                id="award_amount"
                                name="award_amount"
                                value={formData.award_amount}
                                onChange={handleChange}
                                placeholder="Enter amount"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                        <button type="reset" className="reset-button">Reset Form</button>
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