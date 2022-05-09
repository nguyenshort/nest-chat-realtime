import { InputType, Int, Field } from '@nestjs/graphql'
import { IsNotEmpty, Max, Min, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

@InputType()
export class FilterOption {
  @Field(() => String, { description: 'Sắp xếp của bình luận' })
  @IsNotEmpty({ message: 'Sắp xếp là bắt buộc' })
  sort: string

  @Field(() => Int, { description: 'Số trang của bình luận' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Trang phải là số' })
  @Min(0, { message: 'Trang hiện tại quá nhỏ' })
  page: number

  @Field(() => Int, { description: 'Giới hạn một lần. Không quá 20' })
  @Type(() => Number)
  @IsNumber({}, { message: 'Giới hạn phải là số' })
  @Min(0, { message: 'Giới hạn quá nhỏ', always: false })
  @Max(20, { message: 'Giới hạn quá lớn' })
  limit: number

  skip() {
    return this.page * this.limit
  }

  constructor(partial: Partial<FilterOption>) {
    Object.assign(this, partial)
  }
}
