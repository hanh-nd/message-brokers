import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import 'reflect-metadata';
import './data-source';
import productRouter from './modules/products';

import { subscriber } from './kafka';
import { consumer } from './rabbitmq';

const app = express();

app.use(cors());
app.use(json());

app.use('/api/products', productRouter);

const port = process.env.PORT || 8002;
app.listen(port, () => {
    console.log('app is running on port', port);

    consumer.on('initialized', async () => {
        await consumer.consume('create-product', (data) => {
            console.log(data);
        });
    });

    subscriber.on('initialized', async () => {
        subscriber.consume('create-product', (data) => {
            console.log(data);
        });
    });
});
