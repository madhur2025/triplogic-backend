const Place = require('../models/placeModel')

const getAllPlaces = async (req, res) => {
    try {
        const places = await Place.find()
        if (!places) {
            return res.json({ message: "No data found" })
        }
        res.json(places)
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const createPlace = async (req, res) => {
    try {
        const { name, description, categories, latitude, longitude, city, state, highlights, images } = req.body

        // const formattedImages = images.map(img => `/images/${img}`) // images k name k aage /images/ add kr dega

        // const place = new Place({
        //     name, description, city, state, highlights, categories, images: formattedImages, location: { type: "Point", coordinates: [longitude, latitude] }
        // })

         const place = new Place({
            name, description, city, state, highlights, categories, images, location: { type: "Point", coordinates: [longitude, latitude] }
        })

        await place.save()
        res.status(201).json({ success: true, data: place })
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: error.message })
    }
}

const getPlace = async (req, res) => {
    try {
        const { id } = req.params
        const place = await Place.findById(id)

        if (!place) {
            return res.status(404).json({ message: "Place Not Found" })
        }
        res.json({ success: true, data: place })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const deletePlace = async (req, res) => {
    try {
        const { id } = req.params
        const place = await Place.findByIdAndDelete(id)

        if (!place) {
            return res.status(400).json({ message: "Place Not Found" })
        }
        res.json({ message: "Place deleted" })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const updatePlace = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description, categories, latitude, longitude, city, state, highlights, images } = req.body

        const place = await Place.findByIdAndUpdate(id, {
            name, description, city, state, highlights, categories, images, location: { type: "Point", coordinates: [longitude, latitude] }
        }, {
            new: true,
            runValidators: true
        })

        if (!place) {
            return res.status(400).json({ message: "Place Not Found" })
        }
        res.json({ message: "Place data updated", data: place })
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

const filteredPlaces = async (req, res) => {
    try {
        let { lat, lng, distance, categories } = req.query;

        // 🧠 STEP 1: Validate location
        const hasLocation = lat && lng && lat !== "null" && lng !== "null" && !isNaN(Number(lat)) && !isNaN(Number(lng));

        // 🧠 STEP 2: Build category filter
        let query = {};

        if (categories && categories.trim() !== "") {
            const catArray = categories.split(",").map(c => c.trim());
            query.categories = { $in: catArray };
        }

        // 🧠 STEP 3: Invalid case (distance without location)
        if (!hasLocation && distance) {
            return res.status(400).json({
                success: false,
                message: "Location is required for distance filter"
            });
        }

        let places;

        // 🚀 CASE 1: Location available → use GEO
        if (hasLocation) {
            let geoOptions = {
                near: {
                    type: "Point",
                    coordinates: [Number(lng), Number(lat)]
                },
                distanceField: "distance", // meters
                spherical: true,
                query: query // category filter yahi apply hoga
            };

            // 📏 Apply distance only if selected
            if (distance && !isNaN(Number(distance))) {
                geoOptions.maxDistance = Number(distance) * 1000; // km → meters
            }

            places = await Place.aggregate([
                { $geoNear: geoOptions }
            ]);

            // 🔄 convert meters → km (frontend friendly)
            places = places.map(p => ({
                ...p,
                distance: (p.distance / 1000).toFixed(2) // km
            }));

        }

        // 🚀 CASE 2: No location → simple query
        else {
            places = await Place.find(query).lean();
        }

        // ✅ FINAL RESPONSE
        res.json(places);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { getAllPlaces, createPlace, getPlace, updatePlace, deletePlace, filteredPlaces }