import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix: Leaflet Routing Machine relies on window.L
if (typeof window !== 'undefined') {
    window.L = L;
}
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
}

function LocationPicker({ onLocationPicked }) {
    useMapEvents({
        click(e) {
            onLocationPicked([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

function RoutingMachine({ start, end }) {
    const map = useMap();

    useEffect(() => {
        if (!map || !start || !end) return;

        // Ensure coordinates are numbers
        const startLat = parseFloat(start[0]);
        const startLng = parseFloat(start[1]);
        const endLat = parseFloat(end[0]);
        const endLng = parseFloat(end[1]);

        if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
            console.error("Invalid coordinates for routing", { start, end });
            return;
        }

        if (!L.Routing) {
            console.warn("Leaflet Routing Machine not loaded");
            return;
        }

        let routingControl;
        try {
            routingControl = L.Routing.control({
                waypoints: [
                    L.latLng(startLat, startLng),
                    L.latLng(endLat, endLng)
                ],
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                lineOptions: {
                    styles: [{ color: '#6366F1', weight: 8, opacity: 0.9 }]
                },
                createMarker: () => null,
                show: false
            }).addTo(map);
        } catch (err) {
            console.error("Failed to create routing control:", err);
        }

        return () => {
            if (map && routingControl) {
                try {
                    map.removeControl(routingControl);
                } catch (e) {
                    console.error("Error removing routing control:", e);
                }
            }
        };
    }, [map, start ? start[0] : null, start ? start[1] : null, end ? end[0] : null, end ? end[1] : null]); // Safely access coordinates

    return null;
}

const createCustomIcon = (type) => {
    let color = '#4F46E5'; // Default blue
    if (type === 'pending') color = '#F59E0B'; // Amber
    if (type === 'active') color = '#10B981'; // Green
    if (type === 'mechanic') color = '#6366F1'; // Indigo

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                <div style="width: 8px; height: 8px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const MapComponent = ({ center, markers = [], zoom = 13, showRoute = false, routeStart = null, routeEnd = null, onMapClick = null }) => {
    // Safety guard for center
    const safeCenter = Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])
        ? center
        : [51.505, -0.09];

    try {
        return (
            <MapContainer center={safeCenter} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: '16px' }}>
                <ChangeView center={safeCenter} zoom={zoom} />
                {onMapClick && <LocationPicker onLocationPicked={onMapClick} />}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {markers.map((marker, idx) => {
                    if (!marker?.position || isNaN(marker.position[0]) || isNaN(marker.position[1])) return null;
                    return (
                        <Marker key={idx} position={marker.position} icon={createCustomIcon(marker.type)}>
                            <Popup>
                                <div style={{ padding: '4px' }}>
                                    {marker.content}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
                {showRoute && routeStart && routeEnd && (
                    <RoutingMachine start={routeStart} end={routeEnd} />
                )}
            </MapContainer>
        );
    } catch (error) {
        console.error("MapComponent render error:", error);
        return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', borderRadius: '16px', color: '#64748B' }}>Map initialization failed</div>;
    }
};

export default MapComponent;
