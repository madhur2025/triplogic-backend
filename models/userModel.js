const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    email: { type: String, unique: true }, // added
    isVerified: { type: Boolean, default: false } // added
}, { timestamps: true })

const userModel = new mongoose.model("User", userSchema)

module.exports = userModel