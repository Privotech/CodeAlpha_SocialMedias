import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'http://localhost:5001/api'});
export const apiOrigin=(import.meta.env.VITE_API_URL||'http://localhost:5001/api').split('/api')[0];
export const socketUrl=apiOrigin;
api.interceptors.request.use(c=>{const t=localStorage.getItem('ch_token');if(t)c.headers.Authorization='Bearer '+t;return c});

