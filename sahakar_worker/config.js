import { Platform } from 'react-native';

// With ADB reverse enabled over USB cable, localhost:5000 connects directly from phone to laptop!
// Fallback to laptop Wi-Fi IP (10.233.197.36) if testing over wireless LAN.
const YOUR_LAPTOP_IP = '10.233.197.36';

const LOCAL_HOST = 'http://localhost:5000';

export const API_URL = LOCAL_HOST;
export const SOCKET_URL = API_URL;

export const STATUS_COLORS = {
    pending: '#FFA500',
    offered: '#007AFF',
    accepted: '#34C759',
    en_route: '#007AFF',
    arrived: '#5856D6',
    in_progress: '#FF9500',
    completed: '#34C759',
    cancelled: '#FF3B30',
};
