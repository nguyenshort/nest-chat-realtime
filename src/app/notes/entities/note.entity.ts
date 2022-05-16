import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Attach } from '@shared/attach/entities/attach.entity'

export type NoteDocument = File & Document

@Schema({
  toJSON: {
    virtuals: true,
    getters: true
  },
  toObject: {
    virtuals: true,
    getters: true
  }
})
@ObjectType()
export class Note extends Attach {
  @Prop()
  @Field(() => String)
  note: string
}

export const NoteEntity = SchemaFactory.createForClass(Note)
