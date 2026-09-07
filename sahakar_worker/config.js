// Central config — update API_URL when you deploy to Render
export const API_URL = 'http://192.168.1.100:5000'; // ← change to your local IP or Render URL
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
