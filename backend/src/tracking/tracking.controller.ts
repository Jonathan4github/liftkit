import { Body, Controller, Param, Post } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { AssignDto } from './dto/assign.dto';
import { RecordEventDto } from './dto/record-event.dto';

@Controller('public')
export class TrackingController {
  constructor(private readonly tracking: TrackingService) {}

  @Post('products/:productId/assign')
  assign(@Param('productId') productId: string, @Body() dto: AssignDto) {
    return this.tracking.assign(productId, dto.visitorId);
  }

  @Post('events')
  recordEvent(@Body() dto: RecordEventDto) {
    return this.tracking.recordEvent(dto.variantId, dto.visitorId, dto.type);
  }
}