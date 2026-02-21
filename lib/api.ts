import axios from 'axios';
import { getToken } from './storage';

const api = axios.create({
    baseURL: 'http://192.168.1.22:3000',
    headers: { 'Content-Type': 'application/json' },
});

// Add token to every request
api.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            if (config.headers && typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else if (config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
