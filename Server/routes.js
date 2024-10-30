const express = require('express')
const router = express.Router()

// Posting ride requests
router.post('/request-ride', (req, res) => {
    // Placeholder for ride request code
    res.json({ message: 'Ride requested!' })
})

// Posting route for drivers that accept rides
router.post('/accept-ride', (req, res) => {
    // Placeholder for ride acceptance code
    res.json({ message: 'Ride accepted!' })
})

module.exports = router
