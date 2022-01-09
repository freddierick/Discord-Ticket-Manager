import Events from 'events';
import WebSocket from 'ws';

class Client extends Events {
    constructor(props) {
        super(props);
        this.user = {};
        this.socket = null;
        this.isConnected = false;
        this.isLoggedIn = false;
        this.isConnecting = false;

        this.ws = null;
    }
    async login(url, token) {
        this.isConnecting = true;
        this.url = url;
        this.token = token;

        this.ws = new WebSocket(`ws://${url}/api/external/gateway?token=${this.token}`);

        this.ws.on('open', () => {
            this.isConnected = true;
            this.isConnecting = false;
        });

        this.ws.on('message', (data) => {
            const payload = JSON.parse(data);
            switch (payload.e) {
                case 'READY':
                    this.versionNumber = payload.v;
                    this.user = payload.d.tokenName;
                    this.emit('ready');   
                    break;
                case 'MESSAGE_CREATE':
                    this.emit('message', payload.d);
                    break;
            };
            this.emit('rawWS', payload);
        });

        this.ws.on('close', (reason) => {
            this.isConnected = false;
            this.isConnecting = false;
            console.log(reason)
        });
    };
};

export default Client;