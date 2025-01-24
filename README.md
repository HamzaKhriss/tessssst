# Blog Post Management System

## Description
A full-stack blog post management system built with React, Node.js, and MongoDB. The app allows users to register, log in, and manage blog posts. Additional features include search, pagination, sorting, and image uploads.

## Features
- User authentication with JWT.
- CRUD operations for blog posts.
- Search functionality with phonetic and fuzzy matching.
- Pagination and sorting.
- Image uploads with previews.
- Responsive dark theme design.

## Technology Stack
- **Frontend**: React, React-Quill, Axios.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose.
- **Styling**: CSS (Dark theme with pastel colors).

## Setup and Installation

### Prerequisites
- Node.js and npm installed.
- MongoDB installed and running.

### MongoDB Configuration
- Ensure MongoDB is running locally or use a hosted MongoDB service.
- Replace the placeholder URI in `server.js` with your MongoDB connection string:
  ```javascript
  mongoose.connect('mongodb://localhost:27017/blog_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  });
