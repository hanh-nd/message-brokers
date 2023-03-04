import { Consumer, Kafka, KafkaMessage } from 'kafkajs';
import { EventEmitter } from 'stream';

class Subscriber extends EventEmitter {
    clientId = 'admin-consumer';
    brokers = ['localhost:29092'];
    kafka: Kafka;
    consumer: Consumer;
    offlineMessages: { topic: string; message: Object; key?: string }[] = [];

    constructor() {
        super();
        this.kafka = new Kafka({
            clientId: this.clientId,
            brokers: this.brokers,
        });
        this.connect();

        this.on('initialized', () => {
            this.consumer.on('consumer.disconnect', () => {
                setTimeout(() => this.connect(), 5000);
            });
        });
    }

    async connect() {
        try {
            this.consumer = this.kafka.consumer({ groupId: this.clientId });
            await this.consumer.connect();
            this.emit('initialized');
        } catch (error) {
            setTimeout(() => this.connect(), 5000);
        }
    }

    async consume(
        topic: string,
        callback: (data: Object, message: KafkaMessage) => any
    ) {
        await this.consumer.subscribe({ topic });
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                const data = JSON.parse(`${message.value}`);
                await callback(data, message);
            },
        });
    }
}

export const subscriber = new Subscriber();
