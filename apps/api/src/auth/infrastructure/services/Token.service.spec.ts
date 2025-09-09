import { UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import type { TestingModule } from '@nestjs/testing'

import type { IJwtPayload } from '~/auth/domain/interfaces'
import { ConfigService } from '~/config'
import { PrismaProvider } from '~/shared/infrastructure/database'

import { TokenService } from './Token.service'

describe('TokenService', () => {
  let service: TokenService
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock }
  let configService: { jwt: { secret: string; expiresIn: string } }
  let prismaService: { user: { findUnique: jest.Mock } }

  beforeEach(async () => {
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('test-token'),
      verifyAsync: jest.fn()
    }

    configService = {
      jwt: {
        secret: 'test-secret',
        expiresIn: '1h'
      }
    }

    prismaService = {
      user: {
        findUnique: jest.fn()
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: PrismaProvider, useValue: prismaService }
      ]
    }).compile()

    service = module.get<TokenService>(TokenService)
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('generateToken', () => {
    it('should generate a JWT token', async () => {
      const payload: IJwtPayload = {
        sub: 'user-id',
        identifier: 'username'
      }

      const token = await service.generateToken(payload)

      expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
        secret: 'test-secret',
        expiresIn: '1h'
      })

      expect(token).toBe('test-token')
    })

    it('should validate payload before generating token', async () => {
      const invalidPayload: IJwtPayload = {
        sub: '',
        identifier: 'username'
      }

      await expect(service.generateToken(invalidPayload)).rejects.toThrow(
        'JWT payload sub (subject) must be a non-empty string'
      )
    })
  })

  describe('verifyToken', () => {
    const validPayload: IJwtPayload = {
      sub: 'user-id',
      identifier: 'username'
    }

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      username: 'username',
      hash: 'password-hash',
      firstName: 'Test',
      lastName: 'User',
      confirmed: true,
      blocked: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('should verify and return the payload for a valid token', async () => {
      jwtService.verifyAsync.mockResolvedValue(validPayload)
      prismaService.user.findUnique.mockResolvedValue(mockUser)

      const result = await service.verifyToken('valid-token')

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret'
      })

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: validPayload.sub }
      })

      expect(result).toEqual(validPayload)
    })

    it('should throw UnauthorizedException when token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'))

      await expect(service.verifyToken('invalid-token')).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException when user not found', async () => {
      jwtService.verifyAsync.mockResolvedValue(validPayload)
      prismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.verifyToken('valid-token-unknown-user')).rejects.toThrow(
        UnauthorizedException
      )
    })
  })
})
