import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URL'),
        connectionFactory: (connection) => {
          connection.plugin(require('mongoose-autopopulate'))
          return connection
        }
      })
    })
  ]
})
export class DatabaseModule {}
