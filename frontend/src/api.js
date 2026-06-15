import axios from 'axios';

const api = axios.create({
    baseURL: '/aipcvl-api',
    timeout: 30000,
});

export default api;
