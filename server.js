const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); // To load environment variables

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB Atlas
const DB_URI = process.env.MONGO_URI; // Use an environment variable for the MongoDB URI
mongoose
  .connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Task Schema and Model
const taskSchema = new mongoose.Schema({
  name: String,
  location: String,
  phone: String,
  date: { type: Date, required: true },
  notes: String,
  option: String,
  status: { type: String, default: 'Pending' },
  images: [String],
});

const Task = mongoose.model('Task', taskSchema);

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');  // Ensure uploads directory exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);  // Generate unique filenames
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only images are allowed!');
    }
  },
});

// Routes
// Create Task
app.post('/tasks', upload.array('images', 5), async (req, res) => {
  try {
    const { name, location, phone, date, notes, option, status } = req.body;

    // Ensure that the date is properly parsed into a Date object
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Check if images were uploaded
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // Create the task with images
    const task = new Task({
      name,
      location,
      phone,
      date: parsedDate,
      notes,
      option,
      status,
      images,
    });

    await task.save();
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Error creating task' });
  }
});

// Get All Tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Update Task
app.put('/tasks/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, phone, date, notes, option, status } = req.body;

    // Ensure that the date is properly parsed into a Date object
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // Handle image updates
    let images = req.body.images || []; // Check if there are any images in the body
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { name, location, phone, date: parsedDate, notes, option, status, images },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully', updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Error updating task' });
  }
});

// Delete Task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Error deleting task' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
