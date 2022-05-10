import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver } from '@nestjs/apollo'
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core'
import { LicenseModule } from '@app/license/license.module'
import { LicenseService } from '@app/license/license.service'
import { AuthenticationError } from 'apollo-server-express'

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
          'subscriptions-transport-ws': {
            onConnect: async ({ Authorization }) => {
              if (!Authorization) {
                throw new AuthenticationError(
                  'You need a license to access this resource'
                )
              }

              const currentUser = await licenseService.checkToken(Authorization)
              if (!currentUser) {
                throw new AuthenticationError(
                  'You need a license to access this resource'
                )
              }

              // Todo save to redis

              return {
                currentUser
              }
            }
          },
          'graphql-ws': {
            onConnect: async (context: any) => {
              const { connectionParams, extra } = context

              if (!connectionParams.Authorization) {
                throw new AuthenticationError(
                  'You need a license to access this resource'
                )
              }

              const currentUser = await licenseService.checkToken(
                connectionParams.Authorization
              )

              if (!currentUser) {
                throw new AuthenticationError(
                  'You need a license to access this resource'
                )
              }

              // Todo save to redis

              extra.user = currentUser
            }
          },
          context: ({ extra }) => {
            return {
              currentUser: extra.user
            }
          }
        },
        context: ({ req }) => ({ req })
      })
    })
  ]
})
export class ApolloModule {}
