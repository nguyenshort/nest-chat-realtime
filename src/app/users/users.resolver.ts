import { Resolver } from '@nestjs/graphql'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'
// import { IUserResolver } from '@app/users/types/resolver'

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
}
