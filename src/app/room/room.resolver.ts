import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql'
import { RoomService } from './room.service'
import { Room } from './entities/room.entity'
import { CreateRoomInput } from './dto/create-room.input'
import { UpdateRoomInput } from './dto/update-room.input'

@Resolver(() => Room)
export class RoomResolver {
  constructor(private readonly roomService: RoomService) {}

  @Mutation(() => Room)
  async roomCreate(@Args('createRoomInput') createRoomInput: CreateRoomInput) {
    console.log(createRoomInput)
    const d = await this.roomService.create(createRoomInput)
    console.log(d)
  }

  @Query(() => [Room], { name: 'room' })
  findAll() {
    return this.roomService.findAll()
  }

  @Query(() => Room, { name: 'room' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.roomService.findOne(id)
  }

  @Mutation(() => Room)
  updateRoom(@Args('updateRoomInput') updateRoomInput: UpdateRoomInput) {
    return this.roomService.update(updateRoomInput.id, updateRoomInput)
  }

  @Mutation(() => Room)
  removeRoom(@Args('id', { type: () => Int }) id: number) {
    return this.roomService.remove(id)
  }
}
