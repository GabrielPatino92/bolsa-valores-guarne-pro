const fallbackApiUrl = 'http://localhost:4000/api/v1';
const fallbackWsUrl = 'ws://localhost:4000';

function deriveWebsocketUrlFromApiUrl(apiUrl) {
  try {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return fallbackWsUrl;
  }
}

const apiUrl = import.meta.env.VITE_API_URL || fallbackApiUrl;
const wsUrl =
  import.meta.env.VITE_WS_URL || deriveWebsocketUrlFromApiUrl(apiUrl);

export const env = {
  apiUrl,
  wsUrl
};
