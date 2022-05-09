import { ValidationError, ValidationPipe } from '@nestjs/common'
import { UserInputError } from 'apollo-server-express'

export class InputValidator extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const _errors = errors.reduce((rv, x) => {
          ;(rv[x.property] = rv[x.property] || []).push(x.constraints)
          return rv
        }, {} as ValidationError)
        return new UserInputError('Đầu vào không hợp lệ', _errors)
      }
    })
  }
}
