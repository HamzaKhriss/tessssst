const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// Secret key for JWT
const JWT_SECRET = 'your_secret_key_here';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure 'uploads/' folder exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // Limit file size to 5MB

// Serve static images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/blog_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('Connection error', err));

// Blog Schema and Model
const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const Blog = mongoose.model('Blog', blogSchema);

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access denied. No token provided.');

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token.');
        req.user = user;
        next();
    });
};

// User Registration
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send('Username and password are required.');

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword); // Debug hashed password
        const newUser = new User({ username, password: hashedPassword });

        await newUser.save();
        res.status(201).send('User registered successfully.');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Failed to register user.');
    }
});


// User Login
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user in the database
        const user = await User.findOne({ username });
        if (!user) {
            console.error('User not found:', username);
            return res.status(404).send('User not found.');
        }

        // Compare provided password with hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.error('Invalid password for user:', username);
            return res.status(401).send('Invalid password.');
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).send({ token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Failed to login.');
    }
});


// Protected Endpoints
app.post('/posts', authenticateToken, async (req, res) => {
    try {
        const { title, content, imageUrl } = req.body;
        if (!title || !content) return res.status(400).send('Title and content are required.');
        const blog = new Blog({ title, content, imageUrl });
        await blog.save();
        res.status(201).send(blog);
    } catch (err) {
        res.status(500).send('Failed to create post.');
    }
});

app.put('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).send(post);
    } catch (err) {
        res.status(500).send('Failed to update post.');
    }
});

app.delete('/posts/:id', authenticateToken, async (req, res) => {
    try {
        await Blog.findByIdAndDelete(req.params.id);
        res.status(200).send({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).send('Failed to delete post.');
    }
});

app.get('/posts', async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

        // Convert to integers
        const pageInt = parseInt(page, 10);
        const limitInt = parseInt(limit, 10);

        // Determine sort order
        const sortOrder = order === 'asc' ? 1 : -1;

        // Fetch sorted and paginated posts
        const posts = await Blog.find()
            .sort({ [sortBy]: sortOrder }) // Sort by field and order
            .skip((pageInt - 1) * limitInt) // Skip previous pages
            .limit(limitInt); // Limit results

        // Get total number of posts for pagination info
        const totalPosts = await Blog.countDocuments();

        res.status(200).send({
            totalPosts,
            currentPage: pageInt,
            totalPages: Math.ceil(totalPosts / limitInt),
            posts,
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Failed to fetch posts.');
    }
});



const levenshteinDistance = (a, b) => {
    const matrix = [];

    // Initialize the matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b[i - 1] === a[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // Substitution
                    matrix[i][j - 1] + 1,     // Insertion
                    matrix[i - 1][j] + 1      // Deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

const soundex = (word) => {
    const firstLetter = word[0].toUpperCase();
    const map = {
        a: '', e: '', i: '', o: '', u: '', y: '', h: '', w: '',
        b: '1', f: '1', p: '1', v: '1',
        c: '2', g: '2', j: '2', k: '2', q: '2', s: '2', x: '2', z: '2',
        d: '3', t: '3',
        l: '4',
        m: '5', n: '5',
        r: '6'
    };

    let encoded = firstLetter + word
        .slice(1)
        .toLowerCase()
        .replace(/[a-z]/g, (char) => map[char] || '')
        .replace(/(\d)\1+/g, '$1'); // Remove consecutive duplicates

    return (encoded + '0000').slice(0, 4); // Ensure length of 4
};

app.get('/posts/search', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).send('Query parameter is required.');
        }

        const posts = await Blog.find();
        const results = [];

        posts.forEach((post) => {
            const titleDistance = levenshteinDistance(post.title.toLowerCase(), query.toLowerCase());
            const contentDistance = levenshteinDistance(post.content.toLowerCase(), query.toLowerCase());
            const titleSoundex = soundex(post.title);
            const querySoundex = soundex(query);

            // Match if phonetic codes are the same or if Levenshtein distance is within a threshold
            if (
                titleSoundex === querySoundex ||
                titleDistance <= 3 || // Adjust threshold as needed
                contentDistance <= 3
            ) {
                results.push(post);
            }
        });

        res.status(200).send(results);
    } catch (err) {
        console.error('Error in search:', err);
        res.status(500).send('Failed to perform search.');
    }
});


// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
