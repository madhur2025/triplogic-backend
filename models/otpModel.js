const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema(
    // {email: String,otp: String,expiresAt: Date}
    {
        email: String,
        otp: String,
        expiresAt: {
            type: Date,
            required: true
        }
    }
)
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
const otpModel = new mongoose.model("OTP", otpSchema)

module.exports = otpModel