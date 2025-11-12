import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentsModule } from './assessments/assessments.module';
import { FrameworksModule } from './frameworks/frameworks.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const mongoUrl = configService.get<string>('MONGODB_URL') || process.env.MONGODB_URL || 'mongodb://mongodb:27017/assessment';
        console.log('Connecting to MongoDB:', mongoUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Log without credentials
        return {
          uri: mongoUrl,
          // Connection options for Docker
          retryWrites: true,
          w: 'majority',
          // Force direct connection to avoid replica set discovery issues
          directConnection: true,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        };
      },
      inject: [ConfigService],
    }),
    PrismaModule,
    EventsModule,
    FrameworksModule,
    AssessmentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

