import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({ baseURL: API_URL });

// Attach stored auth token to every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('workerToken');
    if (token) config.headers['x-dev-uid'] = token; // dev mode
    return config;
});

export const authApi = {
    // Sync worker profile after login
    sync: (data) => api.post('/api/auth/sync', data),
    // Get current user
    me: () => api.get('/api/auth/me'),
};

export const bookingApi = {
    // Get worker's job history
    myJobs: () => api.get('/api/bookings/my'),
    // Get single booking detail
    getById: (id) => api.get(`/api/bookings/${id}`),
};

export default api;
