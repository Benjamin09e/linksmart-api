const express = require('express');
const router = express.Router();

 const { 
    register, 
    login, 
    forgotPassword, 
    resetPassword 
} = require('../controllers/authController');

// Inscription et Connexion
router.post('/register', register);
router.post('/login', login);

// Mot de passe oublié
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;