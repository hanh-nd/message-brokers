import { Router } from 'express';
import { AppDataSource } from '../../data-source';
import { Product } from '../../entities/product.entity';
import { publisher } from '../../kafka';
import { producer } from '../../rabbitmq';

const router = Router();

const productRepository = AppDataSource.getRepository(Product);

router.post('/', async (req, res) => {
    const product = productRepository.create(req.body);
    const createdProduct = await productRepository.save(product);
    producer.send('create-product', createdProduct);
    publisher.send('create-product', createdProduct);

    return res.json({
        success: true,
        data: createdProduct,
    });
});

export default router;
