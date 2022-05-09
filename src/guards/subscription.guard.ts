import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Observable } from 'rxjs'
import { UserSubscriptionExtract } from '@shared/extract/user-subscription.extract'

@Injectable()
export class SubscriptionGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    return UserSubscriptionExtract(context)
  }
}
