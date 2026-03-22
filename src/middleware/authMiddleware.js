const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Accès refusé, format Bearer Token attendu" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // On injecte tout le contenu du token dans req.user
        req.user = decoded; 
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token invalide ou expiré" });
    }
};