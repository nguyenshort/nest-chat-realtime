import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { LicenseService } from '@app/license/license.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    protected licenseService: LicenseService,
    protected configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('SECRET')
    })
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException()
    }
    const user = await this.licenseService.JWTVerify(payload.id)
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }
}
