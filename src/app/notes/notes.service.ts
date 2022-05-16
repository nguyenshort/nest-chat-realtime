import { Injectable } from '@nestjs/common'
import { AttachService } from '@shared/attach/attach.service'

@Injectable()
export class NotesService extends AttachService {}
