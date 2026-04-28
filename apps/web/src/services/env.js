const fallbackApiUrl = 'http://localhost:4000';
const fallbackWsUrl = 'ws://localhost:4000';

export const env = {
  apiUrl: import.meta.env.VITE_API_URL || fallbackApiUrl,
  wsUrl: import.meta.env.VITE_WS_URL || fallbackWsUrl
};
