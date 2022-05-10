import { Injectable } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { License, LicenseDocument } from '@app/license/entities/license.entity'
import { InjectModel } from '@nestjs/mongoose'
import { JwtService } from '@nestjs/jwt'

import { CreateLicenseInput } from './dto/create-license.input'
import { AuthenticationError } from "apollo-server-express";

@Injectable()
export class LicenseService {
  constructor(
    @InjectModel(License.name) private licenseModel: Model<LicenseDocument>,
    private jwtService: JwtService
  ) {}

  async create(input: CreateLicenseInput) {
    return this.licenseModel.create({
      ...input,
      createdAt: Date.now()
    })
  }

  async getLicenses(flter: object) {
    return this.licenseModel.find(flter)
  }

  async getOne(filter: object) {
    return this.licenseModel.findOne(filter)
  }

  async JWTVerify(id: Types.ObjectId): Promise<any> {
    return this.getOne({ _id: id })
  }

  async JWTGenerator(license: LicenseDocument) {
    const payload = {
      id: license.id,
      appID: license.appID
    }
    return this.jwtService.sign(payload)
  }

  async checkToken(token: string) {
    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(
          token.replace('Bearer ', '').trim()
        )
        const license = await this.JWTVerify(payload.id)
        if (license) {
          return license
        }
      } catch (e) {}
    }
  }
}
