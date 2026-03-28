// echo.js — supprime ou protège les lignes de debug
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
    auth: {
        headers: {
            get Authorization() {
                return 'Bearer ' + localStorage.getItem('auth_token');
            },
        },
    },
});

// ✅ Protège les listeners avec optional chaining
echo.connector.socket?.on('connect', () => {
    console.log('[Echo] Connected ✅');
});

echo.connector.socket?.on('disconnect', () => {
    console.log('[Echo] Disconnected ❌');
});

export default echo;