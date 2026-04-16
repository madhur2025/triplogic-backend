const mongoose = require('mongoose')

const placeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    images: [String],
    highlights: [String],
    categories: [{
        type: String, enum: ["tourist", "religious", "adventure", "historical",
            "nature", "waterfront", "garden", "wildlife", "viewpoint"]
    }],
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], require: true }
    }
}, { timestamps: true })

placeSchema.index({ location: "2dsphere" });
const placeModel = new mongoose.model("Place", placeSchema)

module.exports = placeModel