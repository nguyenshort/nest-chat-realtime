import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import GraphQLJSON from 'graphql-type-json'
import { AuthModule } from '@app/auth/auth.module'
import { AuthService } from '@app/auth/auth.service'

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      imports: [AuthModule],
      inject: [AuthService],
      driver: ApolloDriver,
      useFactory: (authService: AuthService) => ({
        playground: false,
        autoSchemaFile: true,
        debug: true,
        cors: true,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        subscriptions: {
          'subscriptions-transport-ws': true,
          'graphql-ws': {
            onConnect: async (context: any) => {
              const { connectionParams, extra } = context
              // user validation will remain the same as in the example above
              // when using with graphql-ws, additional context value should be stored in the extra fieldx
            }
          },
          context: ({ extra }) => {
            return {
              currentUser: extra.user
            }
          }
        },
        resolvers: { JSON: GraphQLJSON },
        context: ({ req }) => ({ req })
      })
    })
  ]
})
export class ApolloModule {}
