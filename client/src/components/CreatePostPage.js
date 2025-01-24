import React, { useState } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

function CreatePostPage() {
    const [form, setForm] = useState({ title: '', content: '', imageUrl: '' });
    const [imagePreview, setImagePreview] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleContentChange = (content) => {
        setForm({ ...form, content });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await axios.post('http://localhost:5000/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setForm({ ...form, imageUrl: data.imageUrl });
            setImagePreview(`http://localhost:5000${data.imageUrl}`);
        } catch (err) {
            console.error('Image upload failed:', err);
        }
    };

    const createPost = async () => {
        try {
            if (!form.title || !form.content) {
                console.error('Title and content are required.');
                return;
            }
            await axios.post('http://localhost:5000/posts', form);
            setForm({ title: '', content: '', imageUrl: '' });
            setImagePreview(null);
            alert('Post created successfully!');
        } catch (err) {
            console.error('Failed to create post:', err.response?.data || err.message);
        }
    };

    return (
        <div className="container">
            <h1>Create a New Post</h1>
            <form onSubmit={(e) => e.preventDefault()}>
                <input
                    type="text"
                    name="title"
                    placeholder="Post Title"
                    value={form.title}
                    onChange={handleInputChange}
                />
                <ReactQuill
                    value={form.content}
                    onChange={handleContentChange}
                    placeholder="Write your content here..."
                />
                <div className="image-upload">
                    <label htmlFor="image">Upload Image</label>
                    <input type="file" id="image" onChange={handleImageUpload} />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
                </div>
                <button onClick={createPost}>Create Post</button>
            </form>
            <a href="/" className="back-link">Back to Home</a>
        </div>
    );
}

export default CreatePostPage;
