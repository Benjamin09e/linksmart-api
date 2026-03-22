const Profile = require('../models/Profile');

// --- PRIVÉ : Créer un profil ---
exports.createProfile = async (req, res) => {
    try {
        const { username, displayName, bio } = req.body;

        if (!username) return res.status(400).json({ error: "Le username est obligatoire." });

        const profileExists = await Profile.findOne({ user: req.user.id });
        if (profileExists) {
            return res.status(400).json({ error: "Le profil existe déjà." });
        }

        const newProfile = new Profile({
            user: req.user.id,
            username,
            displayName: displayName || username,
            bio: bio || "",
            links: []
        });

        await newProfile.save();
        res.status(201).json(newProfile);
    } catch (err) {
        console.error("Erreur création:", err);
        res.status(500).json({ error: "Erreur lors de la création." });
    }
};

// --- PRIVÉ : Ajouter un lien ---
exports.addLink = async (req, res) => {
    try {
        const { label, url, platform } = req.body;

        if (!label || !url) {
            return res.status(400).json({ error: "Label et URL sont requis." });
        }

        const updatedProfile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $push: { links: { label, url, platform } } },
            { new: true, runValidators: true }
        );

        if (!updatedProfile) return res.status(404).json({ error: "Profil non trouvé." });
        res.status(200).json(updatedProfile);
    } catch (err) {
        console.error("Erreur ajout lien:", err);
        res.status(500).json({ error: "Erreur lors de l'ajout du lien." });
    }
};

// --- PRIVÉ : Récupérer mon profil ---
exports.getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (!profile) return res.status(404).json({ error: "Profil introuvable." });
        res.status(200).json(profile);
    } catch (err) {
        console.error("Erreur GetMyProfile:", err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

// --- PRIVÉ : Mettre à jour globalement ---
exports.updateProfile = async (req, res) => {
    try {
        // Sécurité : on n'autorise que certains champs à la modification
        const { displayName, bio, avatar, theme } = req.body;

        const updatedProfile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: { displayName, bio, avatar, theme } }, // Ne pas utiliser req.body directement
            { new: true, runValidators: true }
        );

        if (!updatedProfile) return res.status(404).json({ error: "Profil non trouvé." });
        res.status(200).json(updatedProfile);
    } catch (err) {
        console.error("Erreur mise à jour:", err);
        res.status(500).json({ error: "Erreur lors de la mise à jour." });
    }
};

// --- PUBLIC : Récupérer par username ---
exports.getProfileByUsername = async (req, res) => {
    try {
        const profile = await Profile.findOne({ username: req.params.username });
        if (!profile) return res.status(404).json({ error: "Profil inexistant." });
        res.status(200).json(profile);
    } catch (err) {
        console.error("Erreur public profil:", err);
        res.status(500).json({ error: "Erreur récupération profil." });
    }
};