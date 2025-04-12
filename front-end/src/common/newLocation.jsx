import { MapComponent, MapTypes } from "@neshan-maps-platform/mapbox-gl-react";
import '@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css';

function NewLocation() {

  return (
    <MapComponent options={{ mapKey: "web.44af569172944b66a1cafc64f4131ff3", mapType: MapTypes.neshanRasterNight }} />
  );
}

export default NewLocation;
