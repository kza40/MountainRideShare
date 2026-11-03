require('dotenv').config()

const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const routes = require('./routes')

const PORT = process.env.PORT || 3000
const { MONGO_URI, GOOGLE_MAPS_API_KEY } = process.env

const app = express()

// The ride API is not implemented yet, so the server runs without a database
// when MONGO_URI is unset instead of failing on startup.
if (MONGO_URI) {
    mongoose
        .connect(MONGO_URI)
        .then(() => console.log('MongoDB connected'))
        .catch((err) => console.error('MongoDB connection failed:', err.message))
} else {
    console.warn('MONGO_URI is not set; starting without a database connection')
}

app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())

// The Maps JavaScript API key is used in the browser, so it is public by design.
// Restrict it to your domain (HTTP referrer restriction) in Google Cloud Console.
app.get('/config', (req, res) => {
    if (!GOOGLE_MAPS_API_KEY) {
        return res.status(503).json({ error: 'GOOGLE_MAPS_API_KEY is not configured' })
    }
    res.json({ googleMapsApiKey: GOOGLE_MAPS_API_KEY })
})

app.use('/api', routes)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
