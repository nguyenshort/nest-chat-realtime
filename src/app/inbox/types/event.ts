import { AttachDocument } from '@shared/attach/entities/attach.entity'

export interface IInboxAdded {
  attach: AttachDocument
  type: string
}

export enum InboxEventEnum {
  ADD = 'inbox:added'
}
