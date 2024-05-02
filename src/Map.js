import React, { useState, useEffect } from 'react';

const Map = ({ stops }) => {
  const [google, setGoogle] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null); const [busMarker, setBusMarker] = useState(null); // State to hold the bus marker


  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Check if the Google Maps API script has already been added
      if (!window.google) {
        const googleMapsScript = document.createElement('script');
        googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_MAP_API_KEY}&libraries=places`;
        googleMapsScript.async = true;
        window.document.body.appendChild(googleMapsScript);
        googleMapsScript.onload = initMap;
      } else {
        initMap(); // If the API is already loaded, initialize the map directly
      }
    };

    const initMap = () => {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: stops[0],
        zoom: 12,
      });

      setGoogle(window.google);
      setDirectionsService(new window.google.maps.DirectionsService());
      setDirectionsRenderer(new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // Do not display the default markers
      }));

      stops.forEach((stop, index) => {
        if (index === 0 || index === stops.length - 1) {
          // Render default markers for start and end points
          new window.google.maps.Marker({
            position: stop,
            map: map,
          });
        } else {
          // Render white dots for other stops
          new window.google.maps.Circle({
            strokeColor: 'white',
            strokeOpacity: 6,
            strokeWeight: 9,
            fillColor: '#FFFFFF',
            fillOpacity: 1,
            map: map,
            center: stop,
            radius: 5, // Adjust the radius as needed
          });
        }
      });

      // Create the bus marker
      const busMarker = new window.google.maps.Marker({
        map: map,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/micons/bus.png', // Bus icon URL
          scaledSize: new window.google.maps.Size(40, 40), // Size of the bus icon
        },
      });
      setBusMarker(busMarker);
    };

    loadGoogleMapsScript();
  }, [stops]);

  useEffect(() => {
    if (google && directionsService && directionsRenderer && busMarker) {
      const updateBusPosition = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            busMarker.setPosition(newPosition); // Update the position of the bus marker
          },
          (error) => {
            console.error('Error getting location:', error);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      };
      const waypoints = stops.slice(1, stops.length - 1).map(stop => ({ location: stop, stopover: true }));

      const request = {
        origin: stops[0],
        destination: stops[stops.length - 1],
        waypoints: waypoints,
        travelMode: 'DRIVING',
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      });
      // Update the bus position initially
      updateBusPosition();

      // Set up an interval to update the bus position periodically (every 5 seconds in this case)
      const intervalId = setInterval(updateBusPosition, 5000);

      // Clean up the interval on component unmount
      return () => clearInterval(intervalId);
    }

  }, [google, directionsService, directionsRenderer, stops, busMarker]);

  return <div id="map" style={{ width: '100%', height: '80vh' }}></div>;
};

export default Map;