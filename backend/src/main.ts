import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors()
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 2204);
    const host = configService.get<string>('HOST', 'localhost');
    await app.listen(port, host);
}
bootstrap();
