import React, { useState, useEffect } from 'react';

async function getNameFromCoordinates(latitude, longitude) {
    // Replace 'YOUR_API_KEY' with your actual Google Maps API key
    const apiKey = process.env.REACT_APP_MAP_API_KEY;
    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === "OK" && data.results.length > 0) {
                return data.results[0].formatted_address;
            } else {
                return "Unknown";
            }
        })
        .catch(error => {
            console.error("Error fetching location:", error);
            return "Unknown";
        });
}

// Define findNearestStop and calculateDistance outside the component to prevent recreation on each render
const findNearestStop = (currentLocation, stops) => {
    let minDistance = Infinity;
    let nearestStop = null;
    let nextStop = null;

    stops.forEach((stop, index) => {
        const distance = calculateDistance(currentLocation, stop);
        if (distance < minDistance) {
            minDistance = distance;
            nearestStop = stop;
        }
        // Check if the stop is the next stop
        if (distance > 0.1 && !nextStop) {
            nextStop = stop;
        }
    });

    return { nearestStop, nextStop };
};

const calculateDistance = (point1, point2) => {
    const lat1 = point1.lat;
    const lon1 = point1.lng;
    const lat2 = point2.lat;
    const lon2 = point2.lng;

    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
};

const RealTimeTracking = ({ stops }) => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [nearestStop, setNearestStop] = useState(null);
    const [nextStop, setNextStop] = useState(null);
    const [distanceRemaining, setDistanceRemaining] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(null);
    const averageDrivingSpeed = 50; // Average driving speed in km/h

    useEffect(() => {
        const watchId = navigator.geolocation?.watchPosition(
            (position) => {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error('Error getting location:', error);
                setCurrentLocation(null); // Reset currentLocation if there's an error
            },
            { enableHighAccuracy: true, timeout: 2000, maximumAge: 1000 }
        );

        return () => navigator.geolocation?.clearWatch(watchId);
    }, []);

    useEffect(() => {
        // Define a function to calculate distance and time remaining
        const updateDistanceAndTimeRemaining = async () => {
            if (currentLocation && stops && stops.length > 0) {
                const { nearestStop, nextStop } = findNearestStop(currentLocation, stops);
                if (nearestStop) {
                    const distanceToStop = calculateDistance(currentLocation, nearestStop);
                    const timeToStop = distanceToStop / averageDrivingSpeed;
                    const nextStopName = await getNameFromCoordinates(nextStop.lat, nextStop.lng);
                    const nearestStopName = await getNameFromCoordinates(nearestStop.lat, nearestStop.lng);

                    setNearestStop({ ...nearestStop, name: nearestStopName });
                    setNextStop({ ...nextStop, name: nextStopName });
                    setDistanceRemaining(distanceToStop);
                    setTimeRemaining(timeToStop);
                }
            }
        };

        // Call the function initially
        updateDistanceAndTimeRemaining();

        // Set up an interval to update distance and time remaining periodically (every 10 seconds in this case)
        const intervalId = setInterval(updateDistanceAndTimeRemaining, 1000);

        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, [currentLocation, stops]);

    return (
        <div>
            {currentLocation ? (
                <div>
                    <p style={{ textAlign: 'center' }}>next stop name: {nextStop ? nextStop.name : (nearestStop ? nearestStop.name : 'N/A')}</p>
                    {distanceRemaining !== null && timeRemaining !== null ? (
                        <div style={{ display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-around' }}>
                            <p>Distance Remaining: {distanceRemaining.toFixed(2)} km</p>
                            <p>Estimated Time of Arrival: {formatTime(timeRemaining)}</p>
                        </div>
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

const formatTime = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}min`;
};

export default RealTimeTracking;
