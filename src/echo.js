import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
  wsPort: import.meta.env.VITE_REVERB_SCHEME === 'https' ? 443 : 80,
  wssPort: import.meta.env.VITE_REVERB_SCHEME === 'https' ? 443 : 80,
  forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
  enabledTransports: ['ws', 'wss'],
  authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('auth_token'),
    },
  },
});

export default echo;