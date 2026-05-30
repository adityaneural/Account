import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { GstController } from './gst.controller';
import { GstService } from './gst.service';

@Module({
  imports: [IdentityModule],
  controllers: [GstController],
  providers: [GstService],
})
export class GstModule {}
