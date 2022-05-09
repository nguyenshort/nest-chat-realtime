import { InputType, Field } from '@nestjs/graphql'
import { IsNotEmpty, MinLength } from 'class-validator'

@InputType()
export class CreateLicenseInput {
  @Field(() => String, { description: 'Mã định danh app' })
  @IsNotEmpty({ message: 'Tên app không được để trống' })
  @MinLength(5, { message: 'Tên app tối thiểu 5 chữ' })
  appID: string
}
