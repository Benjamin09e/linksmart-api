const User = require('../models/User');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Resend } = require('resend');

// Initialisation de Resend avec ta clé API du .env
const resend = new Resend(process.env.RESEND_API_KEY);

// --- INSCRIPTION ---
exports.register = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                error: existingUser.email === email ? "Cet email est déjà utilisé" : "Ce nom d'utilisateur est déjà pris"
            });
        }

        const user = await User.create({ email, password, username });

        try {
            await Profile.create({
                user: user._id,
                username: username,
                displayName: username,
                links: []
            });
        } catch (profileError) {
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ error: "Erreur lors de la création du profil" });
        }

        return res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (err) {
        console.error("Erreur Register:", err.message);
        return res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
    }
};

// --- CONNEXION ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            token,
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        return res.status(500).json({ error: "Erreur serveur lors de la connexion" });
    }
};

// --- MOT DE PASSE OUBLIÉ (RESEND) ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: "Aucun utilisateur avec cet email" });
        }

        // Création du token de reset
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
        await user.save();

        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

        // Envoi via Resend
        const { error } = await resend.emails.send({
            from: 'LinkSmart <onboarding@resend.dev>',
            to: [user.email],
            subject: 'Réinitialisation de votre mot de passe',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h2>Réinitialisation de mot de passe</h2>
                    <p>Bonjour ${user.username}, vous avez demandé à changer votre mot de passe.</p>
                    <p>Cliquez sur le lien ci-dessous (valide 1 heure) :</p>
                    <a href="${resetUrl}" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Réinitialiser mon mot de passe
                    </a>
                </div>
            `
        });

        if (error) {
            console.error("Resend Error:", error);
            return res.status(500).json({ error: "Erreur lors de l'envoi de l'email" });
        }

        return res.json({ message: "Email de réinitialisation envoyé !" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur serveur" });
    }
};

// --- RÉINITIALISATION DU MOT DE PASSE ---
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: "Le token est invalide ou a expiré" });
        }

        user.password = password; // Sera hashé par le hook .pre('save') du modèle
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.json({ message: "Mot de passe mis à jour avec succès !" });
    } catch (err) {
        return res.status(500).json({ error: "Erreur lors de la réinitialisation" });
    }
};