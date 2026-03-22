const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true, unique: true },
    displayName: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    links: [
        {
            label: { type: String, required: true }, // Changé 'title' en 'label'
            url: { type: String, required: true },
            platform: { type: String, default: "" } // Changé 'icon' en 'platform'
        }
    ],
    theme: { type: String, default: "light" },
    views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);