import amqp, { Channel, Connection } from 'amqplib';
import { EventEmitter } from 'stream';

class Producer extends EventEmitter {
    connection: Connection;
    channel: Channel;
    offlineQueue: { queue: string; message: Object }[];

    constructor() {
        super();
        this.offlineQueue = [];
        this.connect();
        this.on('initialized', () => {
            this.registerErrorEvents();
        });
    }

    async connect() {
        try {
            this.connection = await amqp.connect('amqp://localhost:25672');
            await this.createChannel();
            this.emit('initialized');

            while (true) {
                const option = this.offlineQueue.shift();
                if (!option) return;

                const { queue, message } = option;
                this.send(queue, message);
            }
        } catch (error) {
            setTimeout(() => this.connect(), 5000);
        }
    }

    async createChannel() {
        try {
            this.channel = await this.connection.createChannel();
        } catch (error) {
            this.connection.close();
        }
    }

    async registerErrorEvents() {
        this.connection.on('close', () => {
            setTimeout(() => this.connect(), 5000);
        });
    }

    async send(queue: string, message: Object) {
        try {
            await this.channel.assertQueue(queue, {
                durable: true,
            });
            this.channel.sendToQueue(
                queue,
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true,
                }
            );
        } catch (error) {
            this.offlineQueue.push({ queue, message });
        }
    }
}

export const producer = new Producer();
