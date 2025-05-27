const express = require('express');
const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Lyo Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`✅ Lyo Backend Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/v1/health`);
});
