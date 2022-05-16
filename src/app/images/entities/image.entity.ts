import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Attach } from '@shared/attach/entities/attach.entity'

export type ImageDocument = Image & Document

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
export class Image extends Attach {
  @Prop()
  @Field(() => [String])
  images: string[]
}

export const ImageEntity = SchemaFactory.createForClass(Image)
