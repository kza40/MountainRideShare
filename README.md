# Mountain Ride Share
A web app enabling drivers to volunteer rides down the mountain, reducing transit load and environmental impact.

## Table of Contents

1. [Features](#features)
2. [Technologies Used](#technologies-used)
3. [Getting Started](#getting-started)
4. [Installation](#installation)
5. [Usage](#usage)

## Features

- **Driver and Rider Interaction**: Allows drivers to find riders who need a lift down the mountain.
- **Location Input and Placeholder Map**: Users can specify pickup and drop-off locations with an interactive placeholder map for testing purposes.
- **Environmental Impact Display**: Shows the emissions saved by carpooling.
- **About Us Section**: Provides a friendly introduction and purpose of the Mountain Ride Share initiative.

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js with Express
- **Database**: MongoDB (for storing user and ride data)
- **API Integration**: Google Maps JavaScript API (for maps, location, and distance)

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- **Node.js**: Download and install [Node.js](https://nodejs.org/).
- **MongoDB**: Set up a MongoDB instance (e.g., MongoDB Atlas).
- **Google Maps API Key**: Sign up on the [Google Cloud Platform](https://cloud.google.com/) to obtain a Maps JavaScript API key.

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kza40/MountainRideShare.git
   cd MountainRideShare
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables.** Copy the example file and fill in your own values:

   ```bash
   cp .env.example .env
   ```

   ```bash
   MONGO_URI=your_mongodb_connection_string
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

   `.env` is git-ignored, so keep real credentials out of version control.

4. **Start the server**

   ```bash
   npm start
   ```

   The server starts on http://localhost:3000.

### Demo
![LandingPage](https://github.com/user-attachments/assets/cb70ecfb-d23d-41c0-b676-427cae259148)

Landing page



![RideRequested](https://github.com/user-attachments/assets/a8d3defa-ad9b-4f10-befc-f952891f4d43)

Ride Requested


