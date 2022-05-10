import { Module } from '@nestjs/common'
import { LicenseService } from './license.service'
import { LicenseResolver } from './license.resolver'
import { MongooseModule } from '@nestjs/mongoose'
import { License, LicenseEntity } from '@app/license/entities/license.entity'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from '@passport/jwt.strategy'
import { RedisCacheModule } from '@cache/cache.module'
import { LicenseEvent } from '@app/license/license.event'
import { UsersModule } from '@app/users/users.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: License.name,
        schema: LicenseEntity
      }
    ]),
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET'),
        signOptions: {
          expiresIn: '365d'
        }
      })
    }),
    RedisCacheModule,
    UsersModule
  ],
  providers: [LicenseResolver, LicenseService, JwtStrategy, LicenseEvent],
  exports: [LicenseService]
})
export class LicenseModule {}
