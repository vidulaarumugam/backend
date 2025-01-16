const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Initialize socket.io with the server

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Schema and connection (same as before)
mongoose.connect('mongodb://127.0.0.1:27017/user-submissions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error(err));

const userSchema = new mongoose.Schema({
  name: String,
  socialMediaHandle: String,
  images: [String],
});

const User = mongoose.model('User', userSchema);

// Multer setup for file uploads (same as before)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// API route to handle form submissions
app.post('/api/submit', upload.array('images', 10), async (req, res) => {
  try {
    const { name, socialMediaHandle } = req.body;
    const imagePaths = req.files.map((file) => file.path);

    const newUser = new User({
      name,
      socialMediaHandle,
      images: imagePaths,
    });

    await newUser.save();

    // Emit an event when a new submission is added
    io.emit('newSubmission', newUser);

    res.status(200).json({ message: 'Submission successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API route to fetch all submissions
app.get('/api/submissions', async (req, res) => {
  try {
    const submissions = await User.find();
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions' });
  }
});

// Start the server
server.listen(5000, () => {
  console.log('Server is running on http://localhost:5000');
});
