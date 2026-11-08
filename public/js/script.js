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

// Service area: pickups on Burnaby Mountain, drop-offs anywhere in Metro Vancouver
const SFU_BURNABY = { lat: 49.2781, lng: -122.9199 }
const PICKUP_RADIUS_KM = 2.5
const METRO_VANCOUVER_BOUNDS = { north: 49.45, south: 49.0, west: -123.3, east: -122.4 }

// Assumed tailpipe emissions of an average passenger car, in grams of CO2 per km.
// A rider who joins a driver already heading down avoids making this trip alone.
const CAR_EMISSIONS_G_PER_KM = 121.5

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
    const autocomplete = new google.maps.places.Autocomplete(input, {
        bounds: METRO_VANCOUVER_BOUNDS,
        componentRestrictions: { country: 'ca' },
        fields: ['geometry', 'name', 'formatted_address'],
    })

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
            if (!isOnBurnabyMountain(leg.start_location)) {
                showStatus(
                    `Pickups must be on Burnaby Mountain (within ${PICKUP_RADIUS_KM} km of SFU).`,
                    'error',
                )
                return
            }
            if (!isInMetroVancouver(leg.end_location)) {
                showStatus('Drop-offs must be within Metro Vancouver.', 'error')
                return
            }

            directionsRenderer.setDirections(response)

            const tripKm = leg.distance.value / 1000
            const co2Grams = estimateCo2AvoidedGrams(tripKm)
            showStatus(
                `Estimated CO₂ avoided vs. driving alone: ${formatCo2(co2Grams)} (${tripKm.toFixed(1)} km trip)`,
                'success',
            )
        },
    )
}

function estimateCo2AvoidedGrams(tripKm) {
    return tripKm * CAR_EMISSIONS_G_PER_KM
}

function formatCo2(grams) {
    return grams >= 1000 ? `${(grams / 1000).toFixed(2)} kg` : `${Math.round(grams)} g`
}

// Great-circle distance between two { lat, lng } points (haversine formula)
function distanceKm(a, b) {
    const toRad = (deg) => (deg * Math.PI) / 180
    const dLat = toRad(b.lat - a.lat)
    const dLng = toRad(b.lng - a.lng)
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
    return 2 * 6371 * Math.asin(Math.sqrt(h))
}

function isOnBurnabyMountain(latLng) {
    return distanceKm(SFU_BURNABY, { lat: latLng.lat(), lng: latLng.lng() }) <= PICKUP_RADIUS_KM
}

function isInMetroVancouver(latLng) {
    const { north, south, west, east } = METRO_VANCOUVER_BOUNDS
    return (
        latLng.lat() <= north &&
        latLng.lat() >= south &&
        latLng.lng() >= west &&
        latLng.lng() <= east
    )
}

document.getElementById('request-ride').addEventListener('click', requestRide)

// The Maps script calls initMap by name once it has loaded.
window.initMap = initMap

loadGoogleMaps()
