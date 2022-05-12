import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty } from 'class-validator'
import { KickRoomInput } from '@app/room/dto/kick-room.input'

@InputType()
export class AddToRoomInput extends KickRoomInput {}
