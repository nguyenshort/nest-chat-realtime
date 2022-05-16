import { ObjectType, Field, Int, createUnionType } from '@nestjs/graphql'
import { Message } from '@app/message/entities/message.entity'
import { Image } from '@app/images/entities/image.entity'
import { File } from '@app/files/entities/file.entity'

@ObjectType()
export class Inbox {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number
}

export const InboxUnion = createUnionType({
  name: 'ResultUnion',
  types: () => [Message, Image, File] as const,
  resolveType(value) {
    if (value.content) {
      return Message
    }
    if (value.images) {
      return Image
    }
    if (value.file) {
      return File
    }
    return null
  }
})
