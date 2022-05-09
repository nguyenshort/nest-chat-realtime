import { Injectable } from '@nestjs/common'
import { JWTAuthGuard } from '@guards/jwt.guard'

@Injectable()
export class OptionAuthGuard extends JWTAuthGuard {
  handleRequest(err, user) {
    return user
  }
}
