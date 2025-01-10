import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    date: new Date(),
    notes: '',
    category: '',
    subcategory: '',
    status: 'Pending',
    id: null, // For editing existing tasks
  });

  const [categoryOptions, setCategoryOptions] = useState([]);

  // Define categories and subcategories
  const categories = {
    "Commander-QSW-None Solar": [
      { model: "MCQSW-875", capacity: "500VA12V" },
      { model: "MCQSW-975", capacity: "700VA12V" },
      { model: "MCQSW-1175", capacity: "900VA12V" },
      { model: "MCQSW-1475", capacity: "1100VA12V" },
      { model: "MCQSW-1875", capacity: "1500VA24V" },
    ],
    "Elegant-SW-None Solar": [
      { model: "MESW-975", capacity: "700VA12V" },
      { model: "MESW-1175", capacity: "900VA12V" },
      { model: "MESW-1475", capacity: "1100VA12V" },
      { model: "MESW-1850", capacity: "1500VA12V" },
      { model: "MESW-2375", capacity: "2000VA24V" },
    ],
    "Bhaskara-SOLAR-PWM": [
      { model: "MBSW-1175", capacity: "900VA12V - VOC-26" },
      { model: "MBSW-1475", capacity: "1100VA12V - VOC-26" },
      { model: "MBSW-1850", capacity: "1500VA12V - VOC-26" },
      { model: "MBSW-1975", capacity: "1600VA24V - VOC-52" },
      { model: "MBSW-6075", capacity: "5500VA48V - VOC-104" },
    ],
    // Add more categories and subcategories here
  };

  useEffect(() => {
    // Fetch tasks from the backend on component mount
    axios.get('http://localhost:5000/tasks')
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => console.error('Error fetching tasks:', error));
  }, []);

  const toggleForm = () => setIsFormVisible(!isFormVisible);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setFormData({ ...formData, category: selectedCategory, subcategory: '' });
    setCategoryOptions(categories[selectedCategory] || []);
  };

  const handleDateChange = (date) => setFormData({ ...formData, date });

  const handleStatusChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, status: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const task = { ...formData };
    if (task.id) {
      // Edit an existing task
      axios.put(`http://localhost:5000/tasks/${task.id}`, task)
        .then((response) => {
          const updatedTasks = tasks.map((t) =>
            t._id === task.id ? response.data : t
          );
          setTasks(updatedTasks);
          setFormData({
            name: '',
            location: '',
            phone: '',
            date: new Date(),
            notes: '',
            category: '',
            subcategory: '',
            status: 'Pending',
            id: null,
          });
        })
        .catch((error) => console.error('Error updating task:', error));
    } else {
      // Create a new task
      axios.post('http://localhost:5000/tasks', task)
        .then((response) => {
          setTasks([...tasks, response.data]);
          setFormData({
            name: '',
            location: '',
            phone: '',
            date: new Date(),
            notes: '',
            category: '',
            subcategory: '',
            status: 'Pending',
            id: null,
          });
        })
        .catch((error) => console.error('Error creating task:', error));
    }

    toggleForm();
  };

  const handleEdit = (task) => {
    setFormData({
      name: task.name,
      location: task.location,
      phone: task.phone,
      date: new Date(task.date),
      notes: task.notes,
      category: task.category,
      subcategory: task.subcategory,
      status: task.status,
      id: task._id,
    });
    toggleForm();
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter((task) => task._id !== id));
      })
      .catch((error) => console.error('Error deleting task:', error));
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      location: '',
      phone: '',
      date: new Date(),
      notes: '',
      category: '',
      subcategory: '',
      status: 'Pending',
      id: null,
    });
    toggleForm();
  };

  return (
    <div className="Dashboard">
      <h1>Task Management</h1>
      <button onClick={toggleForm}>Add Task</button>

      {isFormVisible && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Phone No</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label>Date</label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              dateFormat="yyyy/MM/dd"
              required
            />
          </div>
          <div>
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              required
            >
              <option value="">Select Category</option>
              {Object.keys(categories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {formData.category && (
            <div>
              <label>Model</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Model</option>
                {categoryOptions.map((item) => (
                  <option key={item.model} value={item.model}>
                    {item.model} - {item.capacity}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleStatusChange}
              required
            >
              <option value="Pending">Pending</option>
              <option value="Dispatch">Dispatch</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <button type="submit">Save Task</button>
            <button type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}

      <h2>Task List</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task._id}>
            <div>
              <p><strong>Name:</strong> {task.name}</p>
              <p><strong>Location:</strong> {task.location}</p>
              <p><strong>Phone:</strong> {task.phone}</p>
              <p><strong>Date:</strong> {new Date(task.date).toLocaleDateString()}</p>
              <p><strong>Notes:</strong> {task.notes}</p>
              <p><strong>Category:</strong> {task.category}</p>
              <p><strong>Model:</strong> {task.subcategory}</p>
              <p><strong>Status:</strong> {task.status}</p>
              <button onClick={() => handleEdit(task)}>Edit</button>
              <button onClick={() => handleDelete(task._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
