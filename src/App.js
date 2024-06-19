// App.js

import React from 'react';
import Map from './Map';
import RealTimeTracking from './RealtimeTracking';

const stops = [
  { lat: -1.939826787816454, lng: 30.0445426438232 }, // Nyabugogo
  { lat: -1.9355377074007851, lng: 30.060163829002217 }, // Stop A
  { lat: -1.9358808342336546, lng: 30.08024820994666 }, // Stop B
  { lat: -1.9489196023037583, lng: 30.092607828989397 }, // Stop C
  { lat: -1.9592132952818164, lng: 30.106684061788073 }, // Stop D
  { lat: -1.9487480402200394, lng: 30.126596781356923 }, // Stop E
  { lat: -1.9365670876910166, lng: 30.13020167024439 }, // Kimironko
];

const App = () => {
  return (
    <div>
      <h1>Ride Share Tracking Fiacre</h1>
      <RealTimeTracking stops={stops}  />
      <Map stops={stops} />
    </div>
  );
};

export default App;
