const express = require('express')

// step 1 : npm install dotenv
// step 2 : import env
const dotenv = require('dotenv')

// step 4 : npm install mongoose
// step 5 : create config folder > create database.js > write DB connection code
// step 6 : import database.js in server.js
const connectDB = require('./config/database')

// step 11 : npm install cors
// step 12 : import cors
const cors = require('cors')

// step 9 : module route import
const userRoutes = require('./routes/userRoutes')
const placeRoutes = require('./routes/placeRoutes')

const app = express()

const corsOptions = {
    origin: 'https://triplogic-frontend-psi.vercel.app',
    optionsSuccessStatus: 200
};

// step 13 : use cors
// app.use(cors(corsOptions))
app.use(cors())

// step 3 : load the env.config
dotenv.config()

// step 8 : body parser handle encoded data 
app.use(express.json())

// step 10 : moudle route ko use krna
app.use('/api/users', userRoutes)
app.use('/api/places', placeRoutes)

app.get('/', (req, res) => {
    res.send("This is base URL page of server")
})

// port fallback taki .env me PORT na mile toh 5000 pr chale
const PORT = process.env.SERVER_PORT || 5000

// step 7 : execute the function
connectDB()

app.listen(PORT, () => {
    console.log("Server is running on port", PORT)
})