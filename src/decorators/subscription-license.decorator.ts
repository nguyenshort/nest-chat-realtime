import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserSubscriptionExtract } from '@shared/extract/user-subscription.extract'

export const SubscriptionLicense = createParamDecorator(
  async (data: unknown, context: ExecutionContext) => {
    return UserSubscriptionExtract(context)
  }
)
