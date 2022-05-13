import { RoomDocument } from '@app/room/entities/room.entity'
import { LicenseDocument } from '@app/license/entities/license.entity'

export class CacheKey {
  static roomOnlines(room: RoomDocument) {
    return `${room.license.appID}_room-onlines_${room.id}`
  }

  static appOnlines(license: LicenseDocument) {
    return `${license.appID}_online`
  }
}
