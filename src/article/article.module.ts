import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../article.entity';
import { ArticleService } from "./article.service";
import { ArticleController } from "./article.controller"
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article]), UserModule],
  providers: [ArticleService],
  controllers: [ArticleController],
})

export class ArticleModule {}
