import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Article } from '../article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private userService: UserService,
  ) {}

  async create(createArticleDto: CreateArticleDto, authorId: number): Promise<Article> {
    const author = await this.userService.findById(authorId);
    const article = this.articleRepository.create({ ...createArticleDto, author });

    return this.articleRepository.save(article);
  }

  async findAll(query: any): Promise<{ data: Article[]; count: number }> {
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
    
    return { data, count };
  }

  async findOne(id: number): Promise<Article> {
    return this.articleRepository.findOne({ where: { id } });
  }

  async update(id: number, updateArticleDto: UpdateArticleDto): Promise<Article> {
    await this.articleRepository.update(id, updateArticleDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.articleRepository.delete(id);
  }
}
