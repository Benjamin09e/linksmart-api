const express = require('express');
const router = express.Router();
const {
    getProfileByUsername,
    getMyProfile,
    updateProfile,
    createProfile,
    addLink // <--- Importé ici
} = require('../controllers/profileController');
const protect = require('../middleware/authMiddleware');

// 1. Création (POST /api/profiles)
router.post('/', protect, createProfile);

// 2. Dashboard (GET /api/profiles/me)
router.get('/me', protect, getMyProfile);

// 3. Ajouter un lien spécifique (PATCH /api/profiles/links)
router.patch('/links', protect, addLink);

// 4. Update globale (PUT /api/profiles/me)
router.put('/me', protect, updateProfile);

// 5. Public (GET /api/profiles/:username)
router.get('/:username', getProfileByUsername);

module.exports = router;