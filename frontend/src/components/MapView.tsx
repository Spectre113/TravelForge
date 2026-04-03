import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import { Link } from 'react-router-dom';
import { City } from '../types';

export default function MapView({ cities }: { cities: City[] }) {
  const center = [48.5, 18] as [number, number];
  return (
    <div className="card" style={{ height: 420 }}>
      <MapContainer center={center} zoom={4} style={{ height: '100%', borderRadius: 12 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap" />
        {cities.map(c => (
          <Marker key={c.id} position={[c.lat, c.lng] as [number, number]}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{c.name}</div>
                <Link className="link" to={`/city/${c.id}`}>Открыть детализацию</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
