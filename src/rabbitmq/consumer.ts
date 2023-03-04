import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { EventEmitter } from 'stream';

class Consumer extends EventEmitter {
    connection: Connection;
    channel: Channel;

    constructor() {
        super();
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

    async consume(
        topic: string,
        callback: (data: Object, message: ConsumeMessage) => any
    ) {
        await this.channel.assertQueue(topic, {
            durable: true,
        });

        this.channel.consume(
            topic,
            async (message) => {
                if (!message) return;

                const data = JSON.parse(`${message.content}`);
                await callback(data, message);
            },
            {
                noAck: true,
            }
        );
    }

    async registerErrorEvents() {
        this.connection.on('close', () => {
            setTimeout(() => this.connect(), 5000);
        });
    }
}

export const consumer = new Consumer();
