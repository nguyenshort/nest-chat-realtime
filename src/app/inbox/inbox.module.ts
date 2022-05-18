import { Module } from '@nestjs/common'
import { InboxService } from './inbox.service'
import { InboxResolver } from './inbox.resolver'
import { RoomModule } from '@app/room/room.module'
import { MessageModule } from '@app/message/message.module'
import { ImagesModule } from '@app/images/images.module'
import { FilesModule } from '@app/files/files.module'
import { InboxEvent } from '@app/inbox/inbox.event'
import { UsersModule } from '@app/users/users.module'

@Module({
  imports: [RoomModule, MessageModule, ImagesModule, FilesModule, UsersModule],
  providers: [InboxResolver, InboxService, InboxEvent]
})
export class InboxModule {}
