import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import api from '../api';
import AuthContext from './AuthContext';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.PROD ? window.location.origin : 'http://localhost:5000');
const DriverContext = createContext();

export const DriverProvider = ({ children }) => {
    const { user, updateUser } = useContext(AuthContext);

    // Core State
    const [requestId, setRequestId] = useState(null);
    const [requestStatus, setRequestStatus] = useState(null);
    const [mechanicData, setMechanicData] = useState(null);
    const [requestLocation, setRequestLocation] = useState(null);
    const [history, setHistory] = useState([]);
    const [vehicles, setVehicles] = useState(user?.vehicles || []);
    const [location, setLocation] = useState({ lat: 51.505, lng: -0.09 });

    // UI State
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState([]);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [eta, setEta] = useState(0);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/requests/driver/${user?._id}?status=COMPLETED`);
            setHistory(res.data.data);
        } catch (err) { console.error("History fetch error", err); }
    };

    const checkActiveSession = async () => {
        if (!user?._id) return;
        try {
            const res = await api.get(`/requests/driver/${user._id}`);
            const recent = res.data.data.find(r => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
            if (recent) {
                setRequestId(recent._id);
                setRequestStatus(recent.status);
                if (recent.location && recent.location.coordinates) {
                    setRequestLocation({ lat: recent.location.coordinates[1], lng: recent.location.coordinates[0] });
                }
                if (recent.assignedMechanic) setMechanicData(recent.assignedMechanic);
            }
        } catch (err) { console.error("Session check error", err); }
    };

    const resetRequest = () => {
        setRequestStatus(null);
        setRequestId(null);
        setMechanicData(null);
        setRequestLocation(null);
        setChats([]);
        setHasNewMessage(false);
        fetchHistory();
    };

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

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error(err)
            );
        }
        checkActiveSession();
        fetchHistory();
    }, [user?._id]);

    useEffect(() => {
        let interval;
        if (requestId && requestStatus !== 'COMPLETED' && requestStatus !== 'CANCELLED') {
            interval = setInterval(async () => {
                try {
                    const reqRes = await api.get(`/requests/${requestId}`);
                    const requestData = reqRes.data.data;
                    const newStatus = requestData.status;

                    if (newStatus !== requestStatus) {
                        setRequestStatus(newStatus);
                    }

                    if ((newStatus === 'ACCEPTED' || newStatus === 'PAYMENT_PENDING' || newStatus === 'ARRIVED' || newStatus === 'IN_PROGRESS') && requestData.assignedMechanic) {
                        setMechanicData(requestData.assignedMechanic);
                        if (newStatus === 'ACCEPTED' && requestData.assignedMechanic.location) {
                            const mechLoc = requestData.assignedMechanic.location.coordinates;
                            const dLoc = requestLocation || location;
                            const distance = calculateDist(dLoc.lat, dLoc.lng, mechLoc[1], mechLoc[0]);
                            const travelTime = Math.round((distance / 30) * 60 + 2);
                            setEta(travelTime > 0 ? travelTime : 1);
                        }
                    }
                } catch (err) { console.error("Polling error", err); }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [requestId, requestStatus, location, requestLocation]);

    useEffect(() => {
        if (requestId) {
            socket.emit('join_room', requestId);
        }

        const handleNewMessage = (data) => {
            if (data.requestId === requestId) {
                setChats(prev => {
                    const isDuplicate = prev.length > 0 &&
                        prev[prev.length - 1].message === data.message &&
                        prev[prev.length - 1].senderId === data.senderId;
                    return isDuplicate ? prev : [...prev, data];
                });

                if (data.senderRole === 'mechanic') {
                    setHasNewMessage(true);
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
                    audio.volume = 0.2;
                    audio.play().catch(e => { });
                    addToast(`New message from mechanic!`);
                }
            }
        };

        socket.on('receive_message', handleNewMessage);
        return () => socket.off('receive_message', handleNewMessage);
    }, [requestId]);

    const value = {
        requestId, setRequestId,
        requestStatus, setRequestStatus,
        mechanicData, setMechanicData,
        requestLocation, setRequestLocation,
        history, fetchHistory,
        vehicles, setVehicles,
        location, setLocation,
        toasts, addToast,
        loading, setLoading,
        chats, setChats,
        hasNewMessage, setHasNewMessage,
        eta, socket,
        resetRequest,
        calculateDist
    };

    return (
        <DriverContext.Provider value={value}>
            {children}
        </DriverContext.Provider>
    );
};

export const useDriver = () => useContext(DriverContext);
