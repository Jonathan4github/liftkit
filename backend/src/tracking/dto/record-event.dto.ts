import { IsIn, IsString, MaxLength } from 'class-validator';

export const EVENT_TYPES = ['view', 'click', 'add_to_cart'] as const;
export type EventTypeValue = (typeof EVENT_TYPES)[number];

export class RecordEventDto {
  @IsString()
  variantId: string;

  @IsString()
  @MaxLength(100)
  visitorId: string;

  @IsIn(EVENT_TYPES)
  type: EventTypeValue;
}