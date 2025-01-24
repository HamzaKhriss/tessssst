import React, { useState } from 'react';
import axios from 'axios';

function RegisterPage() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:5000/register', form);
            setMessage('Registration successful! You can now log in.');
            setForm({ username: '', password: '' }); // Clear the form
        } catch (err) {
            console.error('Registration failed:', err.response?.data || err.message);
            setMessage('Registration failed. Please try again.');
        }
    };

    return (
        <div className="container">
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleInputChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleInputChange}
                    required
                />
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
            <a href="/login" className="auth-button">Already have an account? Log in</a>
        </div>
    );
}

export default RegisterPage;
