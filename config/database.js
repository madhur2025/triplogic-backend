const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const URL = process.env.MONGODB_URL

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(URL)
        console.log("MongoDB connected")
        // console.log("MongoDB connected",conn.connection.host)
    }
    catch (err) {
        console.error(err.message)
        process.exit(1)
    }
}
module.exports = connectDB

// Error kb aayega ?
// wrong port use kr rhe ho tb error aayega
// mongodb server band hai tb error aayega(win + r -> services.msc -> enter -> mongoDB server -> start/stop)
// wrong username / password in mongodb atlas
// invalid url format