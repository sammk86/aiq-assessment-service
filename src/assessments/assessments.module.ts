import { Module } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FrameworksModule } from '../frameworks/frameworks.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, FrameworksModule, EventsModule],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
  exports: [AssessmentsService],
})
export class AssessmentsModule {}

