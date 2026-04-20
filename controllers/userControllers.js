const User = require("../models/userModel")
const OTP = require("../models/otpModel")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" })
        }

        // database se old otp delete 
        await OTP.deleteMany({ email })

        // generate random OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()

        // save new OTP into databse
        const myOTP = new OTP({ email, otp, expiresAt: Date.now() + 5 * 60 * 1000 })
        await myOTP.save()
        // await OTP.create({ email, otp, expiresAt: Date.now() + 5 * 60 * 1000 })

        const transporter = require("nodemailer").createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS }
        })

        // send email
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`
        })

        res.json({ message: "OTP sent successfully" })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, otp } = req.body

        if (!username) {
            return res.status(400).json({ message: "Username is required" })
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required" })
        }
        if (!otp) {
            return res.status(400).json({ message: "OTP is required" })
        }


        // database me search krta hai esa email otp k sath hai ya nhi
        const validOtp = await OTP.findOne({ email, otp })

        if (!validOtp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }

        if (validOtp.expiresAt < Date.now()) {
            return res.status(400).json({ message: "OTP expired" })
        }

        // new added because of endpoint pr username already takend me error de rha tha
        const existingUsername = await User.findOne({ username })
        if (existingUsername) {
            return res.status(400).json({ message: "Username already taken" })
        }

        const user = new User({ name, username, email, password, isVerified: true })
        await user.save()

        await OTP.deleteMany({ email })

        res.json({ message: "User registered successfully" })

    } catch (err) {
        console.log("registerUser controller :", err)
        res.status(500).json({ message: "Something went wrong" })
    }
}

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body

        const user = await User.findOne({ username })

        if (!user) {
            return res.status(400).json({ message: "Invalid username " })
        }

        // if (!user.isVerified) { return res.status(400).json({ message: "Please verify your email first" }) }

        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" })

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password")
        res.json(user)
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findByIdAndDelete(id)

        if (!user) {
            return res.status(400).json({ message: "User Not Found" })
        }
        res.json({ message: "Account delted" })

    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
}

const setHomeLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body

        if (!latitude && !longitude) {
            return res.status(400).json({ message: "Latitude and Longitude required" })
        }
        const user = await User.findByIdAndUpdate(req.user.id,
            {
                homeLocation: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                }
            },
            { new: true }
        )
        res.json({ message: "Home loaction updated" })
    }
    catch (error) {
        res.status(500).json({ message: error.message })
    }
}

const addFavorite = async (req, res) => {
    try {
        const { placeId } = req.body;

        if (!placeId) {
            return res.status(400).json({ message: "placeId required" });
        }

        const user = await User.findById(req.user.id);

        // already added?
        if (user.favorites.some(id => id.toString() === placeId)) {
            return res.status(400).json({ message: "Already in favorites" });
        }

        user.favorites.push(placeId);
        await user.save();

        res.json({ message: "Added to favorites" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const { placeId } = req.body;

        if (!placeId) {
            return res.status(400).json({ message: "placeId required" });
        }

        const user = await User.findById(req.user.id);

        user.favorites = user.favorites.filter(
            id => id.toString() !== placeId
        );

        await user.save();

        res.json({ message: "Removed from favorites" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate("favorites");

        // null cleanup (deleted places case)
        const validFavorites = user.favorites.filter(place => place !== null);

        res.json(validFavorites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { sendOtp, registerUser, loginUser, getUserProfile, deleteUser, setHomeLocation, addFavorite, removeFavorite, getFavorites }