import { Platform } from 'react-native';

// Android Emulator connects to localhost via 10.0.2.2; iOS Simulator uses localhost
const LOCAL_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

// In production or live testing, update this to your Render URL (e.g. 'https://real-sahakar.onrender.com')
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
