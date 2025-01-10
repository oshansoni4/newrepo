const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://oshan:oshan%40work1234@cluster0.2txxi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Define the Task schema
const taskSchema = new mongoose.Schema({
  name: String,
  location: String,
  phone: String,
  date: Date,
  notes: String,
  category: String,
  subcategory: String,
  status: String,
});

// Create Task model
const Task = mongoose.model('Task', taskSchema);

// Routes

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const { name, location, phone, date, notes, category, subcategory, status } = req.body;
  
  const task = new Task({
    name,
    location,
    phone,
    date,
    notes,
    category,
    subcategory,
    status,
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a task
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { name, location, phone, date, notes, category, subcategory, status } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(id, {
      name,
      location,
      phone,
      date,
      notes,
      category,
      subcategory,
      status,
    }, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
