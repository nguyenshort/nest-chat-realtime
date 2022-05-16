import { InputType, Field, Int } from '@nestjs/graphql'
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator'

@InputType()
export class GetInboxsInput {
  @IsNotEmpty()
  @Field(() => String, { description: 'Room ID' })
  roomID: string

  @Field(() => Int, { description: 'Giới hạn' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(20)
  limit: number

  @Field(() => Int, { description: 'Skip' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  offset: number
}
