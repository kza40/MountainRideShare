const express = require('express')

const router = express.Router()

// Planned ride-matching API (see Roadmap in README.md). These endpoints are
// stubs and return 501 so clients cannot mistake them for working features.
const notImplemented = (req, res) => {
    res.status(501).json({ error: 'Not implemented yet' })
}

// TODO: persist a ride request (pickup, drop-off, rider) to MongoDB
router.post('/request-ride', notImplemented)

// TODO: let a driver accept an open ride request
router.post('/accept-ride', notImplemented)

module.exports = router
