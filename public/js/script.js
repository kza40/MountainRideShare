let map // Global variable for map
let pickupMarker // pickup marker
let dropoffMarker // dropoff marker

// Initializing google maps
function initMap() {
    
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 49.2791, lng: 122.9202 }, // SFU's burnaby campus coordinates
        zoom: 14 
    })

    // Getting the input fields for pickup and drop off locations
    const inputPickup = document.getElementById("pickup-location")
    const inputDropoff = document.getElementById("dropoff-location")

    const autocompletePickup = new google.maps.places.Autocomplete(inputPickup)
    const autocompleteDropoff = new google.maps.places.Autocomplete(inputDropoff)

    // Waiting for a place to be selected
    autocompletePickup.addListener("place_changed", () => {
        const place = autocompletePickup.getPlace() 
        if (place.geometry && place.geometry.location) {
           
            if (pickupMarker) {
                pickupMarker.setMap(null)
            }

            
            pickupMarker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: "Pickup Location",
                icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
            })

            map.panTo(place.geometry.location) 
        }
    })

    // Adjusting dropoff location
    autocompleteDropoff.addListener("place_changed", () => {
        const place = autocompleteDropoff.getPlace() 
        if (place.geometry && place.geometry.location) {
           
            if (dropoffMarker) {
                dropoffMarker.setMap(null)
            }

            
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

// Function to request a ride
function requestRide() {
    const pickupLocation = document.getElementById("pickup-location").value
    const dropoffLocation = document.getElementById("dropoff-location").value

      // Simulate saving emissions with placeholder data
      document.getElementById("emissions-saved").innerText = `Emissions saved: ${Math.random().toFixed(2) * 100} g CO₂`;
      console.log("Request Ride clicked:", pickupLocation, dropoffLocation);
    // // Using google.maps to get the exact coordinates
    // const geocoder = new google.maps.Geocoder();

    // Promise.all([
    //     geocodeLocation(geocoder, pickupLocation),
    //     geocodeLocation(geocoder, dropoffLocation)
    // ]).then(([pickupLatLng, dropoffLatLng]) => {
    //     calculateDistanceAndEmissions(pickupLatLng, dropoffLatLng)
    // }).catch(error => console.error('Geocoding error:', error))
}

// Helper function to get the exact coordinates
function geocodeLocation(geocoder, address) {
    return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
            if (status === 'OK') {
                resolve(results[0].geometry.location)
            } else {
                reject(status)
            }
        })
    })
}

// Calculating the emissions saving
function calculateDistanceAndEmissions(pickupLatLng, dropoffLatLng) {
    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix({
        origins: [pickupLatLng],
        destinations: [dropoffLatLng],
        travelMode: 'DRIVING',
    }, (response, status) => {
        if (status === 'OK') {
            const distanceMeters = response.rows[0].elements[0].distance.value; // done in meters
            const distanceKm = distanceMeters / 1000; // Converting to kilometers

            // Calculate estimated CO2 saving
            const emissionsPerKm = 121.5; // grams CO2 per kilometer
            const emissionsSaved = distanceKm * emissionsPerKm;

            // Displaying the emissions saved to the user
            document.getElementById("emissions-saved").innerText = `Emissions saved: ${emissionsSaved.toFixed(2)} g CO₂`;
        } else {
            console.error('Distance Matrix request failed:', status);
        }
    });
}

// Making initMap accessible by Google Maps API
window.initMap = initMap