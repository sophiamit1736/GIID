// Browser-side API configuration.
// Local development defaults to the Node API on port 5000. For Vercel or any
// hosted deployment, set VITE_API_URL to the public backend API origin, e.g.
// https://api.example.com/api
export const API_BASE = String(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export const API_ORIGIN = API_BASE.replace(/\/api$/, '');
