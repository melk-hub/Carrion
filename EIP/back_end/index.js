const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Import user routes
const userRoutes = require('./routes/users');

// Use routes defined in routes/users.js
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Bonjour, le serveur fonctionne !');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
