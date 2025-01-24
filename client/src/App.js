import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import SearchPage from './components/SearchPage';
import CreatePostPage from './components/CreatePostPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');

    // Handle login
    const handleLogin = (newToken) => {
        setToken(newToken);
        localStorage.setItem('token', newToken);
    };

    // Handle logout
    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('token');
    };

    return (
        <Router>
            <div className="app">
                <Routes>
                    {/* Public Route: Home */}
                    <Route path="/" element={<HomePage token={token} onLogout={handleLogout} />} />

                    {/* Protected Routes */}
                    <Route path="/search" element={token ? <SearchPage token={token} /> : <Navigate to="/login" />} />
                    <Route path="/create-post" element={token ? <CreatePostPage token={token} /> : <Navigate to="/login" />} />

                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage setToken={setToken} />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
