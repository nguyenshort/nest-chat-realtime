import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Attach } from '@shared/attach/entities/attach.entity'

export type FileDocument = File & Document

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
export class File extends Attach {
  @Prop()
  @Field(() => String)
  file: string
}

export const FileEntity = SchemaFactory.createForClass(File)
