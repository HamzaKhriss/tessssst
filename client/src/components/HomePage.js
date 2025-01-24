import React, { useEffect, useState } from 'react';
import axios from 'axios';

function HomePage({ token, onLogout }) {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState('createdAt');
    const [order, setOrder] = useState('desc');

    // Fetch posts with pagination and sorting
    const fetchPosts = async (page = 1) => {
        try {
            const { data } = await axios.get('http://localhost:5000/posts', {
                params: { page, limit: 10, sortBy, order },
            });
            setPosts(data.posts);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [sortBy, order]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            fetchPosts(page);
        }
    };

    const handleSortByChange = (e) => {
        setSortBy(e.target.value);
        fetchPosts(1);
    };

    const handleOrderChange = (e) => {
        setOrder(e.target.value);
        fetchPosts(1);
    };

    return (
        <div className="container">
            <h1>My Blog</h1>

            {/* Login or Logout Button */}
            <div className="auth-actions">
                {token ? (
                    <button onClick={onLogout} className="auth-button">
                        Logout
                    </button>
                ) : (
                    <>
                        <a href="/login" className="auth-button">Login</a>
                        <a href="/register" className="auth-button">Register</a>
                    </>
                )}
            </div>

            {/* Conditionally show Add and Search buttons */}
            {token && (
                <div className="auth-controls">
                    <a href="/create-post" className="auth-button">Add Post</a>
                    <a href="/search" className="auth-button">Search Posts</a>
                </div>
            )}

            {/* Sorting Controls */}
            <div className="sorting-controls">
                <label htmlFor="sortBy">Sort By:</label>
                <select id="sortBy" value={sortBy} onChange={handleSortByChange}>
                    <option value="createdAt">Date Created</option>
                    <option value="title">Title</option>
                </select>

                <label htmlFor="order">Order:</label>
                <select id="order" value={order} onChange={handleOrderChange}>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                </select>
            </div>

            {/* Blog Posts */}
            <h2>Recent Posts</h2>
            {posts.map((post) => (
                <div key={post._id} className="blog-post">
                    <h3>{post.title}</h3>
                    {post.imageUrl && <img src={`http://localhost:5000${post.imageUrl}`} alt={post.title} className="image-preview" />}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    <small>{new Date(post.createdAt).toLocaleString()}</small>
                </div>
            ))}

            {/* Pagination Controls */}
            <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default HomePage;
