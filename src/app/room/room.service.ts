import { Injectable } from '@nestjs/common'
import { CreateRoomInput } from './dto/create-room.input'
import { UpdateRoomInput } from './dto/update-room.input'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { Room, RoomDocument } from '@app/room/entities/room.entity'

@Injectable()
export class RoomService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  async create(input: CreateRoomInput) {
    return this.roomModel.create({
      ...input,
      createdAt: Date.now()
    })
  }

  findAll() {
    return `This action returns all room`
  }

  findOne(id: number) {
    return `This action returns a #${id} room`
  }

  update(id: number, updateRoomInput: UpdateRoomInput) {
    return `This action updates a #${id} room`
  }

  remove(id: number) {
    return `This action removes a #${id} room`
  }
}
