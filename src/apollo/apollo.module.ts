import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import { LicenseModule } from '@app/license/license.module'
import { LicenseService } from '@app/license/license.service'
import GraphQLJSON from 'graphql-type-json'

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      imports: [LicenseModule],
      inject: [LicenseService],
      driver: ApolloDriver,
      useFactory: (licenseService: LicenseService) => ({
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
              // when using with graphql-ws, additional context value should be stored in the extra field
              extra.user = await licenseService.checkToken(
                connectionParams.Authorization
              )
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
