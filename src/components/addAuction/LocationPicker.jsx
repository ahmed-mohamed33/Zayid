import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export default function LocationModal({ isOpen, onClose, onSelectLocation }) {
  const [coordinates, setCoordinates] = useState(null);

  async function fetchPlaceName(lat, lng) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name || "موقع بدون اسم";
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-[90%] md:w-[60%] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-3 text-gray-800">
          اختر موقع المعاينة
        </h3>

        <div className="mb-4 rounded-lg overflow-hidden border border-gray-300">
          <MapContainer
            center={[30.0444, 31.2357]}
            zoom={13}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationPicker
              onSelect={async (latlng) => {
                setCoordinates(latlng);
                const name = await fetchPlaceName(latlng.lat, latlng.lng);
                onSelectLocation({ ...latlng, name });
              }}
            />
          </MapContainer>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 transition"
            onClick={onClose}
          >
            إلغاء
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50"
            disabled={!coordinates}
            onClick={onClose}
          >
            تأكيد الموقع
          </button>
        </div>
      </div>
    </div>
  );
}
