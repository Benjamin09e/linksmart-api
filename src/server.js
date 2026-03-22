// src/server.js
const express = require('express');
// Suppression de mongoose ici car il est déjà géré dans ton fichier config/db.js
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Connexion à la base de données (CRUCIAL)
connectDB();

// 2. Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// 3. Import des routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

// 4. Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);

// Route de test
app.get('/', (req, res) => {
    res.send('API LinkSmart en ligne 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});