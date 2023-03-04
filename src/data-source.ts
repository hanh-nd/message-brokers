import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'Hanhnd156',
    database: 'ms_admin',
    entities: ['dist/entities/*.js'],
    logging: false,
    synchronize: true,
});

AppDataSource.initialize();
