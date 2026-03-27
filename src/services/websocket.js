/**
 * Native WebSocket service for direct Reverb connection
 * No Echo dependency - pure WebSocket
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = null;
    this.appKey = import.meta.env.VITE_REVERB_APP_KEY;
    this.host = import.meta.env.VITE_REVERB_HOST;
    this.port = import.meta.env.VITE_REVERB_PORT;
    this.scheme = import.meta.env.VITE_REVERB_SCHEME;
    this.listeners = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 3000;
  }

  /**
   * Connect to Reverb WebSocket server
   */
  connect() {
    return new Promise((resolve, reject) => {
      const protocol = this.scheme === 'https' ? 'wss' : 'ws';
      this.url = `${protocol}://${this.host}:${this.port}/app/${this.appKey}?protocol=7&client=js&version=1.0&flash=false`;

      console.log('[WebSocket] Connecting to:', this.url);

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] ✅ Connected');
          this.reconnectAttempts = 0;
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this._handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Parse error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] ❌ Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Closed, reconnecting...');
          this._attemptReconnect();
        };
      } catch (error) {
        console.error('[WebSocket] Connection error:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  _handleMessage(message) {
    console.log('[WebSocket] Message received:', message);

    // Subscribe success
    if (message.event === 'pusher:subscription_succeeded') {
      const channel = message.channel;
      console.log('[WebSocket] Subscribed to channel:', channel);
      this._emit('subscribed', { channel });
      return;
    }

    // Trigger custom events
    if (message.event && !message.event.startsWith('pusher:')) {
      const listeners = this.listeners[message.channel] || [];
      const parsedData = typeof message.data === 'string'
        ? JSON.parse(message.data)
        : (message.data || {});
      console.log('[WebSocket] Triggering event:', message.event, 'with data:', parsedData);
      listeners.forEach(callback => {
        try {
          callback({ event: message.event, data: parsedData });
        } catch (error) {
          console.error('[WebSocket] Listener error:', error);
        }
      });
    }
  }

  /**
   * Subscribe to a private channel
   */
  subscribe(channelName) {
    return new Promise(async (resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        await this.connect();
      }

      console.log('[WebSocket] Subscribing to:', channelName);

      // Get auth token from API
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
              channel_name: channelName,
              socket_id: this._generateSocketId(),
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Auth failed');
        }

        const authData = await response.json();
        console.log('[WebSocket] Auth received for channel:', channelName);

        // Send subscribe message
        this.ws.send(
          JSON.stringify({
            event: 'pusher:subscribe',
            data: {
              auth: authData.auth,
              channel: channelName,
            },
          })
        );

        // Wait for subscription success
        const unsubscribe = this.on('subscribed', ({ channel }) => {
          if (channel === channelName) {
            unsubscribe();
            resolve(true);
          }
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          unsubscribe();
          reject(new Error('Subscription timeout'));
        }, 10000);
      } catch (error) {
        console.error('[WebSocket] Subscribe error:', error);
        reject(error);
      }
    });
  }

  /**
   * Listen for channel events
   */
  listen(channelName, event, callback) {
    const key = channelName;
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }

    // Filter by event name
    const wrappedCallback = ({ event: msgEvent, data }) => {
      if (msgEvent === event) {
        callback(data);
      }
    };

    this.listeners[key].push(wrappedCallback);

    // Return unsubscribe function
    return () => {
      const index = this.listeners[key].indexOf(wrappedCallback);
      if (index > -1) {
        this.listeners[key].splice(index, 1);
      }
    };
  }

  /**
   * Register internal event listener
   */
  on(event, callback) {
    if (!this.listeners['_internal']) {
      this.listeners['_internal'] = [];
    }
    this.listeners['_internal'].push({ event, callback });

    return () => {
      const index = this.listeners['_internal'].findIndex(
        (l) => l.event === event && l.callback === callback
      );
      if (index > -1) {
        this.listeners['_internal'].splice(index, 1);
      }
    };
  }

  /**
   * Emit internal event
   */
  _emit(event, data) {
    const listeners = this.listeners['_internal'] || [];
    listeners
      .filter((l) => l.event === event)
      .forEach((l) => {
        try {
          l.callback(data);
        } catch (error) {
          console.error('[WebSocket] Event listener error:', error);
        }
      });
  }

  /**
   * Attempt to reconnect
   */
  _attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[WebSocket] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectDelay}ms`
      );
      setTimeout(() => this.connect().catch(() => {}), this.reconnectDelay);
    } else {
      console.error('[WebSocket] Max reconnect attempts reached');
    }
  }

  /**
   * Generate a random socket ID
   */
  _generateSocketId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}.${random}`;
  }

  /**
   * Close connection
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export default new WebSocketService();
