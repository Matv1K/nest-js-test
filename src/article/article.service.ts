import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Article } from "./article.entity";
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { UserService } from '../user/user.service';
import Redis from 'ioredis';

@Injectable()
export class ArticleService {
  private redis: Redis;

  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private userService: UserService,
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    });
  }

  async create(createArticleDto: CreateArticleDto, authorId: number): Promise<Article> {
    const author = await this.userService.findById(authorId);
    const article = this.articleRepository.create({ ...createArticleDto, author });

    return this.articleRepository.save(article);
  }

  async findAll(query: any): Promise<{ data: Article[]; count: number }> {
    const cacheKey = `articles:${JSON.stringify(query)}`;

    try {
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        console.log('Cache HIT for', cacheKey, 'value:', cached);
        return JSON.parse(cached);
      } else {
        console.log('Cache MISS for', cacheKey);
      }
    } catch (err) {
      console.error('Error reading from redis:', err);
    }

    const { page = 1, limit = 10, author, publicationDate } = query;
    const where: any = {};

    if (author) where.author = { id: author };
    if (publicationDate) where.publicationDate = Like(`%${publicationDate}%`);

    const [data, count] = await this.articleRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { publicationDate: 'DESC' },
    });
    const result = { data, count };

    try {
      await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60);
      console.log('Saved to redis:', cacheKey);
    } catch (err) {
      console.error('Error saving to redis:', err);
    }

    return result;
  }

  async findOne(id: number): Promise<Article> {
    const cacheKey = `article:${id}`;

    try {
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        console.log('Cache HIT for', cacheKey, 'value:', cached);
        return JSON.parse(cached);
      } else {
        console.log('Cache MISS for', cacheKey);
      }
    } catch (err) {
      console.error('Error reading from redis:', err);
    }

    const article = await this.articleRepository.findOne({ where: { id } });

    if (article) {
      try {
        await this.redis.set(cacheKey, JSON.stringify(article), 'EX', 60);
        console.log('Saved to redis:', cacheKey);
      } catch (err) {
        console.error('Error saving to redis:', err);
      }
    }
    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
    await this.articleRepository.update(id, updateArticleDto);

    // Cache invalidation
    await this.redis.del(`article:${id}`);

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    await this.articleRepository.delete(id);

    // Cache invalidation
    await this.redis.del(`article:${id}`);

    return { success: true };
  }
}
