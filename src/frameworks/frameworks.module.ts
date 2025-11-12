import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { FrameworksService } from './frameworks.service'
import { FrameworksController } from './frameworks.controller'
import { Framework, FrameworkSchema } from '../schemas/framework.schema'
import { FrameworkImportService, IMPORT_PREVIEW_STORE, RedisImportPreviewStore } from './frameworks-import.service'
import Redis from 'ioredis'

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Framework.name, schema: FrameworkSchema }]),
  ],
  controllers: [FrameworksController],
  providers: [
    FrameworksService,
    FrameworkImportService,
    {
      provide: IMPORT_PREVIEW_STORE,
      useFactory: (configService: ConfigService) => {
        const redisUrl =
          configService.get<string>('REDIS_URL') || process.env.REDIS_URL || 'redis://redis:6379'
        const redis = new Redis(redisUrl)
        redis.on('error', (error) => {
          console.error('Redis error (framework import preview store):', error)
        })
        return new RedisImportPreviewStore(redis)
      },
      inject: [ConfigService],
    },
  ],
  exports: [FrameworksService, FrameworkImportService],
})
export class FrameworksModule {}
