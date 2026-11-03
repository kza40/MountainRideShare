const MARKER_ICONS = {
    stop: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    pickup: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    dropoff: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
}

// Main transit stops on Burnaby Mountain
const TRANSIT_STOPS = [
    { lat: 49.27980296358191, lng: -122.92015590948907, title: 'SFU Transportation Centre' },
    { lat: 49.27849990416857, lng: -122.91279484768548, title: 'UniverCity High Street' },
]

let map
let directionsService
let directionsRenderer
const markers = { pickup: null, dropoff: null }

const statusEl = document.getElementById('status')
const pickupInput = document.getElementById('pickup-location')
const dropoffInput = document.getElementById('dropoff-location')

function showStatus(message, type = 'info') {
    statusEl.textContent = message
    statusEl.className = `status status--${type}`
}

function loadGoogleMaps() {
    fetch('/config')
        .then((response) => {
            if (!response.ok) throw new Error(`Config request failed (${response.status})`)
            return response.json()
        })
        .then(({ googleMapsApiKey }) => {
            const script = document.createElement('script')
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}&libraries=places&callback=initMap`
            script.async = true
            document.head.appendChild(script)
        })
        .catch((err) => {
            console.error('Failed to load Google Maps:', err)
            showStatus('The map is unavailable right now. Please try again later.', 'error')
        })
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 49.2791, lng: -122.9202 },
        zoom: 15,
    })

    directionsService = new google.maps.DirectionsService()
    directionsRenderer = new google.maps.DirectionsRenderer()
    directionsRenderer.setMap(map)

    TRANSIT_STOPS.forEach(({ lat, lng, title }) => {
        new google.maps.Marker({ position: { lat, lng }, map, title, icon: MARKER_ICONS.stop })
    })

    setupAutocomplete(pickupInput, 'pickup', 'Pickup location')
    setupAutocomplete(dropoffInput, 'dropoff', 'Drop-off location')
}

// Attach Places autocomplete to an input and keep a single marker per field.
function setupAutocomplete(input, kind, title) {
    const autocomplete = new google.maps.places.Autocomplete(input)

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.geometry || !place.geometry.location) return

        if (markers[kind]) markers[kind].setMap(null)
        markers[kind] = new google.maps.Marker({
            position: place.geometry.location,
            map,
            title,
            icon: MARKER_ICONS[kind],
        })
        map.panTo(place.geometry.location)
    })
}

function requestRide() {
    const pickupLocation = pickupInput.value.trim()
    const dropoffLocation = dropoffInput.value.trim()

    if (!pickupLocation || !dropoffLocation) {
        showStatus('Enter both a pickup and a drop-off location.', 'error')
        return
    }
    if (!directionsService) {
        showStatus('The map is still loading. Please try again in a moment.', 'error')
        return
    }

    directionsService.route(
        { origin: pickupLocation, destination: dropoffLocation, travelMode: 'DRIVING' },
        (response, status) => {
            if (status === 'ZERO_RESULTS') {
                showStatus('No route found between those locations. Check your input.', 'error')
                return
            }
            if (status !== 'OK') {
                console.error('Directions request failed:', status)
                showStatus('Something went wrong while planning your route.', 'error')
                return
            }

            const leg = response.routes[0].legs[0]
            if (!isLocationInBC(leg.start_location) || !isLocationInBC(leg.end_location)) {
                showStatus(
                    'One or both locations are outside British Columbia. Enter locations within BC.',
                    'error',
                )
                return
            }

            directionsRenderer.setDirections(response)

            // Emissions saved = distance (km) x emissions per km (g CO2)
            const distanceKm = leg.distance.value / 1000
            const emissionsPerKm = 121.5
            const emissionsSaved = distanceKm * emissionsPerKm
            showStatus(`Emissions saved: ${emissionsSaved.toFixed(2)} g CO₂`, 'success')
        },
    )
}

function isLocationInBC(latLng) {
    const bcBounds = { north: 60.0, south: 48.3, west: -139.1, east: -114.0 }

    return (
        latLng.lat() <= bcBounds.north &&
        latLng.lat() >= bcBounds.south &&
        latLng.lng() <= bcBounds.east &&
        latLng.lng() >= bcBounds.west
    )
}

document.getElementById('request-ride').addEventListener('click', requestRide)

// The Maps script calls initMap by name once it has loaded.
window.initMap = initMap

loadGoogleMaps()
