import multer from 'multer';
import mongoose from 'mongoose';
import { join } from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp'); // Store files in the /tmp directory on Vercel
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage }).array('images', 10);

mongoose.connect('mongodb://127.0.0.1:27017/user-submissions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  name: String,
  socialMediaHandle: String,
  images: [String],
});

const User = mongoose.model('User', userSchema);

export default (req, res) => {
  if (req.method === 'POST') {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Upload failed' });
      }

      try {
        const { name, socialMediaHandle } = req.body;
        const imagePaths = req.files.map((file) => file.path);

        const newUser = new User({
          name,
          socialMediaHandle,
          images: imagePaths,
        });

        await newUser.save();
        res.status(200).json({ message: 'Submission successful!' });
      } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  } else {
    res.status(404).json({ message: 'Not found' });
  }
};

