import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Article } from '../article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { UserService } from '../user/user.service';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private userService: UserService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createArticleDto: CreateArticleDto, authorId: number): Promise<Article> {
    const author = await this.userService.findById(authorId);
    const article = this.articleRepository.create({ ...createArticleDto, author });

    return this.articleRepository.save(article);
  }

  async findAll(query: any): Promise<{ data: Article[]; count: number }> {
    const cacheKey = `articles:${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get<{ data: Article[]; count: number }>(cacheKey);
    if (cached) return cached;
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
    await this.cacheManager.set(cacheKey, result, 60);
    return result;
  }

  async findOne(id: number): Promise<Article> {
    const cacheKey = `article:${id}`;
    const cached = await this.cacheManager.get<Article>(cacheKey);
    if (cached) return cached;
    const article = await this.articleRepository.findOne({ where: { id } });
    if (article) await this.cacheManager.set(cacheKey, article, 60);
    return article;
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
    await this.articleRepository.update(id, updateArticleDto);
    // Инвалидация кэша
    await this.cacheManager.del(`article:${id}`);
    await (this.cacheManager as any).store.reset(); // Можно оптимизировать: удалять только связанные ключи
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.articleRepository.delete(id);
    // Инвалидация кэша
    await this.cacheManager.del(`article:${id}`);
    await (this.cacheManager as any).store.reset(); // Можно оптимизировать: удалять только связанные ключи
  }
}
