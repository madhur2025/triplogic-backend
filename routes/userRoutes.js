const express = require("express")
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const { sendOtp, registerUser, loginUser, getUserProfile, deleteUser, setHomeLocation, addFavorite, removeFavorite, getFavorites } = require("../controllers/userControllers")

router.post("/send-otp", sendOtp)
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profile", authMiddleware, getUserProfile)
router.delete("/delete/:id", deleteUser)
router.put("/set-home", authMiddleware, setHomeLocation)
router.post("/favorites/add", authMiddleware, addFavorite);
router.post("/favorites/remove", authMiddleware, removeFavorite);
router.get("/favorites", authMiddleware, getFavorites);
module.exports = router