import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Extend the Icon.Default interface to include the private method
interface IconDefaultWithPrivateMethod extends L.Icon.Default {
  _getIconUrl?: () => string;
}

delete (L.Icon.Default.prototype as IconDefaultWithPrivateMethod)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapProps {
  height?: number;
  startPoint?: [number, number];
  endPoint?: [number, number];
  route?: LatLngExpression[];
  showRoute?: boolean;
}

const Map: React.FC<MapProps> = ({
  height = 220,
  startPoint = [21.0285, 105.8542], // Hồ Tây, Hanoi
  endPoint = [10.7769, 106.7009], // Bitexco Financial Tower, Ho Chi Minh City
  route,
  showRoute = true,
}) => {
  const defaultRoute: LatLngExpression[] = [
    [21.0285, 105.8542], // Hồ Tây
    [20.5, 106.0],
    [19.0, 106.5],
    [17.0, 106.8],
    [15.0, 107.0],
    [13.0, 106.8],
    [11.0, 106.7],
    [10.7769, 106.7009], // Bitexco Financial Tower
  ];

  const routePoints: LatLngExpression[] = route || defaultRoute;
  const center: [number, number] = [
    (startPoint[0] + endPoint[0]) / 2,
    (startPoint[1] + endPoint[1]) / 2,
  ];

  return (
    <div style={{ height, width: "100%" }}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Start Point Marker */}
        <Marker position={startPoint}>
          <Popup>
            <div>
              <strong>Điểm khởi hành</strong>
              <br />
              Hồ Tây, Hà Nội
            </div>
          </Popup>
        </Marker>

        {/* End Point Marker */}
        <Marker position={endPoint}>
          <Popup>
            <div>
              <strong>Điểm đến</strong>
              <br />
              Bitexco Financial Tower, TP.HCM
            </div>
          </Popup>
        </Marker>

        {/* Route Line */}
        {showRoute && (
          <Polyline
            positions={routePoints}
            color="#2E7D32"
            weight={3}
            opacity={0.8}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;
