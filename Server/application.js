require('dotenv').config() // Using dotenv to load MONGO
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const routes = require('./routes') // Importing the routes

const app = express()

// Connect to MongoDB and logging the erros if there are any
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err))


app.use(express.static(path.join(__dirname, '../public')))
app.use(express.json()) // Parsing JSON bodies for API requests that will be used
app.use('/api', routes) 

// Setting up server on PORT and defaulting to 3000 if not predetermined
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
