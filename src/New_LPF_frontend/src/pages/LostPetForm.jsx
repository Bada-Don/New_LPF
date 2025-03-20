import React, { useState } from 'react';
import './LostPetForm.css';

const LostPetForm = () => {
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
        image: null
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        setFormData({
            ...formData,
            image: e.target.files[0]
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Submit form data to backend
        console.log('Form submitted:', formData);
        // Reset form after submission
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
            image: null
        });
    };

    return (
        <div className="lost-pet-container">
        <header className="header">
        <div className="logo-container">
        <img src="/path-to-purple-paw-logo.svg" alt="Purple Paw Logo" className="logo" />
        <h1>PetFinder</h1>
        </div>
        <div className="announcement-banner">
        Help reunite pets with their families. Report a lost pet now.
        </div>
        </header>

        <main className="main-content">
        <h2>Report a Lost Pet</h2>
        <p className="form-description">
        Fill out this form with as much detail as possible to help increase the chances of finding your pet.
        </p>

        <form className="lost-pet-form" onSubmit={handleSubmit}>
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
        <h3>Lost Details</h3>

        <div className="form-row">
        <div className="form-group">
        <label htmlFor="lastSeenDate">Last Seen Date</label>
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
        <label htmlFor="lastSeenLocation">Last Seen Location</label>
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
        <label htmlFor="image">Upload Image</label>
        <input
        type="file"
        id="image"
        name="image"
        accept="image/*"
        onChange={handleImageChange}
        />
        <small className="file-hint">Clear photo helps with identification (Max 5MB)</small>
        </div>
        </div>

        <div className="form-section">
        <h3>Contact Information</h3>

        <div className="form-group">
        <label htmlFor="contactName">Your Name</label>
        <input
        type="text"
        id="contactName"
        name="contactName"
        value={formData.contactName}
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
        value={formData.contactEmail}
        onChange={handleChange}
        required
        />
        </div>
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
