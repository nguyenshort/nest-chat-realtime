import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { GqlExecutionContext } from '@nestjs/graphql'

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    // dù là request thường đều có thể tạo graphql context
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }
}
