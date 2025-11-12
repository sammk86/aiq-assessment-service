import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, JSONCodec } from 'nats';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private nc: NatsConnection;
  private jsonCodec = JSONCodec();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const natsUrl = this.configService.get<string>('NATS_URL', 'nats://nats:4222');
    this.nc = await connect({ servers: natsUrl });
  }

  async onModuleDestroy() {
    await this.nc.close();
  }

  async publish(subject: string, data: any) {
    const message = this.jsonCodec.encode(data);
    this.nc.publish(subject, message);
    await this.nc.flush();
  }

  async publishAssessmentCreated(assessmentId: string, organizationId: string) {
    await this.publish('assessment.created', {
      assessmentId,
      organizationId,
      timestamp: new Date().toISOString(),
    });
  }

  async publishAssessmentCompleted(assessmentId: string, organizationId: string) {
    await this.publish('assessment.completed', {
      assessmentId,
      organizationId,
      timestamp: new Date().toISOString(),
    });
  }

  async publishResponseSubmitted(
    assessmentId: string,
    questionId: string,
    userId: string,
  ) {
    await this.publish('response.submitted', {
      assessmentId,
      questionId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }
}

