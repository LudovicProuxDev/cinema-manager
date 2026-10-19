import type { FormErrors } from '../../forms/useForm'
import { checkRequiredText, withoutEmpty } from '../../forms/rules'
import type { Room, RoomRequest } from './roomsApi'

export type RoomFormValues = { name: string }

export const emptyRoomForm: RoomFormValues = { name: '' }

export function toRoomForm(room: Room): RoomFormValues {
  return { name: room.name }
}

export function validateRoom(values: RoomFormValues): FormErrors<RoomFormValues> {
  return withoutEmpty({ name: checkRequiredText(values.name, 50, 'Le nom') })
}

export function toRoomRequest(values: RoomFormValues): RoomRequest {
  return { name: values.name.trim() }
}
