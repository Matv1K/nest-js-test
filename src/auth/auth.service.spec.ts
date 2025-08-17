import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: any;
  let jwtService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: { findByEmail: jest.fn(), create: jest.fn(), validateUser: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user and return a token', async () => {
    userService.findByEmail.mockResolvedValueOnce(null);
    userService.create.mockResolvedValueOnce({ id: 1, email: 'test@mail.com' });
    jwtService.sign.mockReturnValueOnce('token');
    const result = await service.register('test@mail.com', 'pass');
    expect(userService.findByEmail).toHaveBeenCalledWith('test@mail.com');
    expect(userService.create).toHaveBeenCalledWith('test@mail.com', 'pass');
    expect(result).toEqual({ access_token: 'token' });
  });

  it('should throw ConflictException if user already exists', async () => {
    userService.findByEmail.mockResolvedValueOnce({ id: 1 });
    await expect(service.register('test@mail.com', 'pass')).rejects.toThrow(ConflictException);
  });

  it('should login a user and return a token', async () => {
    userService.validateUser.mockResolvedValueOnce({ id: 1, email: 'test@mail.com' });
    jwtService.sign.mockReturnValueOnce('token');
    const result = await service.login('test@mail.com', 'pass');
    expect(userService.validateUser).toHaveBeenCalledWith('test@mail.com', 'pass');
    expect(result).toEqual({ access_token: 'token' });
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    userService.validateUser.mockResolvedValueOnce(null);
    await expect(service.login('test@mail.com', 'wrongpass')).rejects.toThrow(UnauthorizedException);
  });

  it('should generate a token with correct payload', () => {
    jwtService.sign.mockReturnValue('token');
    const user = { id: 1, email: 'test@mail.com' };
    const result = (service as any).generateToken(user);
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'test@mail.com' });
    expect(result).toEqual({ access_token: 'token' });
  });
});
