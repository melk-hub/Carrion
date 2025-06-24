import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // ou mysql, sqlite, etc.
      host: 'localhost',
      port: 5432,
      username: 'user',
      password: 'passord',
      database: 'nom_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ❗ à désactiver en prod
    }),
  ],
})
export class NotificaionModule {}

