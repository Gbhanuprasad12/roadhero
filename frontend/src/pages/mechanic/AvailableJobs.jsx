import React from 'react';
import { MapPin, AlertCircle, HelpCircle } from 'lucide-react';
import MapComponent from '../../components/MapComponent';
import { useMechanic } from '../../context/MechanicContext';

const AvailableJobs = () => {
    const {
        requests,
        activeJobs,
        location,
        isAvailable,
        toggleAvailability,
        acceptRequest,
        isPickingLocation,
        setIsPickingLocation,
        setManualLat,
        setManualLng,
        setManualLocation,
        addToast
    } = useMechanic();

    const calculateDist = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleMapClick = (coords) => {
        if (isPickingLocation) {
            setManualLat(coords[0].toFixed(6));
            setManualLng(coords[1].toFixed(6));
            setManualLocation(true);
            setIsPickingLocation(false);
            addToast("Pinned!");
        }
    };

    const allMarkers = [];
    if (isAvailable) {
        [...requests, ...activeJobs].forEach(req => {
            if (!req?.location?.coordinates) return;
            const isJobPending = req.status === 'PENDING';
            const d = calculateDist(location.lat, location.lng, req.location.coordinates[1], req.location.coordinates[0]);

            allMarkers.push({
                position: [req.location.coordinates[1], req.location.coordinates[0]],
                type: isJobPending ? 'pending' : 'active',
                content: (
                    <div style={{ minWidth: '160px', fontFamily: 'var(--font-main)' }}>
                        <div style={{ fontWeight: '800', marginBottom: '4px' }}>{req.driverName || 'Customer'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{req.serviceType} • {d.toFixed(1)}km away</div>
                        <div style={{ fontWeight: '900', color: 'var(--secondary)', fontSize: '1.1rem', marginTop: '4px' }}>${req.price || 0}</div>
                        {isJobPending && (
                            <button onClick={() => acceptRequest(req._id)} className="btn btn-primary" style={{ width: '100%', padding: '6px', marginTop: '8px' }}>Accept</button>
                        )}
                    </div>
                )
            });
        });
    }

    if (location?.lat && location?.lng) {
        allMarkers.push({ position: [location.lat, location.lng], type: 'mechanic', content: <div style={{ fontWeight: '800' }}>Your Workshop</div> });
    }

    return (
        <div className="slide-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Jobs <span style={{ color: 'var(--primary)' }}>Near You</span></h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setIsPickingLocation(!isPickingLocation)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '8px 16px', background: isPickingLocation ? 'var(--accent)' : 'white', color: isPickingLocation ? 'white' : 'var(--text-primary)' }}>
                        {isPickingLocation ? '🛑 Cancel Map Selection' : '📍 Relocate Workshop'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '32px', height: 'calc(100vh - 200px)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '8px' }}>
                    {!isAvailable && (
                        <div className="premium-card" style={{ padding: '40px', textAlign: 'center' }}>
                            <AlertCircle size={48} color="var(--accent)" style={{ margin: '0 auto 16px', display: 'block' }} />
                            <h3 style={{ fontWeight: '800' }}>You are currently Offline</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Go online to start receiving job requests from drivers near you.</p>
                            <button onClick={toggleAvailability} className="btn btn-primary" style={{ marginTop: '24px', width: '100%' }}>Go Online Now</button>
                        </div>
                    )}

                    {isAvailable && requests.length === 0 && (
                        <div className="premium-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.8 }}>
                            <HelpCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', display: 'block' }} />
                            <h3 style={{ fontWeight: '700' }}>Searching for jobs...</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Try increasing your search radius in settings.</p>
                        </div>
                    )}

                    {isAvailable && requests.map(req => {
                        if (!req?.location?.coordinates) return null;
                        const d = calculateDist(location.lat, location.lng, req.location.coordinates[1], req.location.coordinates[0]);
                        const serviceImage = req.serviceType === 'Towing' ? '/towing.png' : '/repair.png';

                        return (
                            <div key={req._id} className="premium-card" style={{ padding: '0', overflow: 'hidden', minHeight: '340px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '140px', width: '100%', position: 'relative', flexShrink: 0 }}>
                                    <img src={serviceImage} alt={req.serviceType} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '6px 14px', borderRadius: '100px', fontWeight: '900', color: 'var(--secondary)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '1.1rem', zIndex: 10 }}>
                                        ${req.price || 0}
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '16px 20px', color: 'white' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{req.serviceType || 'Emergency'}</span>
                                        <h4 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontWeight: '900' }}>{req.driverName || 'Nearby Customer'}</h4>
                                    </div>
                                </div>

                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px', fontWeight: '700' }}>
                                        <MapPin size={14} color="var(--primary)" /> {d.toFixed(1)} km away
                                    </div>
                                    <div style={{ background: 'var(--light-bg)', padding: '12px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #e2e8f0', flex: 1, maxHeight: '80px', overflowY: 'auto' }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                            "{req.issue || 'No details provided'}"
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            acceptRequest(req._id);
                                        }}
                                        className="btn btn-primary"
                                        style={{ width: '100%', fontWeight: '900', padding: '14px', marginTop: 'auto' }}
                                    >
                                        Accept Job
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="map-container" style={{ position: 'relative', height: '100%' }}>
                    <MapComponent
                        center={[location.lat, location.lng]}
                        markers={allMarkers}
                        zoom={13}
                        onMapClick={isPickingLocation ? handleMapClick : null}
                    />
                </div>
            </div>
        </div>
    );
};

export default AvailableJobs;
