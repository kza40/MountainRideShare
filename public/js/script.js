// Initialize map and markers
let map 
let pickupMarker 
let dropoffMarker 
let directionsService 
let directionsRenderer 

fetch('/config')
    .then(response => response.json())
    .then(config => {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.googleMapsApiKey}&libraries=places&callback=initMap`
        script.async = true
        document.head.appendChild(script)
    })
    .catch(err => console.error('Failed to load Google Maps API key:', err))

function initMap() {
   map = new google.maps.Map(document.getElementById("map"), {
       center: { lat: 49.2791, lng: -122.9202 }, 
       zoom: 15
   })

   directionsService = new google.maps.DirectionsService()
   directionsRenderer = new google.maps.DirectionsRenderer()
   directionsRenderer.setMap(map)

   const transportationCenters = [
       { lat: 49.27980296358191, lng: -122.92015590948907, title: "Transportation Center 1" },
       { lat: 49.27849990416857, lng: -122.91279484768548, title: "Transportation Center 2" }
   ]

   transportationCenters.forEach(center => {
       new google.maps.Marker({
           position: { lat: center.lat, lng: center.lng },
           map: map,
           title: center.title,
           icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
       })
   })

   const inputPickup = document.getElementById("pickup-location")
   const inputDropoff = document.getElementById("dropoff-location")

   const autocompletePickup = new google.maps.places.Autocomplete(inputPickup)
   const autocompleteDropoff = new google.maps.places.Autocomplete(inputDropoff)

   autocompletePickup.addListener("place_changed", () => {
       const place = autocompletePickup.getPlace()
       if (place.geometry && place.geometry.location) {
           if (pickupMarker) pickupMarker.setMap(null)

           pickupMarker = new google.maps.Marker({
               position: place.geometry.location,
               map: map,
               title: "Pickup Location",
               icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
           })
           map.panTo(place.geometry.location)
       }
   })

   autocompleteDropoff.addListener("place_changed", () => {
       const place = autocompleteDropoff.getPlace()
       if (place.geometry && place.geometry.location) {
           if (dropoffMarker) dropoffMarker.setMap(null)

           dropoffMarker = new google.maps.Marker({
               position: place.geometry.location,
               map: map,
               title: "Dropoff Location",
               icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
           })
           map.panTo(place.geometry.location)
       }
   })
}

function requestRide() {
    const pickupLocation = document.getElementById("pickup-location").value
    const dropoffLocation = document.getElementById("dropoff-location").value

    if (pickupLocation && dropoffLocation) {
        directionsService.route(
            {
                origin: pickupLocation,
                destination: dropoffLocation,
                travelMode: 'DRIVING',
            },
            (response, status) => {
                if (status === 'OK') {
                    const pickupLatLng = response.routes[0].legs[0].start_location
                    const dropoffLatLng = response.routes[0].legs[0].end_location

                    if (!isLocationInBC(pickupLatLng) || !isLocationInBC(dropoffLatLng)) {
                        alert('One or both locations are outside of British Columbia. Enter valid locations within BC.')
                        return
                    }

                    directionsRenderer.setDirections(response)

                    //calculating CO2 using this formula: Emissions saved=Distance (in km)×Emissions per km (g CO₂)
                    const distanceMeters = response.routes[0].legs[0].distance.value
                    const distanceKm = distanceMeters / 1000
                    const emissionsPerKm = 121.5 
                    const emissionsSaved = distanceKm * emissionsPerKm

                    document.getElementById("emissions-saved").innerText = `Emissions saved: ${emissionsSaved.toFixed(2)} g CO₂`
                    console.log("Request Ride clicked:", pickupLocation, dropoffLocation)
                } else if (status === 'ZERO_RESULTS') {
                    alert('Could not find a route for the entered locations. Check your input.')
                } else {
                    console.error('Directions request failed:', status)
                    alert('Error occurred while processing your request.')
                }
            }
        )
    } else {
        alert("Enter both pickup and drop-off locations.")
    }
}

function isLocationInBC(latLng) {
    const bcBounds = {
        north: 60.0,
        south: 48.3,
        west: -139.1,
        east: -114.0
    }

    return latLng.lat() <= bcBounds.north && latLng.lat() >= bcBounds.south &&
           latLng.lng() <= bcBounds.east && latLng.lng() >= bcBounds.west
}

window.initMap = initMap
