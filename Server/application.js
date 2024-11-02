require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const routes = require('./routes')

const app = express()

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err))

app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json())

app.get('/config', (req, res) => {
    res.json({ googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY })
})

app.use('/api', routes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
