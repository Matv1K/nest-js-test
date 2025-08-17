import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { Article } from "./article/article.entity"
import { ArticleModule } from './article/article.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: "db",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "nest_auth",
      entities: [User, Article],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    ArticleModule,
  ],
})

export class AppModule {}
