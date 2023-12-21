const net = require('net');
const EventEmitter = require('events');

class IPC extends EventEmitter {
  constructor(config) {
    super();
    this.socketPath = config.socketPath || '';
    this.messageParser = config.messageParser;
    this.subscribeMessage = config.subscribeMessage || null;
    this.client = null;
    this.connect();
  }

  connect() {
    this.client = net.createConnection(this.socketPath, () => {
      console.log(`Connecting to IPC socket at ${this.socketPath}.`);
      if (this.subscribeMessage) {
        this.sendMessage(this.subscribeMessage);
      }
      this.emit('connect');
    });
    this.client.on('ready', () => {
      console.log('Connected to IPC socket.');
    });

    this.client.on('data', (data) => {
      try {
        const event = this.messageParser(data);
        this.emit('event', event);
      } catch (error) {
        this.emit('error', error);
      }
    });

    this.client.on('error', (error) => {
      this.emit('error', error);
    });
  }

  sendMessage(message) {
    if (this.client && !this.client.destroyed) {
      this.client.write(message);
    }
  }

  subscribe() {
    if (this.client && !this.client.destroyed) {
      this.client.write(this.subscribeMessage);
    }
  }
}

module.exports = IPC;
