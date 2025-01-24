import React, { useState } from 'react';
import axios from 'axios';

function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]); // Clear results if query is empty
            return;
        }

        try {
            const { data } = await axios.get(`http://localhost:5000/posts/search?query=${searchQuery}`);
            setSearchResults(data);
        } catch (err) {
            console.error('Failed to search posts:', err);
        }
    };

    return (
        <div className="container">
            <h1>Search Blog Posts</h1>
            <input
                type="text"
                placeholder="Search for posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <a href="/" className="back-link">Back to Home</a>

            <h2>Search Results</h2>
            {searchResults.map((post) => (
                <div key={post._id} className="blog-post">
                    <h3>{post.title}</h3>
                    {post.imageUrl && <img src={`http://localhost:5000${post.imageUrl}`} alt={post.title} className="image-preview" />}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    <small>{new Date(post.createdAt).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
}

export default SearchPage;
