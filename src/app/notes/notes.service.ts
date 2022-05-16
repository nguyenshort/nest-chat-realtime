import { Injectable } from '@nestjs/common'
import { AttachService } from '@shared/attach/attach.service'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Note, NoteDocument } from '@app/notes/entities/note.entity'

@Injectable()
export class NotesService extends AttachService {
  constructor(@InjectModel(Note.name) model: Model<NoteDocument>) {
    super(model)
  }
}
