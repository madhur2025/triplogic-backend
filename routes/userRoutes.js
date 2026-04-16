const express = require("express")
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const { sendOtp, registerUser, loginUser, getUserProfile } = require("../controllers/userControllers")

router.post("/send-otp", sendOtp)
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profile", authMiddleware, getUserProfile)
module.exports = router