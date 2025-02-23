import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';

// Enable running server on multiple processors
// import  cluster from 'node:cluster';
// import { cpus } from 'node:os';

// async function bootstrap() {
//     const numCPUs = cpus().length;
//     if (cluster.isPrimary) {
//         for (let i = 0; i < numCPUs; i++) {
//             cluster.fork();
//         }
//         cluster.on('exit', (worker, _code, _signal) => {
//             console.log(`Reset worker ${worker.process.pid}`);
//             cluster.fork();
//         });
//     } else {
//         const app = await NestFactory.create(AppModule);
//         const configService = app.get(ConfigService);
//         const port = configService.get<number>('PORT', 2204);
//         const host = configService.get<string>('HOST', 'localhost');
//         app.enableCors();
//         await app.listen(port, host);
//     }
// }


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 2204);
    const host = configService.get<string>('HOST', 'localhost');
    const env = configService.get<string>('ENVIRONMENT', 'dev');
    if(env === 'dev') {
        app.enableCors();
    }
    await app.listen(port, host);
}
bootstrap();


