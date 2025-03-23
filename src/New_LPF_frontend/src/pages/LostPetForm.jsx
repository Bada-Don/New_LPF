import React, { useState } from 'react';
import './LostPetForm.css';
import Logo from '../assets/paw-logo.png';

const LostPetForm = () => {
    const [formData, setFormData] = useState({
        pet_name: '',
        pet_type: '',
        breed: '',
        color: '',
        height: '',
        last_seen_location: '',
        category: '', // Added category field
        date: '',
        area: '',
        photos: [],
        award_amount: ''
    });

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

        const imageUrls = files.map(file => URL.createObjectURL(file));
        setFormData({
            ...formData,
            photos: imageUrls
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit form data to backend
        console.log('Form submitted:', formData);
        // Reset form after submission
        setFormData({
            pet_name: '',
            pet_type: '',
            breed: '',
            color: '',
            height: '',
            last_seen_location: '',
            category: '', // Reset category
            date: '',
            area: '',
            photos: [],
            award_amount: ''
        });
    };

    return (
        <div className="lost-pet-container">
            <header className="header">
                <div className="logo-container">
                    <img src={Logo} className='logo' alt="" srcSet="" />
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
                                    <option value="">Select</option>
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
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-button">Submit Report</button>
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
