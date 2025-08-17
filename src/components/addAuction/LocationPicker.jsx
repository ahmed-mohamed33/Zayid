import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function SearchField({ onSelect }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      autoComplete: true,
      autoCompleteDelay: 300,
      showMarker: true,
      marker: {
        icon: L.icon({
          iconUrl: '/marker-icon.png',
          shadowUrl: '/marker-shadow.png',
        }),
        draggable: false,
      },
      keepResult: true,
    });

    map.addControl(searchControl);

    map.on('geosearch/showlocation', (result) => {
      const { x: lng, y: lat, label } = result.location;
      onSelect({ lat, lng, name: label });
    });

    setTimeout(() => {
      const input = document.querySelector('.leaflet-control-geosearch input');
      if (input) {
        input.style.padding = '12px 16px';
        input.style.marginLeft = '0';

        input.addEventListener('input', (e) => {
          if (e.target.value.trim().length === 0) {
            const msg = document.querySelector('.no-results-msg');
            if (msg) msg.remove();
          }
        });

        input.addEventListener('focus', () => {
          input.style.outline = 'none';
        });
        input.addEventListener('blur', () => {
          input.style.border = '1px solid #ccc';
        });
      }

      const form = document.querySelector('.leaflet-control-geosearch form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const query = input.value.trim();
          if (query) {
            const results = await provider.search({ query });
            if (results.length === 0) {
              let msg = document.querySelector('.no-results-msg');
              if (!msg) {
                msg = document.createElement('div');
                msg.className = 'no-results-msg';
                msg.style.color = 'red';
                msg.style.fontSize = '0.9rem';
                msg.style.marginTop = '4px';
                msg.textContent = '⚠️ لا يوجد مكان بهذا الاسم';
                input.parentNode.appendChild(msg);
              }
            }
          }
        });
      }
    }, 100);

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation');
    };
  }, [map, onSelect]);

  return null;
}

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
    return data.display_name || 'موقع بدون اسم';
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
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <SearchField
              onSelect={(loc) => {
                setCoordinates(loc); // loc = {lat, lng, name}
              }}
            />

            <LocationPicker
              onSelect={async (latlng) => {
                const name = await fetchPlaceName(latlng.lat, latlng.lng);
                setCoordinates({ ...latlng, name });
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
            onClick={() => {
              if (coordinates) onSelectLocation(coordinates);
              onClose();
            }}
          >
            تأكيد الموقع
          </button>
        </div>
      </div>
    </div>
  );
}
