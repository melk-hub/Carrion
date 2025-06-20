import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', // ou mysql, sqlite, etc.
      host: 'localhost',
      port: 5432,
      username: 'ton_user',
      password: 'ton_mot_de_passe',
      database: 'nom_de_ta_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ❗ à désactiver en prod
    }),
  ],
})
export class NotificaionModule {}

