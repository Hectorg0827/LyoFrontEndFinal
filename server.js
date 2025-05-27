const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for development
const users = new Map();
const courses = new Map();
const posts = new Map();

// Initialize with demo data
users.set('admin@lyo.ai', {
  id: 'admin-123',
  name: 'Admin User',
  email: 'admin@lyo.ai',
  password: 'admin123',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4'
});

users.set('demo@lyo.ai', {
  id: 'demo-456',
  name: 'Demo User',
  email: 'demo@lyo.ai',
  password: 'demo123',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Demo+User'
});

// Demo courses
courses.set('course-1', {
  id: 'course-1',
  title: 'Introduction to AI',
  description: 'Learn the basics of artificial intelligence and machine learning',
  instructor: 'Prof. Alex Chen',
  duration: '4 weeks',
  level: 'beginner',
  image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop',
  enrolled: 1234,
  rating: 4.8,
  lessons: [
    { id: 'lesson-1', title: 'What is AI?', duration: '15 min' },
    { id: 'lesson-2', title: 'Types of AI', duration: '20 min' },
    { id: 'lesson-3', title: 'AI Applications', duration: '25 min' }
  ]
});

courses.set('course-2', {
  id: 'course-2',
  title: 'Machine Learning Fundamentals',
  description: 'Master the fundamentals of machine learning algorithms',
  instructor: 'Dr. Maria Rodriguez',
  duration: '6 weeks',
  level: 'intermediate',
  image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop',
  enrolled: 856,
  rating: 4.9,
  lessons: [
    { id: 'lesson-4', title: 'Linear Regression', duration: '30 min' },
    { id: 'lesson-5', title: 'Decision Trees', duration: '35 min' },
    { id: 'lesson-6', title: 'Neural Networks', duration: '40 min' }
  ]
});

// Demo posts
posts.set('post-1', {
  id: 'post-1',
  title: 'Welcome to Lyo!',
  content: 'Welcome to Lyo, your AI-powered learning companion! We\'re excited to help you on your learning journey.',
  author: 'Lyo Team',
  authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Lyo+Team',
  timestamp: new Date().toISOString(),
  likes: 42,
  comments: 5,
  tags: ['welcome', 'announcement']
});

posts.set('post-2', {
  id: 'post-2',
  title: 'AI-Powered Learning Tips',
  content: 'Here are 5 ways AI can enhance your learning experience: 1) Personalized content, 2) Adaptive assessments, 3) Real-time feedback, 4) Study scheduling, 5) Progress tracking.',
  author: 'Dr. Sarah Johnson',
  authorAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Sarah+Johnson',
  timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  likes: 28,
  comments: 8,
  tags: ['learning', 'ai', 'tips']
});

// Health endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Lyo Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Authentication endpoints
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.get(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = `token-${uuidv4()}`;
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  });
});

app.post('/api/v1/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (users.has(email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const userId = uuidv4();
  const user = {
    id: userId,
    name,
    email,
    password,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  };
  
  users.set(email, user);
  
  const token = `token-${uuidv4()}`;
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    }
  });
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// User endpoints
app.get('/api/v1/user/profile', (req, res) => {
  // For demo, return the admin user profile
  const admin = users.get('admin@lyo.ai');
  res.json({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    avatar: admin.avatar
  });
});

// Feed endpoints
app.get('/api/v1/feed', (req, res) => {
  const postsArray = Array.from(posts.values());
  res.json({
    posts: postsArray,
    total: postsArray.length,
    page: 1
  });
});

// Course endpoints
app.get('/api/v1/courses', (req, res) => {
  const coursesArray = Array.from(courses.values());
  res.json({
    courses: coursesArray,
    total: coursesArray.length
  });
});

app.get('/api/v1/courses/:id', (req, res) => {
  const course = courses.get(req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  res.json(course);
});

// Avatar endpoints
app.get('/api/v1/avatar/conversation', (req, res) => {
  res.json({
    messages: [
      {
        id: 'msg-1',
        text: 'Hello! I\'m your AI learning assistant. How can I help you today?',
        sender: 'avatar',
        timestamp: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/v1/avatar/message', (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  let response;
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('hello') || lowerText.includes('hi')) {
    response = 'Hello! Nice to meet you. What would you like to learn today?';
  } else if (lowerText.includes('help')) {
    response = 'I\'m here to help you learn! You can ask me about courses, concepts, or study tips.';
  } else if (lowerText.includes('course')) {
    response = 'We have amazing courses available! Check out our AI and Machine Learning courses to get started.';
  } else if (lowerText.includes('ai') || lowerText.includes('artificial intelligence')) {
    response = 'AI is fascinating! It\'s the simulation of human intelligence in machines. Would you like to learn more about specific AI topics?';
  } else {
    response = `That's an interesting question about "${text}". Let me help you explore that topic further!`;
  }
  
  res.json({
    id: uuidv4(),
    text: response,
    sender: 'avatar',
    timestamp: new Date().toISOString()
  });
});

// Search endpoints
app.get('/api/v1/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json({ results: [], total: 0 });
  }

  const query = q.toLowerCase();
  const results = [];
  
  // Search courses
  for (const course of courses.values()) {
    if (course.title.toLowerCase().includes(query) || 
        course.description.toLowerCase().includes(query)) {
      results.push({ type: 'course', ...course });
    }
  }
  
  // Search posts
  for (const post of posts.values()) {
    if (post.title.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query)) {
      results.push({ type: 'post', ...post });
    }
  }
  
  res.json({
    results,
    total: results.length,
    query: q
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Lyo Backend Server Started!');
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`📚 Available endpoints:`);
  console.log(`   POST /api/v1/auth/login`);
  console.log(`   POST /api/v1/auth/register`);
  console.log(`   GET  /api/v1/courses`);
  console.log(`   GET  /api/v1/feed`);
  console.log(`   POST /api/v1/avatar/message`);
  console.log(`\n✅ Backend ready for frontend connection!`);
});
