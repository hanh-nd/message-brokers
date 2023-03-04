import { Kafka, Producer } from 'kafkajs';
import { EventEmitter } from 'stream';

class Publisher extends EventEmitter {
    clientId = 'admin-publisher';
    brokers = ['localhost:29092'];
    kafka: Kafka;
    producer: Producer;
    offlineMessages: { topic: string; message: Object; key?: string }[] = [];

    constructor() {
        super();
        this.kafka = new Kafka({
            clientId: this.clientId,
            brokers: this.brokers,
        });

        this.connect();

        this.on('initialized', () => {
            this.producer.on('producer.disconnect', () => {
                setTimeout(() => this.connect(), 5000);
            });

            while (true) {
                const m = this.offlineMessages.shift();
                if (!m) break;

                const { topic, message, key } = m;
                this.send(topic, message, key);
            }
        });
    }

    async connect() {
        try {
            this.producer = this.kafka.producer();
            await this.producer.connect();
            this.emit('initialized');
        } catch (error) {
            setTimeout(() => this.connect(), 5000);
        }
    }

    async send(topic: string, message: Object, key?: string) {
        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key,
                        value: JSON.stringify(message),
                    },
                ],
            });
        } catch (error) {
            this.offlineMessages.push({ topic, message, key });
        }
    }
}

export const publisher = new Publisher();
