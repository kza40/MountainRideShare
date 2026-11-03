// loading the env file
require('dotenv').config()

//importing required modules
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const routes = require('./routes')

// initializing express
const app = express()

// using mongoose to connect to MongoDB + error handling
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err))

// giving user access to the frontend
app.use(express.static(path.join(__dirname, '../public')))

// JSON parsing
app.use(express.json())

// requesting googleMaps Api key from config
app.get('/config', (req, res) => {
    res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY })
})

app.use('/api', routes)

// starting server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
