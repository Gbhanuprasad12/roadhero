import React, { useState } from 'react';
import { MapPin, User, Bell, Shield, Sliders } from 'lucide-react';
import { useMechanic } from '../../context/MechanicContext';

const Settings = () => {
    const {
        radius,
        setRadius,
        address,
        manualLat,
        setManualLat,
        manualLng,
        setManualLng,
        setManualLocation,
        saveLocationPermanently,
        mechanicInfo
    } = useMechanic();

    const [activeTab, setActiveTab] = useState('service');

    return (
        <div className="slide-up">
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '32px', letterSpacing: '-0.5px' }}>Pro <span style={{ color: 'var(--primary)' }}>Settings</span></h2>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' }}>
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button onClick={() => setActiveTab('service')} className={`settings-nav-btn ${activeTab === 'service' ? 'active' : ''}`}>
                        <Sliders size={20} /> Service Area
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`settings-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}>
                        <User size={20} /> Professional Profile
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={`settings-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}>
                        <Bell size={20} /> Notifications
                    </button>
                    <button onClick={() => setActiveTab('security')} className={`settings-nav-btn ${activeTab === 'security' ? 'active' : ''}`}>
                        <Shield size={20} /> Security
                    </button>
                </aside>

                <div className="premium-card" style={{ padding: '40px' }}>
                    {activeTab === 'service' && (
                        <div className="slide-up">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <MapPin size={24} color="var(--primary)" /> Service Radius & Location
                            </h3>

                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '1rem', fontWeight: '800' }}>Search Radius</span>
                                    <span style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '900' }}>{radius} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="5"
                                    max="500"
                                    value={radius}
                                    onChange={(e) => setRadius(parseInt(e.target.value))}
                                    style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '100px', appearance: 'none', cursor: 'pointer' }}
                                />
                                <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    Jobs within this radius will be visible on your dashboard.
                                </p>
                            </div>

                            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '40px' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '24px', textTransform: 'uppercase' }}>Workshop Location</h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>LATITUDE</label>
                                        <input
                                            value={manualLat}
                                            onChange={e => { setManualLat(e.target.value); setManualLocation(true); }}
                                            style={{ padding: '12px 20px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>LONGITUDE</label>
                                        <input
                                            value={manualLng}
                                            onChange={e => { setManualLng(e.target.value); setManualLocation(true); }}
                                            style={{ padding: '12px 20px', fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={() => saveLocationPermanently(parseFloat(manualLat), parseFloat(manualLng))}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                                >
                                    Update Location
                                </button>

                                <div style={{ marginTop: '24px', padding: '20px', background: 'var(--light-bg)', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>VERIFIED ADDRESS</span>
                                    <p style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--primary)', marginTop: '8px', lineHeight: '1.5' }}>{address}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="slide-up">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '32px' }}>Professional Profile</h3>
                            <div style={{ display: 'flex', gap: '24px', marginBottom: '40px' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '2px solid white', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
                                    👨‍🔧
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>FULL NAME</label>
                                            <input defaultValue={mechanicInfo?.name} readOnly style={{ background: '#F8FAFC' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>PHONE</label>
                                            <input defaultValue={mechanicInfo?.phone} readOnly style={{ background: '#F8FAFC' }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>EMAIL</label>
                                        <input defaultValue={mechanicInfo?.email} readOnly style={{ background: '#F8FAFC' }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '24px', background: '#F0FDFA', borderRadius: '16px', border: '1px solid #CCFBF1' }}>
                                <p style={{ margin: 0, color: '#0F766E', fontSize: '0.9rem', fontWeight: '600' }}>To update your professional details, please contact RoadHero Pro Support for verification.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="slide-up">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '24px' }}>Notifications</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Configuring real-time alerts for new jobs...</p>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="slide-up">
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '24px' }}>Security</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Account security and privacy settings...</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .settings-nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 20px;
                    border-radius: 12px;
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: 700;
                    cursor: pointer;
                    transition: 0.3s;
                    text-align: left;
                    font-size: 0.95rem;
                }
                .settings-nav-btn:hover {
                    background: white;
                    color: var(--primary);
                }
                .settings-nav-btn.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 12px var(--primary-glow);
                }
                input[type=range]::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    background: var(--primary);
                    border: 4px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    cursor: pointer;
                    transition: 0.2s;
                }
                input[type=range]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
            `}</style>
        </div>
    );
};

export default Settings;
