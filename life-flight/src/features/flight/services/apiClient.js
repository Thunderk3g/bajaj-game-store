import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://webpartner.bajajallianz.com',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

export default apiClient;
