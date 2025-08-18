import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from './article.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { UserService } from '../user/user.service';

const mockArticleRepository = () => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockUserService = () => ({
  findById: jest.fn(),
});

const mockRedis = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  keys: jest.fn(),
});

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepository: ReturnType<typeof mockArticleRepository>;
  let userService: ReturnType<typeof mockUserService>;
  let redis: ReturnType<typeof mockRedis>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        { provide: getRepositoryToken(Article), useFactory: mockArticleRepository },
        { provide: UserService, useFactory: mockUserService },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);
    articleRepository = module.get(getRepositoryToken(Article));
    userService = module.get(UserService);

    redis = mockRedis();
    (service as any).redis = redis;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if ((service as any).redis && typeof (service as any).redis.disconnect === 'function') {
      (service as any).redis.disconnect();
    }
  });

  it('should return cached articles if present', async () => {
    redis.get.mockResolvedValueOnce(JSON.stringify({ data: [1, 2], count: 2 }));
    const result = await service.findAll({});
    expect(result).toEqual({ data: [1, 2], count: 2 });
    expect(redis.get).toHaveBeenCalled();
    expect(articleRepository.findAndCount).not.toHaveBeenCalled();
  });

  it('should fetch articles from DB and cache them if not cached', async () => {
    redis.get.mockResolvedValueOnce(null);
    articleRepository.findAndCount.mockResolvedValueOnce([[{ id: 1 }], 1]);
    const result = await service.findAll({});
    expect(result).toEqual({ data: [{ id: 1 }], count: 1 });
    expect(redis.set).toHaveBeenCalled();
  });

  it('should return cached article if present', async () => {
    redis.get.mockResolvedValueOnce(JSON.stringify({ id: 1 }));
    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1 });
    expect(redis.get).toHaveBeenCalledWith('article:1');
    expect(articleRepository.findOne).not.toHaveBeenCalled();
  });

  it('should fetch article from DB and cache it if not cached', async () => {
    redis.get.mockResolvedValueOnce(null);
    articleRepository.findOne.mockResolvedValueOnce({ id: 1 });
    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1 });
    expect(redis.set).toHaveBeenCalledWith('article:1', JSON.stringify({ id: 1 }), 'EX', 60);
  });

  it('should create an article', async () => {
    userService.findById.mockResolvedValueOnce({ id: 1 });
    articleRepository.create.mockReturnValueOnce({ title: 't', author: { id: 1 } });
    articleRepository.save.mockResolvedValueOnce({ id: 2, title: 't' });
    const result = await service.create({ title: 't' } as any, 1);
    expect(result).toEqual({ id: 2, title: 't' });
  });

  it('should update an article and invalidate caches', async () => {
    articleRepository.update.mockResolvedValueOnce(undefined);
    redis.del.mockResolvedValueOnce(1);
    redis.keys.mockResolvedValueOnce(['articles:{}']);
    redis.del.mockResolvedValueOnce(1);
    articleRepository.findOne.mockResolvedValueOnce({ id: 1 });
    redis.get.mockResolvedValueOnce(null);
    const result = await service.update(1, { title: 'new' });
    expect(redis.del).toHaveBeenCalledWith('article:1');
    expect(redis.keys).toHaveBeenCalledWith('articles:*');
    expect(result).toEqual({ id: 1 });
  });

  it('should remove an article and invalidate caches', async () => {
    articleRepository.delete.mockResolvedValueOnce(undefined);
    redis.del.mockResolvedValueOnce(1);
    redis.keys.mockResolvedValueOnce(['articles:{}']);
    redis.del.mockResolvedValueOnce(1);
    const result = await service.remove(1);
    expect(redis.del).toHaveBeenCalledWith('article:1');
    expect(redis.keys).toHaveBeenCalledWith('articles:*');
    expect(result).toEqual({ success: true });
  });
});
