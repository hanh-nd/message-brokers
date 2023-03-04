import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 23306,
    username: 'root',
    password: 'password',
    database: 'ms_admin',
    entities: ['dist/entities/*.js'],
    logging: false,
    synchronize: true,
});

AppDataSource.initialize();
